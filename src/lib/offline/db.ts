import type {
  OfflineOrder,
  OfflineCatalogItem,
  OfflineCategory,
  OfflineCafeSettings,
  OfflineReceiptTemplateConfig,
  OfflineCustomer,
} from './types';

const DB_NAME = 'radhacafe-pos';
const DB_VERSION = 2;

export const STORES = {
  OFFLINE_ORDERS: 'offline_orders',
  CATALOG_SNAPSHOT: 'catalog_snapshot',
  CATEGORIES_SNAPSHOT: 'categories_snapshot',
  CAFE_SETTINGS_SNAPSHOT: 'cafe_settings_snapshot',
  RECEIPT_TEMPLATE_SNAPSHOT: 'receipt_template_snapshot',
  CUSTOMERS_CACHE: 'customers_cache',
  SYNC_META: 'sync_meta',
  PRINT_QUEUE: 'print_queue',
} as const;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes and opens the IndexedDB database instance with typed schema migrations
 */
export function getOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Offline Orders Store
      if (!db.objectStoreNames.contains(STORES.OFFLINE_ORDERS)) {
        const orderStore = db.createObjectStore(STORES.OFFLINE_ORDERS, {
          keyPath: 'client_order_id',
        });
        orderStore.createIndex('sync_status', 'sync_status', { unique: false });
        orderStore.createIndex('offline_created_at', 'offline_created_at', { unique: false });
        orderStore.createIndex('offline_reference', 'offline_reference', { unique: true });
      }

      // 2. Catalog Snapshot Store
      if (!db.objectStoreNames.contains(STORES.CATALOG_SNAPSHOT)) {
        const catalogStore = db.createObjectStore(STORES.CATALOG_SNAPSHOT, { keyPath: 'id' });
        catalogStore.createIndex('category_id', 'category_id', { unique: false });
      }

      // 3. Categories Snapshot Store
      if (!db.objectStoreNames.contains(STORES.CATEGORIES_SNAPSHOT)) {
        db.createObjectStore(STORES.CATEGORIES_SNAPSHOT, { keyPath: 'id' });
      }

      // 4. Cafe Settings Store
      if (!db.objectStoreNames.contains(STORES.CAFE_SETTINGS_SNAPSHOT)) {
        db.createObjectStore(STORES.CAFE_SETTINGS_SNAPSHOT, { keyPath: 'id' });
      }

      // 5. Active Receipt Template Store
      if (!db.objectStoreNames.contains(STORES.RECEIPT_TEMPLATE_SNAPSHOT)) {
        db.createObjectStore(STORES.RECEIPT_TEMPLATE_SNAPSHOT, { keyPath: 'id' });
      }

      // 6. Customers Snapshot Store
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS_CACHE)) {
        const custStore = db.createObjectStore(STORES.CUSTOMERS_CACHE, { keyPath: 'id' });
        custStore.createIndex('phone', 'phone', { unique: false });
      }

      // 7. Sync Metadata Store
      if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
        db.createObjectStore(STORES.SYNC_META, { keyPath: 'key' });
      }

      // 8. Background Print Queue Store
      if (!db.objectStoreNames.contains(STORES.PRINT_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.PRINT_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('created_at', 'created_at', { unique: false });
        queueStore.createIndex('priority', 'priority', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });

  return dbPromise;
}

// -------------------------------------------------------------
// GENERIC HELPERS
// -------------------------------------------------------------

async function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let req: IDBRequest<T> | void;
    try {
      req = callback(store);
    } catch (err) {
      return reject(err);
    }

    transaction.oncomplete = () => {
      resolve(req ? req.result : (undefined as unknown as T));
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error(`IndexedDB transaction error on ${storeName}`));
    };
  });
}

// -------------------------------------------------------------
// OFFLINE ORDERS API
// -------------------------------------------------------------

export async function idbSaveOfflineOrder(order: OfflineOrder): Promise<void> {
  await runTransaction(STORES.OFFLINE_ORDERS, 'readwrite', (store) => {
    store.put(order);
  });
}

export async function idbGetOfflineOrder(clientOrderId: string): Promise<OfflineOrder | null> {
  return runTransaction(STORES.OFFLINE_ORDERS, 'readonly', (store) => {
    return store.get(clientOrderId);
  }).then((res) => res || null);
}

export async function idbGetAllOfflineOrders(): Promise<OfflineOrder[]> {
  return runTransaction<OfflineOrder[]>(STORES.OFFLINE_ORDERS, 'readonly', (store) => {
    return store.getAll();
  }).then((res) => res || []);
}

export async function idbGetPendingOfflineOrders(includeFailed = false): Promise<OfflineOrder[]> {
  const all = await idbGetAllOfflineOrders();
  return all
    .filter((o) => o.sync_status === 'pending' || (includeFailed && o.sync_status === 'failed'))
    .sort((a, b) => new Date(a.offline_created_at).getTime() - new Date(b.offline_created_at).getTime());
}

export async function idbUpdateOfflineOrderStatus(
  clientOrderId: string,
  updates: Partial<OfflineOrder>
): Promise<void> {
  const existing = await idbGetOfflineOrder(clientOrderId);
  if (!existing) return;

  const merged: OfflineOrder = {
    ...existing,
    ...updates,
  };

  await idbSaveOfflineOrder(merged);
}

export async function idbCancelOfflineOrder(clientOrderId: string): Promise<OfflineOrder | null> {
  const existing = await idbGetOfflineOrder(clientOrderId);
  if (!existing) return null;

  existing.status = 'cancelled';
  await idbSaveOfflineOrder(existing);
  return existing;
}

// -------------------------------------------------------------
// CATALOG & CAFE SNAPSHOTS API
// -------------------------------------------------------------

export async function idbSaveCatalogSnapshot(
  items: OfflineCatalogItem[],
  categories: OfflineCategory[]
): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.CATALOG_SNAPSHOT, STORES.CATEGORIES_SNAPSHOT], 'readwrite');
    const itemStore = tx.objectStore(STORES.CATALOG_SNAPSHOT);
    const catStore = tx.objectStore(STORES.CATEGORIES_SNAPSHOT);

    itemStore.clear();
    for (const item of items) {
      itemStore.put(item);
    }

    catStore.clear();
    for (const cat of categories) {
      catStore.put(cat);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetCatalogSnapshot(): Promise<{
  items: OfflineCatalogItem[];
  categories: OfflineCategory[];
}> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.CATALOG_SNAPSHOT, STORES.CATEGORIES_SNAPSHOT], 'readonly');
    const itemStore = tx.objectStore(STORES.CATALOG_SNAPSHOT);
    const catStore = tx.objectStore(STORES.CATEGORIES_SNAPSHOT);

    const itemsReq = itemStore.getAll();
    const catsReq = catStore.getAll();

    tx.oncomplete = () => {
      resolve({
        items: itemsReq.result || [],
        categories: catsReq.result || [],
      });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbSaveCafeSettings(settings: OfflineCafeSettings): Promise<void> {
  await runTransaction(STORES.CAFE_SETTINGS_SNAPSHOT, 'readwrite', (store) => {
    store.put({ id: 'primary', ...settings });
  });
}

export async function idbGetCafeSettings(): Promise<OfflineCafeSettings | null> {
  return runTransaction(STORES.CAFE_SETTINGS_SNAPSHOT, 'readonly', (store) => {
    return store.get('primary');
  }).then((res) => res || null);
}

export async function idbSaveReceiptTemplate(template: OfflineReceiptTemplateConfig): Promise<void> {
  await runTransaction(STORES.RECEIPT_TEMPLATE_SNAPSHOT, 'readwrite', (store) => {
    store.put(template);
  });
}

export async function idbGetReceiptTemplate(): Promise<OfflineReceiptTemplateConfig | null> {
  const all = await runTransaction<OfflineReceiptTemplateConfig[]>(
    STORES.RECEIPT_TEMPLATE_SNAPSHOT,
    'readonly',
    (store) => store.getAll()
  );
  return all?.[0] || null;
}

export async function idbSaveCustomers(customers: OfflineCustomer[]): Promise<void> {
  const db = await getOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CUSTOMERS_CACHE, 'readwrite');
    const store = tx.objectStore(STORES.CUSTOMERS_CACHE);
    store.clear();
    for (const c of customers) {
      store.put(c);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetCustomers(): Promise<OfflineCustomer[]> {
  return runTransaction<OfflineCustomer[]>(STORES.CUSTOMERS_CACHE, 'readonly', (store) => {
    return store.getAll();
  }).then((res) => res || []);
}

// -------------------------------------------------------------
// METADATA & LOCKS API
// -------------------------------------------------------------

export async function idbSetMeta(key: string, value: any): Promise<void> {
  await runTransaction(STORES.SYNC_META, 'readwrite', (store) => {
    store.put({ key, value, updated_at: new Date().toISOString() });
  });
}

export async function idbGetMeta<T = any>(key: string): Promise<T | null> {
  return runTransaction<{ key: string; value: T }>(STORES.SYNC_META, 'readonly', (store) => {
    return store.get(key);
  }).then((res) => (res ? res.value : null));
}

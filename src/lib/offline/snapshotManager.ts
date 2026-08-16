import {
  idbSaveCatalogSnapshot,
  idbSaveCafeSettings,
  idbSaveReceiptTemplate,
  idbSaveCustomers,
  idbGetCatalogSnapshot,
  idbGetCafeSettings,
  idbGetReceiptTemplate,
  idbSetMeta,
  idbGetMeta,
} from './db';
import type {
  OfflineCatalogItem,
  OfflineCategory,
  OfflineCafeSettings,
  OfflineReceiptTemplateConfig,
  OfflineCustomer,
  OfflineReadinessStatus,
} from './types';
import { supabase } from '../supabase/client';

const LAST_SNAPSHOT_KEY = 'last_catalog_snapshot_timestamp';

/**
 * Updates offline catalog snapshot from Supabase data
 */
export async function syncOnlineCatalogToIndexedDB(
  menuItems: any[],
  categories: any[]
): Promise<void> {
  if (!menuItems?.length) return;

  const catalogItems: OfflineCatalogItem[] = menuItems.map((item) => ({
    id: item.id,
    category_id: item.category_id,
    name: item.name,
    description: item.description || null,
    price: Number(item.price || 0),
    image_url: item.image_url || null,
    is_available: item.is_available ?? true,
    category_name: item.categories?.name || item.category_name,
    is_best_seller: Boolean(item.is_best_seller),
    is_today_special: Boolean(item.is_today_special),
    is_popular: Boolean(item.is_popular),
  }));

  const catItems: OfflineCategory[] = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || null,
    display_order: Number(cat.display_order || 0),
  }));

  await idbSaveCatalogSnapshot(catalogItems, catItems);
  await idbSetMeta(LAST_SNAPSHOT_KEY, new Date().toISOString());
}

/**
 * Updates offline cafe settings in IndexedDB
 */
export async function syncOnlineCafeSettingsToIndexedDB(settings: any): Promise<void> {
  if (!settings) return;

  const offlineSettings: OfflineCafeSettings = {
    cafe_name: settings.cafe_name || 'RadhaCafe',
    tagline: settings.tagline || null,
    address: settings.address || null,
    phone: settings.phone || null,
    logo_url: settings.logo_url || null,
    receipt_logo_url: settings.receipt_logo_url || null,
    tax_percentage: Number(settings.tax_percentage ?? 5),
    currency: settings.currency || 'INR',
    last_synced_at: new Date().toISOString(),
  };

  await idbSaveCafeSettings(offlineSettings);
}

/**
 * Updates offline active receipt template in IndexedDB
 */
export async function syncOnlineReceiptTemplateToIndexedDB(template: any): Promise<void> {
  if (!template) return;

  const offlineTemplate: OfflineReceiptTemplateConfig = {
    id: template.id || 'active',
    name: template.name || 'Classic Receipt',
    template_config: template.template_config,
    last_synced_at: new Date().toISOString(),
  };

  await idbSaveReceiptTemplate(offlineTemplate);
}

/**
 * Updates offline customers cache in IndexedDB
 */
export async function syncOnlineCustomersToIndexedDB(customers: any[]): Promise<void> {
  if (!customers?.length) return;

  const offlineCust: OfflineCustomer[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    total_due: Number(c.total_due || c.due_amount || 0),
    last_synced_at: new Date().toISOString(),
  }));

  await idbSaveCustomers(offlineCust);
}

/**
 * Performs a comprehensive snapshot fetch from Supabase if online
 */
export async function refreshAllOfflineSnapshots(): Promise<boolean> {
  try {
    const [menuRes, catRes, setRes, tmplRes, custRes] = await Promise.all([
      (supabase as any).from('menu_items').select('*, categories(name)').eq('is_available', true),
      (supabase as any).from('categories').select('*').order('display_order', { ascending: true }),
      (supabase as any).from('cafe_settings').select('*').limit(1).maybeSingle(),
      (supabase as any).from('receipt_templates').select('*').eq('is_active', true).limit(1).maybeSingle(),
      (supabase as any).from('customers').select('id, name, phone').eq('is_active', true).limit(200),
    ]);

    if (menuRes.data && catRes.data) {
      await syncOnlineCatalogToIndexedDB(menuRes.data, catRes.data);
    }
    if (setRes.data) {
      await syncOnlineCafeSettingsToIndexedDB(setRes.data);
    }
    if (tmplRes.data) {
      await syncOnlineReceiptTemplateToIndexedDB(tmplRes.data);
    }
    if (custRes.data) {
      await syncOnlineCustomersToIndexedDB(custRes.data);
    }

    return true;
  } catch (err) {
    console.warn('[OfflineSnapshot] Snapshot refresh skipped or failed:', err);
    return false;
  }
}

/**
 * Evaluates the offline readiness status of the application
 */
export async function checkOfflineReadiness(): Promise<OfflineReadinessStatus> {
  try {
    const { items, categories } = await idbGetCatalogSnapshot();
    const settings = await idbGetCafeSettings();
    const template = await idbGetReceiptTemplate();
    const lastSnapshot = await idbGetMeta<string>(LAST_SNAPSHOT_KEY);

    const isReady = items.length > 0 && settings !== null;

    return {
      isReady,
      catalogItemsCount: items.length,
      categoriesCount: categories.length,
      hasCafeSettings: settings !== null,
      hasReceiptTemplate: template !== null,
      lastSnapshotAt: lastSnapshot,
    };
  } catch {
    return {
      isReady: false,
      catalogItemsCount: 0,
      categoriesCount: 0,
      hasCafeSettings: false,
      hasReceiptTemplate: false,
      lastSnapshotAt: null,
    };
  }
}

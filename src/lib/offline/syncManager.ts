import { syncOfflineOrder } from '../supabase/queries/orders';
import {
  idbGetPendingOfflineOrders,
  idbUpdateOfflineOrderStatus,
  idbSetMeta,
} from './db';
import { connectivityManager } from './connectivity';
import type { OfflineOrder, SyncProgressUpdate } from './types';

type SyncProgressListener = (progress: SyncProgressUpdate) => void;
type SyncStatusListener = (isSyncing: boolean) => void;

class SyncManager {
  private isSyncing = false;
  private progressListeners: Set<SyncProgressListener> = new Set();
  private statusListeners: Set<SyncStatusListener> = new Set();
  private queryClientInvalidator: (() => void) | null = null;

  public setQueryClientInvalidator(invalidator: () => void) {
    this.queryClientInvalidator = invalidator;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public subscribeStatus(listener: SyncStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isSyncing);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeProgress(listener: SyncProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => {
      this.progressListeners.delete(listener);
    };
  }

  private notifyProgress(progress: SyncProgressUpdate) {
    this.progressListeners.forEach((listener) => {
      try {
        listener(progress);
      } catch (err) {
        console.error('[SyncManager] Listener error:', err);
      }
    });
  }

  private notifyStatus(syncing: boolean) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(syncing);
      } catch (err) {
        console.error('[SyncManager] Status listener error:', err);
      }
    });
  }

  /**
   * Main synchronization execution loop
   */
  public async syncPendingOrders(forceIncludeFailed = false): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0 };
    }

    const isConnected = await connectivityManager.checkConnectivity();
    if (!isConnected) {
      return { syncedCount: 0, failedCount: 0 };
    }

    const pendingOrders = await idbGetPendingOfflineOrders(forceIncludeFailed);
    if (pendingOrders.length === 0) {
      return { syncedCount: 0, failedCount: 0 };
    }

    this.isSyncing = true;
    this.notifyStatus(true);

    let syncedCount = 0;
    let failedCount = 0;
    const total = pendingOrders.length;

    try {
      for (let i = 0; i < pendingOrders.length; i++) {
        const order = pendingOrders[i];

        this.notifyProgress({
          total,
          completed: i,
          currentReference: order.offline_reference,
          failedCount,
        });

        // Set status to syncing in IndexedDB
        await idbUpdateOfflineOrderStatus(order.client_order_id, {
          sync_status: 'syncing',
        });

        try {
          const syncedOrder = await this.uploadOfflineOrder(order);
          if (syncedOrder) {
            await idbUpdateOfflineOrderStatus(order.client_order_id, {
              sync_status: 'synced',
              canonical_order_id: syncedOrder.id,
              canonical_order_number: syncedOrder.order_number,
              synced_at: new Date().toISOString(),
              last_sync_error: null,
            });
            syncedCount++;
          } else {
            failedCount++;
            await idbUpdateOfflineOrderStatus(order.client_order_id, {
              sync_status: 'failed',
              last_sync_error: 'Unable to synchronize order payload.',
            });
          }
        } catch (err: any) {
          failedCount++;
          const isNetworkErr =
            err?.message?.includes('Failed to fetch') ||
            err?.message?.includes('NetworkError') ||
            err?.message?.includes('network');

          await idbUpdateOfflineOrderStatus(order.client_order_id, {
            sync_status: isNetworkErr ? 'pending' : 'failed',
            last_sync_error: err?.message || 'Synchronization failed.',
          });

          if (isNetworkErr) {
            connectivityManager.setStatus('offline');
            break;
          }
        }
      }

      await idbSetMeta('last_successful_sync_timestamp', new Date().toISOString());

      this.notifyProgress({
        total,
        completed: total,
        failedCount,
      });

      // Invalidate live TanStack queries so UI updates immediately
      if (this.queryClientInvalidator) {
        this.queryClientInvalidator();
      }

      return { syncedCount, failedCount };
    } finally {
      this.isSyncing = false;
      this.notifyStatus(false);
    }
  }

  /**
   * Uploads a single offline order record to Supabase
   * Supports dedicated sync_offline_order RPC with fallback to direct table insertion
   */
  private async uploadOfflineOrder(order: OfflineOrder): Promise<any> {
    return syncOfflineOrder({
      client_order_id: order.client_order_id,
      offline_reference: order.offline_reference,
      offline_created_at: order.offline_created_at,
      customer_name: order.customer_name,
      items: order.items,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      discount_amount: order.discount_amount,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      customer_id: order.customer_id || null,
      is_printed: Boolean(order.is_printed),
    });
  }
}

export const syncManager = new SyncManager();

import { useState, useEffect } from 'react';
import { useOfflinePOS } from '../../../providers/OfflineProvider';
import { idbGetAllOfflineOrders } from '../../../lib/offline/db';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CloudSavingDone02Icon,
  RefreshIcon,
  Loading03Icon,
  Download01Icon,
  Database01Icon,
  Invoice01Icon,
} from '@hugeicons/core-free-icons';
import type { OfflineOrder } from '../../../lib/offline/types';

export function OfflineSyncSettings() {
  const {
    isOffline,
    isSyncing,
    pendingCount,
    readiness,
    syncNow,
    refreshSnapshots,
  } = useOfflinePOS();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>([]);

  const loadOrders = async () => {
    try {
      const orders = await idbGetAllOfflineOrders();
      setOfflineOrders(
        orders.sort(
          (a, b) => new Date(b.offline_created_at).getTime() - new Date(a.offline_created_at).getTime()
        )
      );
    } catch {
      // IndexedDB error
    }
  };

  useEffect(() => {
    loadOrders();
  }, [pendingCount, isSyncing]);

  const handleManualSync = async () => {
    try {
      const result = await syncNow();
      if (result.syncedCount > 0) {
        toast.add({
          title: 'Sync Complete',
          description: `Successfully synchronized ${result.syncedCount} order${result.syncedCount > 1 ? 's' : ''} to Supabase.`,
          type: 'success',
        });
      } else if (result.failedCount > 0) {
        toast.add({
          title: 'Sync Notice',
          description: `${result.failedCount} order(s) could not be synchronized. Check connection and retry.`,
          type: 'warning',
        });
      } else {
        toast.add({
          title: 'All Caught Up',
          description: 'No pending offline orders found.',
          type: 'info',
        });
      }
      loadOrders();
    } catch (err: any) {
      toast.add({
        title: 'Sync Failed',
        description: err.message || 'Unable to sync offline orders.',
        type: 'error',
      });
    }
  };

  const handleRefreshSnapshots = async () => {
    setIsRefreshing(true);
    try {
      await refreshSnapshots();
      toast.add({
        title: 'Snapshots Updated',
        description: 'Menu catalog, categories, and cafe calculation settings refreshed for offline use.',
        type: 'success',
      });
    } catch {
      toast.add({
        title: 'Refresh Failed',
        description: 'Unable to refresh offline snapshots.',
        type: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportBackup = () => {
    if (offlineOrders.length === 0) {
      toast.add({
        title: 'No Data',
        description: 'No offline orders to export.',
        type: 'info',
      });
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(offlineOrders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `radhacafe_offline_orders_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.add({
      title: 'Backup Exported',
      description: `Exported ${offlineOrders.length} offline order records to JSON.`,
      type: 'success',
    });
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden w-full min-w-0">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
              <HugeiconsIcon icon={CloudSavingDone02Icon} size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground break-words leading-tight">
                Offline POS & Power-Cut Mode
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 leading-relaxed">
                Take orders during internet outages or electricity cuts with automatic synchronization.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshSnapshots}
              disabled={isRefreshing || isOffline}
              className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
            >
              <HugeiconsIcon icon={RefreshIcon} size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Snapshot'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing || isOffline || pendingCount === 0}
              className="h-8.5 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 shadow-2xs"
            >
              {isSyncing ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CloudSavingDone02Icon} size={13} />
                  <span>Sync Now {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
        {/* Offline Readiness Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">Catalog Snapshot</span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0 h-4">
                Ready
              </Badge>
            </div>
            <p className="font-bold text-sm text-foreground">
              {readiness?.catalogItemsCount || 0} Items
            </p>
            <p className="text-[10px] text-muted-foreground">
              {readiness?.categoriesCount || 0} categories cached
            </p>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">Calculation Settings</span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0 h-4">
                Ready
              </Badge>
            </div>
            <p className="font-bold text-sm text-foreground">Tax & Receipt</p>
            <p className="text-[10px] text-muted-foreground">
              {readiness?.hasReceiptTemplate ? 'Active template cached' : 'Defaults cached'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">Pending Orders</span>
              <Badge
                variant="outline"
                className={`text-[9px] font-bold px-1.5 py-0 h-4 ${
                  pendingCount > 0
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                    : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {pendingCount > 0 ? 'Needs Sync' : 'Synced'}
              </Badge>
            </div>
            <p className="font-bold text-sm text-foreground">
              {pendingCount} Order{pendingCount === 1 ? '' : 's'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Stored locally on this device
            </p>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/60 flex items-start gap-2.5">
          <HugeiconsIcon icon={Database01Icon} size={16} className="text-cinnamon shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="font-semibold text-foreground text-xs">
              Device-Local IndexedDB Storage
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              When electricity or internet disconnects, RadhaCafe automatically switches to Offline Mode.
              Orders are created transactionally on this device, receipts can be printed to battery/UPS powered Bluetooth printers, and all records sync safely to Supabase when connectivity returns.
            </p>
          </div>
        </div>

        {/* Local Orders Log Table */}
        {offlineOrders.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Invoice01Icon} size={14} className="text-muted-foreground" />
                <span className="font-bold text-xs text-foreground">Recent Local Offline Orders</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExportBackup}
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              >
                <HugeiconsIcon icon={Download01Icon} size={12} />
                <span>Export Backup (JSON)</span>
              </Button>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
              <div className="max-h-48 overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground text-[10px] font-bold uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-2 pl-3">Reference</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Time</th>
                      <th className="p-2 text-right pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-[11px]">
                    {offlineOrders.slice(0, 10).map((ord) => (
                      <tr key={ord.client_order_id} className="hover:bg-secondary/20">
                        <td className="p-2 pl-3 font-mono font-bold text-primary">
                          {ord.canonical_order_number || ord.offline_reference}
                        </td>
                        <td className="p-2 font-medium text-foreground truncate max-w-[120px]">
                          {ord.customer_name}
                        </td>
                        <td className="p-2 font-bold font-mono">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {formatDate(ord.offline_created_at)}
                        </td>
                        <td className="p-2 text-right pr-3">
                          {ord.sync_status === 'synced' ? (
                            <Badge className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0 h-4">
                              Synced
                            </Badge>
                          ) : ord.sync_status === 'syncing' ? (
                            <Badge variant="outline" className="border-blue-500/40 text-blue-600 font-bold text-[9px] px-1.5 py-0 h-4 animate-pulse">
                              Syncing
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-[9px] px-1.5 py-0 h-4">
                              Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

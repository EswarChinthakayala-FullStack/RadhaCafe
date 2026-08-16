import { useOfflinePOS } from '../../../providers/OfflineProvider';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  WifiDisconnected01Icon,
  RefreshIcon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  CloudSavingDone02Icon,
} from '@hugeicons/core-free-icons';

export function OfflineStatusBar() {
  const {
    isOffline,
    isSyncing,
    isOnline,
    pendingCount,
    progress,
    syncNow,
  } = useOfflinePOS();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`shrink-0 px-3 sm:px-4 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2.5 transition-colors shadow-2xs ${
        isOffline
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-950 dark:text-amber-200'
          : isSyncing
          ? 'bg-blue-500/15 border-blue-500/30 text-blue-950 dark:text-blue-200'
          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
      }`}
    >
      {/* Left side: Icon + Message */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="shrink-0">
          {isOffline ? (
            <HugeiconsIcon icon={WifiDisconnected01Icon} size={16} className="text-amber-600 dark:text-amber-400" />
          ) : isSyncing ? (
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <HugeiconsIcon icon={CloudSavingDone02Icon} size={16} className="text-emerald-600 dark:text-emerald-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs">
            {isOffline
              ? 'Offline Mode'
              : isSyncing
              ? 'Syncing Offline Orders...'
              : 'Connection Restored'}
          </span>
          <span className="text-[11px] opacity-90 hidden sm:inline truncate">
            {isOffline
              ? 'Internet is unavailable. Orders are saved safely on this device and will sync automatically.'
              : isSyncing
              ? progress
                ? `Uploaded ${progress.completed} of ${progress.total} orders to Supabase`
                : `Uploading ${pendingCount} offline orders...`
              : `${pendingCount} offline order${pendingCount > 1 ? 's' : ''} ready to sync to Supabase.`}
          </span>
        </div>
      </div>

      {/* Right side: Badge + Sync Now button */}
      <div className="flex items-center gap-2 shrink-0">
        {pendingCount > 0 && (
          <Badge
            variant="outline"
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isOffline
                ? 'border-amber-600/40 bg-amber-600/10 text-amber-800 dark:text-amber-300'
                : 'border-blue-600/40 bg-blue-600/10 text-blue-800 dark:text-blue-300'
            }`}
          >
            {pendingCount} order{pendingCount > 1 ? 's' : ''} waiting to sync
          </Badge>
        )}

        {isOnline && pendingCount > 0 && !isSyncing && (
          <Button
            type="button"
            size="sm"
            onClick={() => syncNow()}
            className="h-6 px-2 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-md shadow-2xs"
          >
            <HugeiconsIcon icon={RefreshIcon} size={11} />
            <span>Sync Now</span>
          </Button>
        )}

        {isOnline && pendingCount === 0 && (
          <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 gap-1 rounded-md">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
            <span>All Synced</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

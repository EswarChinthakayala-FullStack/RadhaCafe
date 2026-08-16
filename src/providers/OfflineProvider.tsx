import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectivityManager } from '../lib/offline/connectivity';
import { syncManager } from '../lib/offline/syncManager';
import {
  refreshAllOfflineSnapshots,
  checkOfflineReadiness,
} from '../lib/offline/snapshotManager';
import {
  getPendingOfflineOrdersCount,
  createOfflineOrder,
  type CreateOfflineOrderParams,
} from '../lib/offline/offlineOrderService';
import type {
  ConnectivityStatus,
  OfflineOrder,
  OfflineReadinessStatus,
  SyncProgressUpdate,
} from '../lib/offline/types';

interface OfflineContextValue {
  connectivityStatus: ConnectivityStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  progress: SyncProgressUpdate | null;
  readiness: OfflineReadinessStatus | null;
  syncNow: () => Promise<{ syncedCount: number; failedCount: number }>;
  saveOfflineOrder: (params: CreateOfflineOrderParams) => Promise<OfflineOrder>;
  refreshSnapshots: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>(() =>
    connectivityManager.getStatus()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(() => syncManager.getIsSyncing());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [progress, setProgress] = useState<SyncProgressUpdate | null>(null);
  const [readiness, setReadiness] = useState<OfflineReadinessStatus | null>(null);

  const prevStatusRef = useRef<ConnectivityStatus>(connectivityManager.getStatus());

  // Connect syncManager query invalidations
  useEffect(() => {
    syncManager.setQueryClientInvalidator(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderOperationalSummary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      updatePendingCount();
    });
  }, [queryClient]);

  const updatePendingCount = async () => {
    try {
      const count = await getPendingOfflineOrdersCount();
      setPendingCount(count);
    } catch {
      // IndexedDB might not be initialized yet
    }
  };

  const updateReadiness = async () => {
    try {
      const status = await checkOfflineReadiness();
      setReadiness(status);
    } catch {
      // Ignored
    }
  };

  // Subscribe to connectivity and sync changes
  useEffect(() => {
    const unsubStatus = syncManager.subscribeStatus((syncing) => {
      setIsSyncing(syncing);
      updatePendingCount();
    });

    const unsubProgress = syncManager.subscribeProgress((p) => {
      setProgress(p);
      updatePendingCount();
    });

    const unsubConnectivity = connectivityManager.subscribe(async (status) => {
      const prev = prevStatusRef.current;
      prevStatusRef.current = status;
      setConnectivityStatus(status);

      if (status === 'online' && (prev === 'offline' || prev === 'recovering' || prev === 'checking')) {
        // Trigger background snapshot refresh & sync pending orders
        try {
          await refreshAllOfflineSnapshots();
          await updateReadiness();
          await syncManager.syncPendingOrders(false);
          await updatePendingCount();
        } catch {
          // Handled inside managers
        }
      }
    });

    // Initial snapshot & count update
    updatePendingCount();
    updateReadiness();
    refreshAllOfflineSnapshots().then(updateReadiness).catch(() => {});

    // Periodic check on focus/visibility
    const handleFocus = () => {
      connectivityManager.scheduleCheck();
      updatePendingCount();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsubStatus();
      unsubProgress();
      unsubConnectivity();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const syncNow = async () => {
    const result = await syncManager.syncPendingOrders(true);
    await updatePendingCount();
    return result;
  };

  const saveOfflineOrder = async (params: CreateOfflineOrderParams) => {
    const order = await createOfflineOrder(params);
    await updatePendingCount();
    return order;
  };

  const refreshSnapshots = async () => {
    await refreshAllOfflineSnapshots();
    await updateReadiness();
  };

  const isOnline = connectivityStatus === 'online';
  const isOffline = connectivityStatus === 'offline';

  return (
    <OfflineContext.Provider
      value={{
        connectivityStatus,
        isOnline,
        isOffline,
        isSyncing,
        pendingCount,
        progress,
        readiness,
        syncNow,
        saveOfflineOrder,
        refreshSnapshots,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflinePOS(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error('useOfflinePOS must be used within an OfflineProvider.');
  }
  return ctx;
}

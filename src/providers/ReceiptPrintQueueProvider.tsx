import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { printQueueWorker } from '../lib/printer/printQueueWorker';
import { usePrintQueueStore } from '../store/printQueueStore';
import { PrintQueueDock } from '../components/printer/PrintQueueDock';
import { PrintQueueSheet } from '../components/printer/PrintQueueSheet';
import type {
  PrintJob,
  PrintJobDataSnapshot,
  PrintJobType,
} from '../types/printQueue.types';

interface ReceiptPrintQueueContextValue {
  jobs: PrintJob[];
  activeJob: PrintJob | null;
  activeTearJob: PrintJob | null;
  waitingCount: number;
  needsAttentionCount: number;
  completedCount: number;
  totalActiveCount: number;
  isExpanded: boolean;
  isSheetOpen: boolean;
  isPausedForTear: boolean;
  hasUnseenAttention: boolean;
  tearCountdownRemaining: number;
  nextPrintAllowedAt: number | null;

  enqueueOrderReceipt: (
    order: any,
    templateConfig?: any,
    cafeSettings?: any
  ) => Promise<PrintJob>;
  enqueueReprint: (
    order: any,
    templateConfig?: any,
    cafeSettings?: any
  ) => Promise<PrintJob>;
  enqueueTestPrint: (
    templateConfig?: any,
    cafeSettings?: any
  ) => Promise<PrintJob>;

  retryJob: (id: string) => Promise<void>;
  markJobDone: (id: string) => Promise<void>;
  cancelJob: (id: string) => Promise<void>;
  continueAfterTear: () => void;
  printNextNow: () => void;
  clearCompleted: () => Promise<void>;
  openQueue: () => void;
  closeQueue: () => void;
  toggleQueue: () => void;
}

const ReceiptPrintQueueContext = createContext<ReceiptPrintQueueContextValue | null>(null);

export function ReceiptPrintQueueProvider({ children }: { children: React.ReactNode }) {
  const {
    jobs,
    isExpanded,
    isSheetOpen,
    isPausedForTear,
    hasUnseenAttention,
    tearCountdownRemaining,
    nextPrintAllowedAt,
    activeTearJobId,
    setIsExpanded,
    setIsSheetOpen,
    toggleExpanded,
    toggleSheet,
  } = usePrintQueueStore();

  // Initialize background worker on mount
  useEffect(() => {
    printQueueWorker.initialize();
    return () => {
      printQueueWorker.shutdown();
    };
  }, []);

  // Compute queue statistics
  const activeJob = useMemo(() => {
    return jobs.find((j) => j.status === 'printing' || j.status === 'preparing') || null;
  }, [jobs]);

  const activeTearJob = useMemo(() => {
    if (activeTearJobId) {
      const found = jobs.find((j) => j.id === activeTearJobId);
      if (found) return found;
    }
    return jobs.find((j) => j.status === 'tear-wait') || null;
  }, [jobs, activeTearJobId]);

  const waitingCount = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.status === 'queued' ||
        j.status === 'waiting-for-printer' ||
        j.status === 'reconnecting'
    ).length;
  }, [jobs]);

  const needsAttentionCount = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.status === 'needs-review' ||
        j.status === 'interrupted' ||
        j.status === 'failed'
    ).length;
  }, [jobs]);

  const completedCount = useMemo(() => {
    return jobs.filter((j) => j.status === 'sent' || j.status === 'cancelled').length;
  }, [jobs]);

  const totalActiveCount = (activeJob ? 1 : 0) + (activeTearJob ? 1 : 0) + waitingCount + needsAttentionCount;

  /**
   * Transforms raw order data into an immutable snapshot for safe serial printing
   */
  const buildOrderSnapshot = useCallback(
    (order: any, templateConfig?: any, cafeSettings?: any): PrintJobDataSnapshot => {
      const items = (order.items || []).map((i: any) => ({
        name: i.name || i.item_name || 'Item',
        quantity: Number(i.quantity || 1),
        unitPrice: Number(i.unit_price || i.price || 0),
        totalPrice: Number(i.total_price || (i.unit_price || i.price || 0) * (i.quantity || 1)),
        notes: i.notes || null,
      }));

      return {
        orderNumber: order.order_number || order.offline_reference || 'RECEIPT',
        clientOrderId: order.client_order_id || order.id,
        serverOrderId: order.created_offline ? undefined : order.id,
        offlineReference: order.offline_reference,
        customerName: order.customer_name || (order.customer ? order.customer.name : undefined),
        customerPhone: order.customer_phone || (order.customer ? order.customer.phone : undefined),
        subtotal: Number(order.subtotal || order.total_amount || 0),
        taxAmount: Number(order.tax_amount || 0),
        discountAmount: Number(order.discount_amount || 0),
        totalAmount: Number(order.total_amount || 0),
        paidAmount: Number(order.amount_paid || order.total_amount || 0),
        dueAmount: Number(order.amount_due || (order.payment_method === 'pay_later' ? order.total_amount : 0)),
        paymentMethod: order.payment_method || 'cash',
        paymentStatus: order.payment_status || (order.payment_method === 'pay_later' ? 'pending' : 'paid'),
        createdAt: order.created_at || order.offline_created_at || new Date().toISOString(),
        isOffline: Boolean(order.created_offline),
        notes: order.notes || null,
        items,
        templateSnapshot: templateConfig,
        settingsSnapshot: cafeSettings,
      };
    },
    []
  );

  const enqueueOrderReceipt = useCallback(
    async (order: any, templateConfig?: any, cafeSettings?: any) => {
      const snapshot = buildOrderSnapshot(order, templateConfig, cafeSettings);
      const type: PrintJobType = snapshot.isOffline ? 'offline-order-receipt' : 'order-receipt';
      return printQueueWorker.enqueue(snapshot, type, { priority: 1 });
    },
    [buildOrderSnapshot]
  );

  const enqueueReprint = useCallback(
    async (order: any, templateConfig?: any, cafeSettings?: any) => {
      const snapshot = buildOrderSnapshot(order, templateConfig, cafeSettings);
      return printQueueWorker.enqueue(snapshot, 'reprint', { priority: 2 });
    },
    [buildOrderSnapshot]
  );

  const enqueueTestPrint = useCallback(
    async (templateConfig?: any, cafeSettings?: any) => {
      const testSnapshot: PrintJobDataSnapshot = {
        orderNumber: 'TEST-PRINT',
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        isOffline: false,
        items: [],
        templateSnapshot: templateConfig,
        settingsSnapshot: cafeSettings,
      };
      return printQueueWorker.enqueue(testSnapshot, 'printer-test', { priority: 3 });
    },
    []
  );

  const retryJob = useCallback(async (id: string) => {
    await printQueueWorker.retryJob(id);
  }, []);

  const markJobDone = useCallback(async (id: string) => {
    await printQueueWorker.markJobDone(id);
  }, []);

  const cancelJob = useCallback(async (id: string) => {
    await printQueueWorker.cancelJob(id);
  }, []);

  const continueAfterTear = useCallback(() => {
    printQueueWorker.continueAfterTear();
  }, []);

  const printNextNow = useCallback(() => {
    printQueueWorker.printNextNow();
  }, []);

  const clearCompleted = useCallback(async () => {
    await printQueueWorker.clearCompleted();
  }, []);

  const openQueue = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSheetOpen(true);
    } else {
      setIsExpanded(true);
    }
  }, [setIsExpanded, setIsSheetOpen]);

  const closeQueue = useCallback(() => {
    setIsExpanded(false);
    setIsSheetOpen(false);
  }, [setIsExpanded, setIsSheetOpen]);

  const toggleQueue = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleSheet();
    } else {
      toggleExpanded();
    }
  }, [toggleExpanded, toggleSheet]);

  const value = useMemo<ReceiptPrintQueueContextValue>(
    () => ({
      jobs,
      activeJob,
      activeTearJob,
      waitingCount,
      needsAttentionCount,
      completedCount,
      totalActiveCount,
      isExpanded,
      isSheetOpen,
      isPausedForTear,
      hasUnseenAttention,
      tearCountdownRemaining,
      nextPrintAllowedAt,
      enqueueOrderReceipt,
      enqueueReprint,
      enqueueTestPrint,
      retryJob,
      markJobDone,
      cancelJob,
      continueAfterTear,
      printNextNow,
      clearCompleted,
      openQueue,
      closeQueue,
      toggleQueue,
    }),
    [
      jobs,
      activeJob,
      activeTearJob,
      waitingCount,
      needsAttentionCount,
      completedCount,
      totalActiveCount,
      isExpanded,
      isSheetOpen,
      isPausedForTear,
      hasUnseenAttention,
      tearCountdownRemaining,
      nextPrintAllowedAt,
      enqueueOrderReceipt,
      enqueueReprint,
      enqueueTestPrint,
      retryJob,
      markJobDone,
      cancelJob,
      continueAfterTear,
      printNextNow,
      clearCompleted,
      openQueue,
      closeQueue,
      toggleQueue,
    ]
  );

  return (
    <ReceiptPrintQueueContext.Provider value={value}>
      {children}
      {/* Floating Desktop Bottom-Right Queue Dock */}
      <PrintQueueDock />
      {/* Mobile Drawer/Sheet Queue */}
      <PrintQueueSheet />
    </ReceiptPrintQueueContext.Provider>
  );
}

export function useReceiptPrintQueue(): ReceiptPrintQueueContextValue {
  const ctx = useContext(ReceiptPrintQueueContext);
  if (!ctx) {
    throw new Error('useReceiptPrintQueue must be used within a ReceiptPrintQueueProvider');
  }
  return ctx;
}

import type { PaymentMethod } from './index';

export type PrintJobType =
  | 'order-receipt'
  | 'offline-order-receipt'
  | 'reprint'
  | 'template-test'
  | 'printer-test';

export type PrintJobStatus =
  | 'queued'
  | 'preparing'
  | 'waiting-for-printer'
  | 'reconnecting'
  | 'printing'
  | 'tear-wait'
  | 'sent'
  | 'interrupted'
  | 'failed'
  | 'needs-review'
  | 'cancelled';

export type PrintFinishingMode = 'continuous' | 'manual-tear' | 'auto-cut';
export type PrintTearGap = 'compact' | 'normal' | 'extra';
export type PrintTearMode = 'continuous' | 'manual-confirm';

export interface PrintJobItemSnapshot {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
}

export interface PrintJobDataSnapshot {
  orderNumber: string;
  clientOrderId?: string;
  serverOrderId?: string;
  offlineReference?: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: string;
  createdAt: string;
  isOffline: boolean;
  notes?: string | null;
  items: PrintJobItemSnapshot[];
  templateSnapshot?: any;
  settingsSnapshot?: any;
}

export interface PrintJob {
  id: string; // Idempotency key e.g. "initial-receipt:CLIENT_ORDER_ID"
  type: PrintJobType;
  status: PrintJobStatus;
  priority: number; // 1 = customer order (highest), 2 = reprint, 3 = test print
  data: PrintJobDataSnapshot;
  finishingMode: PrintFinishingMode;
  tearGap: PrintTearGap;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  bytesWritten: number;
  totalBytes: number;
  attemptCount: number;
  errorMessage?: string;
  interruptedAtByte?: number;
}

export interface PrintQueueSettings {
  rushMode: boolean; // Continuous queue without blocking (Default: true)
  tearMode: PrintTearMode; // 'continuous' (auto-advance after tear delay) or 'manual-confirm' (Wait for Me)
  tearDelayMs: number; // Duration in ms before next receipt starts (Default: 3000ms = 3s)
  tearGap: PrintTearGap; // Feed lines: 'compact' (2 lines), 'normal' (3 lines), 'extra' (5 lines)
  finishingMode: PrintFinishingMode; // 'continuous' | 'manual-tear' | 'auto-cut'
  settleDelayMs: number; // Hardware settle delay for cutter/radio (Default: 300ms)
  pauseAfterReceipt: boolean; // Backwards-compatible alias for tearMode === 'manual-confirm'
}

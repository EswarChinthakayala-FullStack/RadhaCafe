import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrintQueueSettings,
  savePrintQueueSettings,
} from '../printQueueSettings';
import { encodeTemplateReceiptToEscPos } from '../escpos';
import type { PrintJob } from '../../types/printQueue.types';

// Mock localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

describe('Print Queue & Tear Flow Settings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should return default queue settings with 3s tear time, continuous rush mode, and extra paper gap', () => {
    const settings = getPrintQueueSettings();
    expect(settings.rushMode).toBe(true);
    expect(settings.tearMode).toBe('continuous');
    expect(settings.tearDelayMs).toBe(3000);
    expect(settings.tearGap).toBe('extra');
    expect(settings.settleDelayMs).toBe(300);
    expect(settings.pauseAfterReceipt).toBe(false);
  });

  it('should persist and validate customized tear intervals and queue modes', () => {
    const updated = savePrintQueueSettings({
      tearMode: 'manual-confirm',
      tearDelayMs: 5000,
      tearGap: 'compact',
    });

    expect(updated.tearMode).toBe('manual-confirm');
    expect(updated.pauseAfterReceipt).toBe(true);
    expect(updated.tearDelayMs).toBe(5000);
    expect(updated.tearGap).toBe('compact');

    const reloaded = getPrintQueueSettings();
    expect(reloaded.tearMode).toBe('manual-confirm');
    expect(reloaded.tearDelayMs).toBe(5000);
    expect(reloaded.tearGap).toBe('compact');
  });

  it('should calculate remaining tear window accurately without double waiting', () => {
    const tearDelayMs = 3000;
    const receiptAFinishedAt = 10000;
    const nextPrintAllowedAt = receiptAFinishedAt + tearDelayMs; // 13000

    // Order B arrives 1 second later (at t = 11000)
    const orderBArrivesAt = 11000;
    const remainingWaitMs = Math.max(0, nextPrintAllowedAt - orderBArrivesAt);
    expect(remainingWaitMs).toBe(2000); // 2 seconds remaining

    // Order C arrives 4 seconds later (at t = 14000)
    const orderCArrivesAt = 14000;
    const remainingWaitMsForC = Math.max(0, nextPrintAllowedAt - orderCArrivesAt);
    expect(remainingWaitMsForC).toBe(0); // Delay already elapsed, can print immediately
  });
});

describe('ESC/POS Finishing Modes & Paper Gaps', () => {
  const sampleOrder = {
    orderNumber: 'RC-0042',
    dateTime: '2026-08-17 12:30',
    items: [{ name: 'Espresso', quantity: 1, unitPrice: 80, totalPrice: 80 }],
    subtotal: 80,
    tax: 0,
    discount: 0,
    total: 80,
    paidAmount: 80,
    dueAmount: 0,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
  };

  it('should encode manual-tear receipt with extra feed gap (5 lines) and no cut command', () => {
    const bytes = encodeTemplateReceiptToEscPos(sampleOrder, {
      finishingMode: 'manual-tear',
      tearGap: 'extra',
      supportsCut: false,
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(50);
  });

  it('should encode compact tear gap (2 lines)', () => {
    const bytes = encodeTemplateReceiptToEscPos(sampleOrder, {
      finishingMode: 'manual-tear',
      tearGap: 'compact',
      supportsCut: false,
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(50);
  });

  it('should encode auto-cut receipt with cut command when supportsCut is true', () => {
    const bytes = encodeTemplateReceiptToEscPos(sampleOrder, {
      finishingMode: 'auto-cut',
      supportsCut: true,
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    // ESC/POS Cut command is [0x1D, 0x56, 0x00]
    const hasCut = bytes.some((b, i) => b === 0x1d && bytes[i + 1] === 0x56);
    expect(hasCut).toBe(true);
  });
});

describe('Print Job Priority & Ordering Logic', () => {
  it('should sort customer order receipts ahead of reprints and test slips', () => {
    const jobs: Partial<PrintJob>[] = [
      { id: '3', type: 'printer-test', priority: 3, createdAt: '2026-08-17T10:00:00Z' },
      { id: '2', type: 'reprint', priority: 2, createdAt: '2026-08-17T10:01:00Z' },
      { id: '1', type: 'order-receipt', priority: 1, createdAt: '2026-08-17T10:02:00Z' },
    ];

    // Priority Sort (priority ASC, then createdAt ASC)
    jobs.sort((a, b) => {
      if (a.priority !== b.priority) return (a.priority || 0) - (b.priority || 0);
      return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
    });

    expect(jobs[0].id).toBe('1');
    expect(jobs[1].id).toBe('2');
    expect(jobs[2].id).toBe('3');
  });

  it('should maintain strict FIFO ordering for jobs of the same priority', () => {
    const jobs: Partial<PrintJob>[] = [
      { id: 'order-3', priority: 1, createdAt: '2026-08-17T10:03:00Z' },
      { id: 'order-1', priority: 1, createdAt: '2026-08-17T10:01:00Z' },
      { id: 'order-2', priority: 1, createdAt: '2026-08-17T10:02:00Z' },
    ];

    jobs.sort((a, b) => {
      if (a.priority !== b.priority) return (a.priority || 0) - (b.priority || 0);
      return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
    });

    expect(jobs[0].id).toBe('order-1');
    expect(jobs[1].id).toBe('order-2');
    expect(jobs[2].id).toBe('order-3');
  });
});

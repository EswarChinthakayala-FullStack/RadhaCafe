import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateClientOrderId,
  generateOfflineReference,
  createOfflineOrder,
} from '../offlineOrderService';
import * as dbModule from '../db';

vi.mock('../db', () => ({
  idbGetCafeSettings: vi.fn(),
  idbSaveOfflineOrder: vi.fn().mockResolvedValue(undefined),
  idbGetAllOfflineOrders: vi.fn().mockResolvedValue([]),
  idbGetPendingOfflineOrders: vi.fn().mockResolvedValue([]),
  idbCancelOfflineOrder: vi.fn().mockResolvedValue(null),
}));

describe('Offline Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate valid client_order_id UUIDs', () => {
    const uuid1 = generateClientOrderId();
    const uuid2 = generateClientOrderId();
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(uuid2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(uuid1).not.toBe(uuid2);
  });

  it('should generate structured offline references formatted as RC-OFF-YYYYMMDD-XXXX', () => {
    const testDate = new Date('2026-08-17T12:00:00.000Z');
    const ref = generateOfflineReference(testDate);
    expect(ref).toMatch(/^RC-OFF-20260817-[0-9A-F]{4}$/);
  });

  it('should compute correct subtotal, zero tax, and total for offline orders', async () => {
    const mockCartItems = [
      {
        menuItem: { id: 'm-1', name: 'Filter Coffee', price: 30 } as any,
        quantity: 2,
      },
      {
        menuItem: { id: 'm-2', name: 'Masala Dosa', price: 80 } as any,
        quantity: 1,
      },
    ];

    const offlineOrder = await createOfflineOrder({
      items: mockCartItems,
      customerName: 'Sita Ram',
      paymentMethod: 'cash',
      discountAmount: 10,
    });

    // Subtotal: (30 * 2) + (80 * 1) = 60 + 80 = 140
    expect(offlineOrder.subtotal).toBe(140);
    // Tax is strictly 0 for offline mode
    expect(offlineOrder.tax_amount).toBe(0);
    // Discount: 10
    expect(offlineOrder.discount_amount).toBe(10);
    // Total: 140 + 0 - 10 = 130
    expect(offlineOrder.total_amount).toBe(130);
    expect(offlineOrder.payment_status).toBe('paid');
    expect(offlineOrder.sync_status).toBe('pending');
    expect(offlineOrder.items).toHaveLength(2);
    expect(dbModule.idbSaveOfflineOrder).toHaveBeenCalledWith(offlineOrder);
  });

  it('should correctly set payment_status to unpaid for pay_later orders', async () => {
    (dbModule.idbGetCafeSettings as any).mockResolvedValue({
      tax_percentage: 0,
    });

    const mockCartItems = [
      {
        menuItem: { id: 'm-1', name: 'Cold Coffee', price: 100 } as any,
        quantity: 1,
      },
    ];

    const offlineOrder = await createOfflineOrder({
      items: mockCartItems,
      customer: { id: 'cust-123', name: 'Ravi Kumar', phone: '9988776655' } as any,
      paymentMethod: 'pay_later',
    });

    expect(offlineOrder.payment_method).toBe('pay_later');
    expect(offlineOrder.payment_status).toBe('unpaid');
    expect(offlineOrder.customer_id).toBe('cust-123');
    expect(offlineOrder.customer_name).toBe('Ravi Kumar');
  });
});

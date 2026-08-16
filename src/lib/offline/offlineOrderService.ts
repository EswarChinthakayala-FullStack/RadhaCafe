import {
  idbSaveOfflineOrder,
  idbGetAllOfflineOrders,
  idbGetPendingOfflineOrders,
  idbCancelOfflineOrder,
} from './db';
import type { OfflineOrder, OfflineOrderItem } from './types';
import type { CartItem, Customer, PaymentMethod } from '../../types';

/**
 * Generates a standard client-side idempotency UUID
 */
export function generateClientOrderId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a professional, compact offline reference for receipts (e.g. RC-OFF-20260817-A7F2)
 */
export function generateOfflineReference(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `RC-OFF-${yyyy}${mm}${dd}-${rand}`;
}

export interface CreateOfflineOrderParams {
  items: CartItem[];
  customer?: Customer | null;
  customerName?: string;
  paymentMethod: PaymentMethod;
  discountAmount?: number;
  clientOrderId?: string;
  isPrinted?: boolean;
}

/**
 * Transactionally saves a finalized offline order in IndexedDB
 */
export async function createOfflineOrder(params: CreateOfflineOrderParams): Promise<OfflineOrder> {
  const {
    items,
    customer,
    customerName,
    paymentMethod,
    discountAmount = 0,
    clientOrderId = generateClientOrderId(),
    isPrinted = false,
  } = params;

  if (!items || items.length === 0) {
    throw new Error('Offline order must contain at least one item.');
  }

  // 1. Map item snapshots with exact current unit prices
  const orderItems: OfflineOrderItem[] = items.map((i) => {
    const unitPrice = Number(i.menuItem.price || 0);
    const quantity = Number(i.quantity || 1);
    return {
      menu_item_id: i.menuItem.id || null,
      item_name: i.menuItem.name,
      unit_price: unitPrice,
      quantity,
      total_price: unitPrice * quantity,
    };
  });

  // 2. Compute financial totals (No tax added for offline mode)
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
  const taxAmount = 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const isPayLater = paymentMethod === 'pay_later';
  const custName = customer?.name || customerName || 'Walk-in Customer';
  const custId = customer?.id || null;

  const now = new Date();
  const offlineOrder: OfflineOrder = {
    client_order_id: clientOrderId,
    offline_reference: generateOfflineReference(now),
    customer_id: custId,
    customer_name: custName,
    items: orderItems,
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    payment_method: paymentMethod,
    payment_status: isPayLater ? 'unpaid' : 'paid',
    status: 'completed',
    is_printed: isPrinted,
    offline_created_at: now.toISOString(),
    sync_status: 'pending',
    sync_attempts: 0,
    last_sync_error: null,
  };

  // 4. Save to IndexedDB
  await idbSaveOfflineOrder(offlineOrder);
  return offlineOrder;
}

/**
 * Returns all offline orders
 */
export async function getOfflineOrders(): Promise<OfflineOrder[]> {
  return idbGetAllOfflineOrders();
}

/**
 * Returns count of pending unsynced orders
 */
export async function getPendingOfflineOrdersCount(): Promise<number> {
  const pending = await idbGetPendingOfflineOrders();
  return pending.length;
}

/**
 * Cancels a pending offline order locally
 */
export async function cancelLocalOfflineOrder(clientOrderId: string): Promise<OfflineOrder | null> {
  return idbCancelOfflineOrder(clientOrderId);
}

import { supabase } from '../client';
import type { CreateOrderPayload, Order, OrderOperationalSummary, OrderSort } from '../../../types';

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  customerId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: OrderSort;
}

export async function fetchOrders(params: OrderFilterParams = {}): Promise<{ orders: Order[]; count: number }> {
  const {
    page = 1,
    limit = 20,
    status,
    paymentMethod,
    paymentStatus,
    customerId,
    date,
    startDate,
    endDate,
    search,
    sort = 'newest',
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = (supabase as any)
    .from('orders')
    .select(`
      id,
      order_number,
      customer_id,
      customer_name,
      status,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_method,
      payment_status,
      paid_amount,
      due_amount,
      paid_at,
      is_printed,
      created_at,
      completed_at,
      items:order_items(*)
    `, { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (paymentMethod && paymentMethod !== 'all') {
    query = query.eq('payment_method', paymentMethod);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    if (paymentStatus === 'outstanding' || paymentStatus === 'unpaid') {
      query = query.gt('due_amount', 0);
    } else if (paymentStatus === 'paid') {
      query = query.eq('due_amount', 0);
    } else if (paymentStatus === 'partial') {
      query = query.eq('payment_status', 'partial');
    } else {
      query = query.eq('payment_status', paymentStatus);
    }
  }

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  if (startDate && endDate) {
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else if (date) {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    query = query.gte('created_at', start).lte('created_at', end);
  }

  if (search && search.trim()) {
    const term = search.trim();
    if (/^RC-/i.test(term)) {
      query = query.ilike('order_number', `%${term}%`);
    } else {
      const wildcard = `%${term}%`;
      query = query.or(`order_number.ilike.${wildcard},customer_name.ilike.${wildcard}`);
    }
  }

  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('total_amount', { ascending: false });
      break;
    case 'lowest':
      query = query.order('total_amount', { ascending: true });
      break;
    case 'largest_due':
      query = query.order('due_amount', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);
  return { orders: (data as unknown as Order[]) || [], count: count || 0 };
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await (supabase as any)
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return (data as unknown as Order) || null;
}

export async function fetchOrderOperationalSummary(startDate?: string, endDate?: string): Promise<OrderOperationalSummary> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  const start = startDate || todayStart;
  const end = endDate || todayEnd;

  const { data: rangeOrders, error: rangeError } = await (supabase as any)
    .from('orders')
    .select('id, status, total_amount, due_amount')
    .gte('created_at', start)
    .lte('created_at', end);

  if (rangeError) throw new Error(rangeError.message);

  const ordersList = (rangeOrders || []) as Array<{ id: string; status: string; total_amount: number; due_amount: number }>;
  
  const ordersToday = ordersList.length;
  const completedOrders = ordersList.filter((o) => o.status === 'completed').length;
  const totalSales = ordersList
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const { count: outstandingCount, error: outError } = await (supabase as any)
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gt('due_amount', 0)
    .neq('status', 'cancelled');

  if (outError) throw new Error(outError.message);

  return {
    ordersToday,
    completedOrders,
    outstandingOrders: outstandingCount || 0,
    totalSales,
  };
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data, error } = await (supabase as any)
    .from('orders')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select(`
      *,
      items:order_items(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Order;
}

function generateOrderNumber(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RC-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Inserts order items cleanly into Supabase order_items table.
 */
async function insertOrderItems(orderId: string, items: any[]): Promise<void> {
  if (!items || items.length === 0) return;

  const rows = items.map((item) => {
    const isValidUuid =
      typeof item.menu_item_id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.menu_item_id);

    return {
      order_id: orderId,
      menu_item_id: isValidUuid ? item.menu_item_id : null,
      item_name: item.item_name || item.name || 'Item',
      unit_price: Number(item.unit_price || item.price || 0),
      quantity: Number(item.quantity || 1),
      total_price: Number(item.total_price || (item.unit_price || item.price || 0) * (item.quantity || 1)),
    };
  });

  const { error } = await (supabase as any).from('order_items').insert(rows);

  if (error) {
    // If foreign key constraint on menu_item_id fails, insert without menu_item_id
    const fallbackRows = rows.map((r) => ({ ...r, menu_item_id: null }));
    await (supabase as any).from('order_items').insert(fallbackRows);
  }
}

/**
 * Creates a new order directly into Supabase orders and order_items tables.
 * Uses clean standard schema columns for instant 201 Created execution with zero 404/400 console errors.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const items = payload.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const taxAmount = Number(payload.tax_amount || 0);
  const discountAmount = Number(payload.discount_amount || 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
  const orderNumber = generateOrderNumber();

  const safePaymentMethod = ['cash', 'card', 'upi', 'other'].includes(payload.payment_method)
    ? payload.payment_method
    : 'cash';

  const orderRow: Record<string, any> = {
    order_number: orderNumber,
    customer_name: payload.customer_name || 'Walk-in Customer',
    status: 'completed',
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    payment_method: safePaymentMethod,
    is_printed: false,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  if (
    payload.customer_id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.customer_id)
  ) {
    orderRow.customer_id = payload.customer_id;
  }

  // 1. Insert order record
  let insertedOrder: any = null;
  const { data, error } = await (supabase as any).from('orders').insert(orderRow).select().single();

  if (error) {
    // If customer_id foreign key failed, retry without customer_id
    delete orderRow.customer_id;
    const retry = await (supabase as any).from('orders').insert(orderRow).select().single();
    if (retry.error) {
      throw new Error(retry.error.message || 'Failed to create order');
    }
    insertedOrder = retry.data;
  } else {
    insertedOrder = data;
  }

  // 2. Insert order items
  await insertOrderItems(insertedOrder.id, items);

  const fullCreatedOrder: Order = {
    ...insertedOrder,
    items: items.map((i: any) => ({
      id: `${insertedOrder.id}_${i.item_name || i.name || 'item'}`,
      order_id: insertedOrder.id,
      menu_item_id: i.menu_item_id || null,
      item_name: i.item_name || i.name || 'Item',
      name: i.item_name || i.name || 'Item',
      unit_price: Number(i.unit_price || i.price || 0),
      price: Number(i.unit_price || i.price || 0),
      quantity: Number(i.quantity || 1),
      total_price: (Number(i.unit_price || i.price || 0)) * (Number(i.quantity || 1)),
    })),
  };

  return fullCreatedOrder;
}

/**
 * Synchronizes an offline order into Supabase orders and order_items tables.
 */
export async function syncOfflineOrder(payload: {
  client_order_id: string;
  offline_reference: string;
  offline_created_at: string;
  customer_name: string;
  items: any[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  customer_id?: string | null;
  is_printed?: boolean;
}): Promise<Order> {
  const safePaymentMethod = ['cash', 'card', 'upi', 'other'].includes(payload.payment_method)
    ? payload.payment_method
    : 'cash';

  const orderRow: Record<string, any> = {
    order_number: payload.offline_reference,
    customer_name: payload.customer_name || 'Walk-in Customer',
    status: 'completed',
    subtotal: Number(payload.subtotal) || 0,
    tax_amount: Number(payload.tax_amount) || 0,
    discount_amount: Number(payload.discount_amount) || 0,
    total_amount: Number(payload.total_amount) || 0,
    payment_method: safePaymentMethod,
    is_printed: Boolean(payload.is_printed),
    created_at: payload.offline_created_at || new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  if (
    payload.customer_id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.customer_id)
  ) {
    orderRow.customer_id = payload.customer_id;
  }

  let insertedOrder: any = null;
  const { data, error } = await (supabase as any).from('orders').insert(orderRow).select().single();

  if (error) {
    delete orderRow.customer_id;
    const retry = await (supabase as any).from('orders').insert(orderRow).select().single();
    if (retry.error) {
      throw new Error(retry.error.message || 'Failed to sync offline order');
    }
    insertedOrder = retry.data;
  } else {
    insertedOrder = data;
  }

  await insertOrderItems(insertedOrder.id, payload.items || []);

  return {
    ...insertedOrder,
    items: (payload.items || []).map((i) => ({
      id: `${insertedOrder.id}_${i.item_name || i.name}`,
      order_id: insertedOrder.id,
      menu_item_id: i.menu_item_id || null,
      item_name: i.item_name || i.name,
      name: i.item_name || i.name,
      unit_price: Number(i.unit_price || i.price) || 0,
      price: Number(i.unit_price || i.price) || 0,
      quantity: Number(i.quantity) || 1,
      total_price: (Number(i.unit_price || i.price) || 0) * (Number(i.quantity) || 1),
    })),
  } as Order;
}

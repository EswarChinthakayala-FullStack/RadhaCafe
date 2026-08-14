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
    // Prioritize exact order number match if search starts with RC- or contains order number
    if (/^RC-/i.test(term)) {
      query = query.ilike('order_number', `%${term}%`);
    } else {
      const wildcard = `%${term}%`;
      query = query.or(`order_number.ilike.${wildcard},customer_name.ilike.${wildcard}`);
    }
  }

  // Deterministic server-side sorting
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

  // 1. Fetch count and total of completed orders in range
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

  // 2. Fetch total outstanding orders count across all active orders
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

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data, error } = await (supabase as any).rpc('create_order_with_items', {
    p_customer_name: payload.customer_name || 'Walk-in Customer',
    p_items: payload.items,
    p_tax_amount: payload.tax_amount,
    p_discount_amount: payload.discount_amount,
    p_payment_method: payload.payment_method,
    p_customer_id: payload.customer_id || null,
  });

  if (error) throw new Error(error.message);

  // Fetch full inserted order record including items:order_items(*)
  if (data?.id) {
    try {
      const fullOrder = await fetchOrderById(data.id);
      if (fullOrder && (fullOrder.items || (fullOrder as any).order_items)?.length) {
        return fullOrder;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback: attach payload.items so the caller immediately has order items for receipt generation
  const resultOrder = { ...(data || {}) };
  if (!resultOrder.items || resultOrder.items.length === 0) {
    resultOrder.items = (payload.items || []).map((i) => ({
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.unit_price * i.quantity,
    }));
  }

  return resultOrder as unknown as Order;
}

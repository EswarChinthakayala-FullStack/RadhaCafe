import { supabase } from '../client';
import type { CreateOrderPayload, Order } from '../../../types';

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function fetchOrders(params: OrderFilterParams = {}): Promise<{ orders: Order[]; count: number }> {
  const { page = 1, limit = 20, status, paymentMethod, date, startDate, endDate, search } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = (supabase as any)
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      status,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount,
      payment_method,
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

  if (startDate && endDate) {
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  } else if (date) {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    query = query.gte('created_at', start).lte('created_at', end);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`order_number.ilike.${term},customer_name.ilike.${term}`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

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

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data, error } = await (supabase as any).rpc('create_order_with_items', {
    p_customer_name: payload.customer_name || 'Walk-in Customer',
    p_items: payload.items,
    p_tax_amount: payload.tax_amount,
    p_discount_amount: payload.discount_amount,
    p_payment_method: payload.payment_method,
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

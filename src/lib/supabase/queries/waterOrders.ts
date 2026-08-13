import { supabase } from '../client';
import type { WaterOrder, CreateWaterOrderPayload } from '../../../types';

export interface WaterOrderFilterParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  customerId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function fetchWaterOrders(
  params: WaterOrderFilterParams = {}
): Promise<{ orders: WaterOrder[]; count: number }> {
  const {
    page = 1,
    limit = 20,
    orderStatus,
    paymentMethod,
    paymentStatus,
    customerId,
    date,
    startDate,
    endDate,
    search,
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = (supabase as any)
    .from('water_orders')
    .select(
      `
      id,
      order_number,
      customer_id,
      customer_name,
      order_status,
      subtotal,
      discount_amount,
      total_amount,
      amount_paid,
      amount_due,
      payment_status,
      payment_method,
      order_source,
      notes,
      is_printed,
      created_at,
      completed_at,
      items:water_order_items(*)
    `,
      { count: 'exact' }
    );

  if (orderStatus && orderStatus !== 'all') {
    query = query.eq('order_status', orderStatus);
  }

  if (paymentMethod && paymentMethod !== 'all') {
    query = query.eq('payment_method', paymentMethod);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    query = query.eq('payment_status', paymentStatus);
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
    const term = `%${search.trim()}%`;
    query = query.or(`order_number.ilike.${term},customer_name.ilike.${term}`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { orders: (data as unknown as WaterOrder[]) || [], count: count || 0 };
}

export async function fetchWaterOrderById(id: string): Promise<WaterOrder | null> {
  const { data, error } = await (supabase as any)
    .from('water_orders')
    .select(
      `
      *,
      items:water_order_items(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return (data as unknown as WaterOrder) || null;
}

export async function createWaterOrder(payload: CreateWaterOrderPayload): Promise<WaterOrder> {
  const { data, error } = await (supabase as any).rpc('create_water_order_with_items', {
    p_customer_name: payload.customer_name || 'Walk-in Customer',
    p_items: payload.items,
    p_discount_amount: payload.discount_amount,
    p_payment_method: payload.payment_method,
    p_customer_id: payload.customer_id || null,
    p_order_source: payload.order_source || 'pos',
    p_notes: payload.notes || null,
  });

  if (error) throw new Error(error.message);

  if (data?.id) {
    try {
      const fullOrder = await fetchWaterOrderById(data.id);
      if (fullOrder && (fullOrder.items || (fullOrder as any).water_order_items)?.length) {
        return fullOrder;
      }
    } catch {
      // Fallback below
    }
  }

  const resultOrder = { ...(data || {}) };
  if (!resultOrder.items || resultOrder.items.length === 0) {
    resultOrder.items = (payload.items || []).map((i) => ({
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.unit_price * i.quantity,
    }));
  }

  return resultOrder as unknown as WaterOrder;
}

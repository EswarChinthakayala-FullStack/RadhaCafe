import { supabase } from '../client';
import type { WaterCustomer, CreateWaterCustomerPayload } from '../../../types';

export interface WaterCustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  hasDue?: boolean;
}

export async function fetchWaterCustomers(
  params: WaterCustomerFilterParams = {}
): Promise<{ customers: WaterCustomer[]; count: number }> {
  const { page = 1, limit = 20, search, hasDue } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = (supabase as any)
    .from('water_customers')
    .select('*', { count: 'exact' });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},phone.ilike.${term}`);
  }

  const { data: rawCustomers, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  if (!rawCustomers || rawCustomers.length === 0) {
    return { customers: [], count: count || 0 };
  }

  const customerIds = rawCustomers.map((c: any) => c.id);

  // Fetch financial aggregations from water_orders
  const { data: orderStats } = await (supabase as any)
    .from('water_orders')
    .select('customer_id, total_amount, amount_paid, amount_due, created_at')
    .in('customer_id', customerIds);

  const statsMap: Record<
    string,
    { total_orders: number; total_spent: number; total_paid: number; total_due: number; last_order_at: string | null }
  > = {};

  (orderStats || []).forEach((ord: any) => {
    if (!ord.customer_id) return;
    if (!statsMap[ord.customer_id]) {
      statsMap[ord.customer_id] = { total_orders: 0, total_spent: 0, total_paid: 0, total_due: 0, last_order_at: null };
    }
    const st = statsMap[ord.customer_id];
    st.total_orders += 1;
    st.total_spent += Number(ord.total_amount || 0);
    st.total_paid += Number(ord.amount_paid || 0);
    st.total_due += Number(ord.amount_due || 0);

    if (!st.last_order_at || new Date(ord.created_at) > new Date(st.last_order_at)) {
      st.last_order_at = ord.created_at;
    }
  });

  let customers: WaterCustomer[] = rawCustomers.map((c: any) => {
    const st = statsMap[c.id] || { total_orders: 0, total_spent: 0, total_paid: 0, total_due: 0, last_order_at: null };
    return {
      ...c,
      total_orders: st.total_orders,
      total_spent: st.total_spent,
      total_paid: st.total_paid,
      total_due: st.total_due,
      last_order_at: st.last_order_at,
    };
  });

  if (hasDue) {
    customers = customers.filter((c) => (c.total_due || 0) > 0);
  }

  return { customers, count: count || 0 };
}

export async function fetchWaterCustomerById(id: string): Promise<WaterCustomer | null> {
  const { data: customer, error } = await (supabase as any)
    .from('water_customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!customer) return null;

  const { data: orderStats } = await (supabase as any)
    .from('water_orders')
    .select('total_amount, amount_paid, amount_due, created_at')
    .eq('customer_id', id);

  let total_orders = 0;
  let total_spent = 0;
  let total_paid = 0;
  let total_due = 0;
  let last_order_at: string | null = null;

  (orderStats || []).forEach((ord: any) => {
    total_orders += 1;
    total_spent += Number(ord.total_amount || 0);
    total_paid += Number(ord.amount_paid || 0);
    total_due += Number(ord.amount_due || 0);

    if (!last_order_at || new Date(ord.created_at) > new Date(last_order_at)) {
      last_order_at = ord.created_at;
    }
  });

  return {
    ...customer,
    total_orders,
    total_spent,
    total_paid,
    total_due,
    last_order_at,
  };
}

export async function searchWaterCustomers(searchTerm: string): Promise<WaterCustomer[]> {
  if (!searchTerm || !searchTerm.trim()) return [];

  const term = `%${searchTerm.trim()}%`;
  const { data: rawCustomers, error } = await (supabase as any)
    .from('water_customers')
    .select('*')
    .or(`name.ilike.${term},phone.ilike.${term}`)
    .limit(10);

  if (error) throw new Error(error.message);
  if (!rawCustomers || rawCustomers.length === 0) return [];

  const customerIds = rawCustomers.map((c: any) => c.id);

  const { data: orderStats } = await (supabase as any)
    .from('water_orders')
    .select('customer_id, amount_due')
    .in('customer_id', customerIds)
    .gt('amount_due', 0);

  const dueMap: Record<string, number> = {};
  (orderStats || []).forEach((ord: any) => {
    dueMap[ord.customer_id] = (dueMap[ord.customer_id] || 0) + Number(ord.amount_due || 0);
  });

  return rawCustomers.map((c: any) => ({
    ...c,
    total_due: dueMap[c.id] || 0,
  }));
}

export async function createWaterCustomer(payload: CreateWaterCustomerPayload): Promise<WaterCustomer> {
  const { data, error } = await (supabase as any)
    .from('water_customers')
    .insert({
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || null,
      address: payload.address?.trim() || null,
      notes: payload.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique') || error.message.includes('phone')) {
      throw new Error('A water customer profile with this phone number already exists.');
    }
    throw new Error(error.message);
  }

  return {
    ...data,
    total_orders: 0,
    total_spent: 0,
    total_paid: 0,
    total_due: 0,
  };
}

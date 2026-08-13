import { supabase } from '../client';
import type { Customer, CustomerFilterParams, CreateCustomerPayload } from '../../../types';

export async function fetchCustomers(params: CustomerFilterParams = {}): Promise<{ customers: Customer[]; count: number }> {
  const { page = 1, limit = 20, search, hasDue } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Fetch raw customer profiles
  let query = (supabase as any)
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

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

  // 2. Fetch order financial aggregations for these customers
  const { data: orderStats, error: orderErr } = await (supabase as any)
    .from('orders')
    .select('id, customer_id, total_amount, paid_amount, due_amount, payment_status, created_at')
    .in('customer_id', customerIds);

  if (orderErr) throw new Error(orderErr.message);

  // Group stats by customer_id
  const statsMap: Record<string, { total_orders: number; total_spent: number; total_paid: number; total_due: number; last_order_at: string | null }> = {};

  (orderStats || []).forEach((ord: any) => {
    if (!ord.customer_id) return;
    if (!statsMap[ord.customer_id]) {
      statsMap[ord.customer_id] = { total_orders: 0, total_spent: 0, total_paid: 0, total_due: 0, last_order_at: null };
    }
    const stat = statsMap[ord.customer_id];
    stat.total_orders += 1;
    stat.total_spent += Number(ord.total_amount || 0);
    stat.total_paid += Number(ord.paid_amount || 0);
    stat.total_due += Number(ord.due_amount || 0);

    if (!stat.last_order_at || new Date(ord.created_at) > new Date(stat.last_order_at)) {
      stat.last_order_at = ord.created_at;
    }
  });

  let customers: Customer[] = rawCustomers.map((c: any) => {
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

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  const { data: customer, error } = await (supabase as any)
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!customer) return null;

  // Fetch financial summary from orders
  const { data: orderStats } = await (supabase as any)
    .from('orders')
    .select('id, total_amount, paid_amount, due_amount, created_at')
    .eq('customer_id', id);

  let total_orders = 0;
  let total_spent = 0;
  let total_paid = 0;
  let total_due = 0;
  let last_order_at: string | null = null;

  (orderStats || []).forEach((ord: any) => {
    total_orders += 1;
    total_spent += Number(ord.total_amount || 0);
    total_paid += Number(ord.paid_amount || 0);
    total_due += Number(ord.due_amount || 0);

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

export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  if (!searchTerm || !searchTerm.trim()) return [];

  const term = `%${searchTerm.trim()}%`;
  const { data: rawCustomers, error } = await (supabase as any)
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.${term},phone.ilike.${term}`)
    .limit(10);

  if (error) throw new Error(error.message);
  if (!rawCustomers || rawCustomers.length === 0) return [];

  const customerIds = rawCustomers.map((c: any) => c.id);

  // Fetch outstanding due balances
  const { data: orderStats } = await (supabase as any)
    .from('orders')
    .select('customer_id, due_amount')
    .in('customer_id', customerIds)
    .gt('due_amount', 0);

  const dueMap: Record<string, number> = {};
  (orderStats || []).forEach((ord: any) => {
    dueMap[ord.customer_id] = (dueMap[ord.customer_id] || 0) + Number(ord.due_amount || 0);
  });

  return rawCustomers.map((c: any) => ({
    ...c,
    total_due: dueMap[c.id] || 0,
  }));
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data, error } = await (supabase as any)
    .from('customers')
    .insert({
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      notes: payload.notes?.trim() || null,
      credit_limit: payload.credit_limit || null,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique') || error.message.includes('phone')) {
      throw new Error('A customer with this phone number already exists.');
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

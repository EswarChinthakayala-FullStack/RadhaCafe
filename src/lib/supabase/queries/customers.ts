import { supabase } from '../client';
import type {
  Customer,
  CustomerFilterParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerOperationalSummary,
  CustomerLedgerEntry,
} from '../../../types';

export async function fetchCustomers(
  params: CustomerFilterParams = {}
): Promise<{ customers: Customer[]; count: number }> {
  const {
    page = 1,
    limit = 20,
    search,
    statusFilter = 'all',
    hasDue,
    sortBy = 'highest_due',
  } = params;

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
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!rawCustomers || rawCustomers.length === 0) {
    return { customers: [], count: count || 0 };
  }

  const customerIds = rawCustomers.map((c: any) => c.id);

  // 2. Fetch order financial aggregations for these customers (excluding cancelled orders)
  const { data: orderStats, error: orderErr } = await (supabase as any)
    .from('orders')
    .select('id, customer_id, total_amount, paid_amount, due_amount, payment_status, status, created_at')
    .in('customer_id', customerIds)
    .neq('status', 'cancelled');

  if (orderErr) throw new Error(orderErr.message);

  // Group stats by customer_id
  const statsMap: Record<
    string,
    {
      total_orders: number;
      total_spent: number;
      total_paid: number;
      total_due: number;
      last_order_at: string | null;
    }
  > = {};

  (orderStats || []).forEach((ord: any) => {
    if (!ord.customer_id) return;
    if (!statsMap[ord.customer_id]) {
      statsMap[ord.customer_id] = {
        total_orders: 0,
        total_spent: 0,
        total_paid: 0,
        total_due: 0,
        last_order_at: null,
      };
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
    const st = statsMap[c.id] || {
      total_orders: 0,
      total_spent: 0,
      total_paid: 0,
      total_due: 0,
      last_order_at: null,
    };
    return {
      ...c,
      total_orders: st.total_orders,
      total_spent: st.total_spent,
      total_paid: st.total_paid,
      total_due: st.total_due,
      last_order_at: st.last_order_at,
    };
  });

  // Apply status filter
  if (hasDue || statusFilter === 'due') {
    customers = customers.filter((c) => (c.total_due || 0) > 0);
  } else if (statusFilter === 'paid') {
    customers = customers.filter((c) => (c.total_due || 0) === 0);
  }

  // Apply sorting
  customers.sort((a, b) => {
    switch (sortBy) {
      case 'highest_due':
        return (b.total_due || 0) - (a.total_due || 0);
      case 'most_orders':
        return (b.total_orders || 0) - (a.total_orders || 0);
      case 'highest_spent':
        return (b.total_spent || 0) - (a.total_spent || 0);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'recent_order':
        const timeA = a.last_order_at ? new Date(a.last_order_at).getTime() : 0;
        const timeB = b.last_order_at ? new Date(b.last_order_at).getTime() : 0;
        return timeB - timeA;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalFilteredCount = customers.length;
  const from = (page - 1) * limit;
  const paginatedCustomers = customers.slice(from, from + limit);

  return { customers: paginatedCustomers, count: totalFilteredCount };
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  const { data: customer, error } = await (supabase as any)
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  if (!customer) return null;

  // Fetch financial summary from non-cancelled orders
  const { data: orderStats } = await (supabase as any)
    .from('orders')
    .select('id, total_amount, paid_amount, due_amount, created_at')
    .eq('customer_id', id)
    .neq('status', 'cancelled');

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

export async function fetchCustomerOperationalSummary(): Promise<CustomerOperationalSummary> {
  // 1. Total active customers
  const { count: totalCustomers, error: custErr } = await (supabase as any)
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (custErr) throw new Error(custErr.message);

  // 2. Outstanding Cafe dues from non-cancelled orders
  const { data: dueOrders, error: dueErr } = await (supabase as any)
    .from('orders')
    .select('customer_id, due_amount')
    .gt('due_amount', 0)
    .neq('status', 'cancelled');

  if (dueErr) throw new Error(dueErr.message);

  const uniqueCustomersWithDue = new Set<string>();
  let totalOutstanding = 0;

  (dueOrders || []).forEach((ord: any) => {
    if (ord.customer_id) {
      uniqueCustomersWithDue.add(ord.customer_id);
    }
    totalOutstanding += Number(ord.due_amount || 0);
  });

  // 3. Payments collected today
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();

  const { data: todayPayments, error: payErr } = await (supabase as any)
    .from('payments')
    .select('amount')
    .gte('created_at', todayStart);

  if (payErr) throw new Error(payErr.message);

  const collectedToday = (todayPayments || []).reduce(
    (sum: number, p: any) => sum + Number(p.amount || 0),
    0
  );

  return {
    totalCustomers: totalCustomers || 0,
    customersWithDue: uniqueCustomersWithDue.size,
    totalOutstanding,
    collectedToday,
  };
}

export async function fetchCustomerLedger(customerId: string): Promise<CustomerLedgerEntry[]> {
  // 1. Fetch non-cancelled orders
  const { data: rawOrders, error: orderErr } = await (supabase as any)
    .from('orders')
    .select('id, order_number, total_amount, paid_amount, due_amount, payment_method, payment_status, created_at')
    .eq('customer_id', customerId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (orderErr) throw new Error(orderErr.message);

  // 2. Fetch payments recorded
  const { data: rawPayments, error: payErr } = await (supabase as any)
    .from('payments')
    .select(`
      id,
      order_id,
      amount,
      payment_method,
      notes,
      created_at,
      orders:order_id ( order_number )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });

  if (payErr) throw new Error(payErr.message);

  const paymentOrderIds = new Set((rawPayments || []).map((p: any) => p.order_id).filter(Boolean));

  // Build raw transaction items
  type RawTx = {
    id: string;
    date: string;
    type: 'order' | 'payment';
    reference: string;
    description: string;
    paymentMethod?: string | null;
    debit: number;
    credit: number;
    orderId?: string | null;
    paymentId?: string | null;
  };

  const rawTransactions: RawTx[] = [];

  // Add orders as debits
  (rawOrders || []).forEach((ord: any) => {
    rawTransactions.push({
      id: `ord-${ord.id}`,
      date: ord.created_at,
      type: 'order',
      reference: ord.order_number || `ORD-${ord.id.slice(0, 6)}`,
      description: `Cafe Order (${(ord.payment_method || 'CASH').toUpperCase()})`,
      paymentMethod: ord.payment_method,
      debit: Number(ord.total_amount || 0),
      credit: 0,
      orderId: ord.id,
    });

    // If order was paid at checkout and no separate row exists in payments table, add initial credit
    if (Number(ord.paid_amount || 0) > 0 && !paymentOrderIds.has(ord.id)) {
      rawTransactions.push({
        id: `ord-init-pay-${ord.id}`,
        date: ord.created_at,
        type: 'payment',
        reference: ord.order_number || `ORD-${ord.id.slice(0, 6)}`,
        description: `Payment at Checkout (${(ord.payment_method || 'CASH').toUpperCase()})`,
        paymentMethod: ord.payment_method,
        debit: 0,
        credit: Number(ord.paid_amount || 0),
        orderId: ord.id,
      });
    }
  });

  // Add recorded payments as credits
  (rawPayments || []).forEach((pay: any) => {
    const orderRef = pay.orders?.order_number;
    rawTransactions.push({
      id: `pay-${pay.id}`,
      date: pay.created_at,
      type: 'payment',
      reference: orderRef ? `${orderRef}` : `PAY-${pay.id.slice(0, 6)}`,
      description: pay.notes ? `Payment: ${pay.notes}` : `Payment Received (${(pay.payment_method || 'CASH').toUpperCase()})`,
      paymentMethod: pay.payment_method,
      debit: 0,
      credit: Number(pay.amount || 0),
      orderId: pay.order_id || null,
      paymentId: pay.id,
    });
  });

  // Sort strictly chronological ascending
  rawTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate cumulative running balance
  let currentBalance = 0;
  const ledgerEntries: CustomerLedgerEntry[] = rawTransactions.map((tx) => {
    currentBalance = currentBalance + tx.debit - tx.credit;
    return {
      ...tx,
      runningBalance: Math.max(0, currentBalance),
    };
  });

  // Return newest transactions first for intuitive reading
  return ledgerEntries.reverse();
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
    .gt('due_amount', 0)
    .neq('status', 'cancelled');

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

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  const updateData: any = {};
  if (payload.name !== undefined) updateData.name = payload.name.trim();
  if (payload.phone !== undefined) updateData.phone = payload.phone.trim();
  if (payload.notes !== undefined) updateData.notes = payload.notes?.trim() || null;
  if (payload.credit_limit !== undefined) updateData.credit_limit = payload.credit_limit;
  if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

  const { error } = await (supabase as any)
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique') || error.message.includes('phone')) {
      throw new Error('A customer with this phone number already exists.');
    }
    throw new Error(error.message);
  }

  return fetchCustomerById(id) as Promise<Customer>;
}

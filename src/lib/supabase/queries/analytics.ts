import { supabase } from '../client';
import type {
  AnalyticsDateRange,
  AnalyticsMetrics,
  DailySummaryMetrics,
  PaymentMethodBreakdownItem,
  RevenueTrendPoint,
  TopSellingItem,
  CafeDashboardMetrics,
  OutstandingCustomerSummary,
} from '../../../types';

/**
 * Calculates strict start and end ISO bounds for analytics queries.
 * Operates in local cafe timezone without UTC day-shifting.
 */
export function getDateBounds(range: AnalyticsDateRange, customStart?: string, customEnd?: string) {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (range === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (range === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (range === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (range === 'custom' && customStart && customEnd) {
    const [sY, sM, sD] = customStart.split('-').map(Number);
    const [eY, eM, eD] = customEnd.split('-').map(Number);
    startDate = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
    endDate = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
  } else if (range === 'custom' && customStart) {
    const [sY, sM, sD] = customStart.split('-').map(Number);
    startDate = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
}

/**
 * Calculates yesterday's date bounds for comparison calculations
 */
export function getYesterdayBounds() {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
  const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

  return {
    yesterdayStartISO: start.toISOString(),
    yesterdayEndISO: end.toISOString(),
  };
}

/**
 * Fetches comprehensive, accurate operational dashboard metrics for RadhaCafe
 */
export async function fetchCafeDashboardMetrics(): Promise<CafeDashboardMetrics> {
  const { startISO: todayStart, endISO: todayEnd } = getDateBounds('today');
  const { yesterdayStartISO, yesterdayEndISO } = getYesterdayBounds();

  // 1. Fetch today's completed cafe orders
  const { data: todayOrders, error: todayOrdersErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      paid_amount,
      due_amount,
      payment_status,
      payment_method,
      status,
      created_at,
      order_items ( item_name, quantity, total_price )
    `)
    .eq('status', 'completed')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  if (todayOrdersErr) throw new Error(todayOrdersErr.message);

  const completedToday = todayOrders || [];
  const total_orders = completedToday.length;
  const total_revenue = completedToday.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  // Items sold & Item count mapping
  const itemMap = new Map<string, { quantity: number; revenue: number }>();
  let total_items_sold = 0;

  // Hourly order tracking for peak sales hour calculation
  const hourMap = new Map<number, { orders: number; revenue: number }>();

  completedToday.forEach((order: any) => {
    // Peak hour
    const hour = new Date(order.created_at).getHours();
    const currHour = hourMap.get(hour) || { orders: 0, revenue: 0 };
    hourMap.set(hour, {
      orders: currHour.orders + 1,
      revenue: currHour.revenue + Number(order.total_amount || 0),
    });

    // Items
    (order.order_items || []).forEach((item: any) => {
      const q = Number(item.quantity || 0);
      const p = Number(item.total_price || 0);
      total_items_sold += q;

      const name = item.item_name || 'Coffee';
      const currItem = itemMap.get(name) || { quantity: 0, revenue: 0 };
      itemMap.set(name, {
        quantity: currItem.quantity + q,
        revenue: currItem.revenue + p,
      });
    });
  });

  // Determine top-selling item today
  let top_item: TopSellingItem | null = null;
  if (itemMap.size > 0) {
    const sortedItems = Array.from(itemMap.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.quantity - a.quantity);

    if (sortedItems.length > 0) {
      top_item = {
        rank: 1,
        name: sortedItems[0].name,
        quantity: sortedItems[0].quantity,
        revenue: sortedItems[0].revenue,
      };
    }
  }

  // Determine peak hour today
  let peak_hour: { label: string; orders: number; revenue: number } | null = null;
  if (hourMap.size > 0) {
    let maxHour = -1;
    let maxOrders = -1;
    let maxRevenue = 0;

    hourMap.forEach((val, hour) => {
      if (val.orders > maxOrders) {
        maxOrders = val.orders;
        maxHour = hour;
        maxRevenue = val.revenue;
      }
    });

    if (maxHour >= 0 && maxOrders > 0) {
      const startH = maxHour % 12 || 12;
      const startAmPm = maxHour >= 12 ? 'PM' : 'AM';
      const endH = (maxHour + 1) % 12 || 12;
      const endAmPm = maxHour + 1 >= 12 && maxHour + 1 < 24 ? 'PM' : 'AM';

      peak_hour = {
        label: `${startH} ${startAmPm} – ${endH} ${endAmPm}`,
        orders: maxOrders,
        revenue: maxRevenue,
      };
    }
  }

  // 2. Fetch payments recorded today (from payment ledger receipts)
  const { data: todayPayments } = await (supabase as any)
    .from('payments')
    .select('amount')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  const paymentsLedgerTotal = (todayPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  // Direct paid orders cash collected today
  const directPaidToday = completedToday
    .filter((o: any) => o.payment_status === 'paid' && o.payment_method !== 'pay_later')
    .reduce((sum: number, o: any) => sum + Number(o.paid_amount ?? o.total_amount ?? 0), 0);

  const collected_today = directPaidToday + paymentsLedgerTotal;

  // 3. Fetch Total Outstanding Credit across all active completed orders
  const { data: outstandingOrders } = await (supabase as any)
    .from('orders')
    .select('customer_id, due_amount')
    .eq('status', 'completed')
    .gt('due_amount', 0);

  const activeDues = outstandingOrders || [];
  const outstanding_credit = activeDues.reduce((sum: number, o: any) => sum + Number(o.due_amount || 0), 0);
  const uniqueDueCustomerIds = new Set(activeDues.filter((o: any) => o.customer_id).map((o: any) => o.customer_id));
  const customers_with_dues_count = uniqueDueCustomerIds.size;

  // 4. Fetch yesterday's completed orders for trend percentage calculations
  const { data: yesterdayOrders } = await (supabase as any)
    .from('orders')
    .select('total_amount')
    .eq('status', 'completed')
    .gte('created_at', yesterdayStartISO)
    .lte('created_at', yesterdayEndISO);

  const yesterdayCompleted = yesterdayOrders || [];
  const yesterday_orders = yesterdayCompleted.length;
  const yesterday_revenue = yesterdayCompleted.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

  const revenue_change_pct =
    yesterday_revenue > 0
      ? Math.round(((total_revenue - yesterday_revenue) / yesterday_revenue) * 100)
      : total_revenue > 0
      ? 100
      : null;

  const orders_change_pct =
    yesterday_orders > 0
      ? Math.round(((total_orders - yesterday_orders) / yesterday_orders) * 100)
      : total_orders > 0
      ? 100
      : null;

  return {
    total_revenue,
    total_orders,
    avg_order_value,
    total_items_sold,
    collected_today,
    outstanding_credit,
    customers_with_dues_count,
    yesterday_revenue,
    yesterday_orders,
    revenue_change_pct,
    orders_change_pct,
    peak_hour,
    top_item,
  };
}

/**
 * Fetches top customers with active outstanding balances for quick operational follow-up
 */
export async function fetchCafeOutstandingCustomers(limit = 5): Promise<OutstandingCustomerSummary[]> {
  const { data: ordersWithDues, error } = await (supabase as any)
    .from('orders')
    .select(`
      customer_id,
      customer_name,
      due_amount,
      created_at,
      customer:customers ( id, name, phone )
    `)
    .eq('status', 'completed')
    .gt('due_amount', 0)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  if (!ordersWithDues || ordersWithDues.length === 0) return [];

  const customerMap = new Map<string, { name: string; phone: string | null; totalDue: number; oldestDue: string; ordersCount: number }>();

  ordersWithDues.forEach((ord: any) => {
    const custId = ord.customer_id || ord.customer?.id;
    if (!custId) return;

    const name = ord.customer?.name || ord.customer_name || 'Customer';
    const phone = ord.customer?.phone || null;
    const due = Number(ord.due_amount || 0);

    const existing = customerMap.get(custId) || {
      name,
      phone,
      totalDue: 0,
      oldestDue: ord.created_at,
      ordersCount: 0,
    };

    existing.totalDue += due;
    existing.ordersCount += 1;
    if (new Date(ord.created_at) < new Date(existing.oldestDue)) {
      existing.oldestDue = ord.created_at;
    }

    customerMap.set(custId, existing);
  });

  const sorted = Array.from(customerMap.entries())
    .map(([customer_id, val]) => ({
      customer_id,
      customer_name: val.name,
      phone: val.phone,
      total_due: val.totalDue,
      oldest_due_date: val.oldestDue,
      orders_count: val.ordersCount,
    }))
    .sort((a, b) => b.total_due - a.total_due)
    .slice(0, limit);

  return sorted;
}

/**
 * Fetches core KPI metrics for completed orders within selected period
 */
export async function fetchAnalyticsMetrics(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsMetrics> {
  const { startISO, endISO } = getDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_items ( quantity )
    `)
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

  const completedOrders = orders || [];
  const total_orders = completedOrders.length;
  const total_revenue = completedOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  const total_items_sold = completedOrders.reduce((sum: number, o: any) => {
    const itemsQty = (o.order_items || []).reduce((iSum: number, item: any) => iSum + Number(item.quantity || 0), 0);
    return sum + itemsQty;
  }, 0);

  return {
    total_revenue,
    total_orders,
    avg_order_value,
    total_items_sold,
  };
}

/**
 * Fetches revenue trend plot data points aggregated by hour or day
 */
export async function fetchRevenueTrend(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<RevenueTrendPoint[]> {
  const { startISO, endISO } = getDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select('created_at, total_amount')
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const trendMap = new Map<string, { revenue: number; orders: number }>();

  // If today, initialize business hours (5 AM to 10 PM) so charts have smooth time progression
  if (range === 'today') {
    for (let h = 5; h <= 22; h++) {
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      trendMap.set(hStr, { revenue: 0, orders: 0 });
    }
  }

  (orders || []).forEach((o: any) => {
    const dateObj = new Date(o.created_at);
    let label = '';

    if (range === 'today') {
      label = `${dateObj.getHours().toString().padStart(2, '0')}:00`;
    } else {
      label = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
    }

    const current = trendMap.get(label) || { revenue: 0, orders: 0 };
    trendMap.set(label, {
      revenue: current.revenue + Number(o.total_amount || 0),
      orders: current.orders + 1,
    });
  });

  const points: RevenueTrendPoint[] = Array.from(trendMap.entries()).map(([label, val]) => ({
    label,
    revenue: val.revenue,
    orders: val.orders,
  }));

  return points;
}

/**
 * Fetches top-selling menu items ranked by completed quantity sold
 */
export async function fetchTopSellingItems(
  range: AnalyticsDateRange = 'today',
  customStartOrLimit?: string | number,
  customEnd?: string,
  limit = 5
): Promise<TopSellingItem[]> {
  const actualLimit = typeof customStartOrLimit === 'number' ? customStartOrLimit : limit;
  const actualStart = typeof customStartOrLimit === 'string' ? customStartOrLimit : undefined;

  const { startISO, endISO } = getDateBounds(range, actualStart, customEnd);

  const { data, error } = await (supabase as any)
    .from('order_items')
    .select(`
      item_name,
      quantity,
      total_price,
      order:orders!inner ( status, created_at )
    `)
    .eq('order.status', 'completed')
    .gte('order.created_at', startISO)
    .lte('order.created_at', endISO);

  if (error) throw new Error(error.message);

  const itemMap = new Map<string, { quantity: number; revenue: number }>();

  (data || []).forEach((row: any) => {
    const name = row.item_name || 'Unknown Item';
    const current = itemMap.get(name) || { quantity: 0, revenue: 0 };
    itemMap.set(name, {
      quantity: current.quantity + Number(row.quantity || 0),
      revenue: current.revenue + Number(row.total_price || 0),
    });
  });

  const sorted = Array.from(itemMap.entries())
    .map(([name, val]) => ({
      name,
      quantity: val.quantity,
      revenue: val.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, actualLimit);

  return sorted.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
}

/**
 * Fetches payment method breakdown for completed orders (Cash, Card, UPI, Pay Later)
 */
export async function fetchPaymentMethodBreakdown(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<PaymentMethodBreakdownItem[]> {
  const { startISO, endISO } = getDateBounds(range, customStart, customEnd);

  const { data, error } = await (supabase as any)
    .from('orders')
    .select('payment_method, total_amount')
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

  const methodsMap: Record<string, { label: string; order_count: number; revenue: number }> = {
    cash: { label: 'Cash', order_count: 0, revenue: 0 },
    upi: { label: 'UPI', order_count: 0, revenue: 0 },
    card: { label: 'Card', order_count: 0, revenue: 0 },
    pay_later: { label: 'Pay Later', order_count: 0, revenue: 0 },
    other: { label: 'Other', order_count: 0, revenue: 0 },
  };

  let grandTotalRevenue = 0;

  (data || []).forEach((row: any) => {
    const rawMethod = (row.payment_method || 'other').toLowerCase();
    const methodKey = methodsMap[rawMethod] ? rawMethod : 'other';
    const amt = Number(row.total_amount || 0);

    methodsMap[methodKey].order_count += 1;
    methodsMap[methodKey].revenue += amt;
    grandTotalRevenue += amt;
  });

  return Object.entries(methodsMap)
    .filter(([_, val]) => val.order_count > 0 || grandTotalRevenue === 0)
    .map(([method, val]) => ({
      method,
      label: val.label,
      order_count: val.order_count,
      revenue: val.revenue,
      percentage: grandTotalRevenue > 0 ? Math.round((val.revenue / grandTotalRevenue) * 100) : 0,
    }));
}

/**
 * Fetches historical daily performance records from the daily_summary database view
 */
export async function fetchHistoricalDailySummaries(limit = 30): Promise<DailySummaryMetrics[]> {
  const { data, error } = await (supabase as any)
    .from('daily_summary')
    .select('*')
    .order('order_date', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    order_date: row.order_date,
    total_orders: Number(row.total_orders || 0),
    total_revenue: Number(row.total_revenue || 0),
    avg_order_value: Number(row.avg_order_value || 0),
    total_items_sold: Number(row.total_items_sold || 0),
  }));
}

/**
 * Fetches complete order rows for CSV export matching selected date bounds
 */
export async function fetchExportOrdersData(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  const { startISO, endISO } = getDateBounds(range, customStart, customEnd);

  const { data, error } = await (supabase as any)
    .from('orders')
    .select('*')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

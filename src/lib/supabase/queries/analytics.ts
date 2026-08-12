import { supabase } from '../client';
import type {
  AnalyticsDateRange,
  AnalyticsMetrics,
  DailySummaryMetrics,
  PaymentMethodBreakdownItem,
  RevenueTrendPoint,
  TopSellingItem,
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
 * Fetches payment method breakdown for completed orders (Cash, Card, UPI, Other)
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

  return Object.entries(methodsMap).map(([method, val]) => ({
    method,
    label: val.label,
    order_count: val.order_count,
    revenue: val.revenue,
    percentage: grandTotalRevenue > 0 ? (val.revenue / grandTotalRevenue) * 100 : 0,
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

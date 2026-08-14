import { supabase } from '../client';
import type {
  AnalyticsDateRange,
  AnalyticsGranularity,
  DateRangeBounds,
  CafeAnalyticsSummary,
  CafeTrendPoint,
  CafeProductPerformance,
  CafeCategoryPerformance,
  CafePaymentSummary,
  CafeCreditAnalytics,
  CafePeakHoursAnalytics,
  CafePeakHourPoint,
  CafeDayOfWeekPoint,
  CafeDailyRecord,
  CafeDashboardMetrics,
  OutstandingCustomerSummary,
  DailySummaryMetrics,
  RevenueTrendPoint,
  TopSellingItem,
  PaymentMethodBreakdownItem,
} from '../../../types';

/**
 * Normalizes date bounds in Cafe local timezone (IST / local system)
 * Computes exact current and preceding comparison periods.
 */
export function getAnalyticsDateBounds(
  range: AnalyticsDateRange = '7d',
  customStart?: string,
  customEnd?: string
): DateRangeBounds {
  const now = new Date();

  // Helper to construct local midnight (00:00:00.000) and end-of-day (23:59:59.999)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let label = 'Last 7 Days';
  let comparisonLabel = 'vs previous 7 days';
  let granularity: AnalyticsGranularity = 'day';

  if (range === 'today') {
    startDate = startOfDay(now);
    endDate = endOfDay(now);
    
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    prevStartDate = startOfDay(yest);
    prevEndDate = endOfDay(yest);

    label = 'Today';
    comparisonLabel = 'vs yesterday';
    granularity = 'hour';
  } else if (range === 'yesterday') {
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    startDate = startOfDay(yest);
    endDate = endOfDay(yest);

    const dayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    prevStartDate = startOfDay(dayBefore);
    prevEndDate = endOfDay(dayBefore);

    label = 'Yesterday';
    comparisonLabel = 'vs day before';
    granularity = 'hour';
  } else if (range === '7d' || range === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    startDate = startOfDay(start);
    endDate = endOfDay(now);

    const prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    prevStartDate = startOfDay(prevStart);
    prevEndDate = endOfDay(prevEnd);

    label = range === 'week' ? 'This Week' : 'Last 7 Days';
    comparisonLabel = 'vs previous 7 days';
    granularity = 'day';
  } else if (range === '30d') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    startDate = startOfDay(start);
    endDate = endOfDay(now);

    const prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    prevStartDate = startOfDay(prevStart);
    prevEndDate = endOfDay(prevEnd);

    label = 'Last 30 Days';
    comparisonLabel = 'vs previous 30 days';
    granularity = 'day';
  } else if (range === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = endOfDay(now);

    // Same period in previous month
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const currentDayOfMonth = now.getDate();
    const prevEndDay = Math.min(currentDayOfMonth, prevMonthDays);

    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, prevEndDay, 23, 59, 59, 999);

    label = 'This Month';
    comparisonLabel = 'vs same period last month';
    granularity = 'day';
  } else if (range === 'prev_month') {
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    startDate = firstOfLastMonth;
    endDate = lastOfLastMonth;

    const firstOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
    const lastOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    prevStartDate = firstOfTwoMonthsAgo;
    prevEndDate = lastOfTwoMonthsAgo;

    label = 'Previous Month';
    comparisonLabel = 'vs month prior';
    granularity = 'day';
  } else if (range === 'custom' && customStart && customEnd) {
    const [sY, sM, sD] = customStart.split('-').map(Number);
    const [eY, eM, eD] = customEnd.split('-').map(Number);
    startDate = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
    endDate = new Date(eY, eM - 1, eD, 23, 59, 59, 999);

    const durationMs = endDate.getTime() - startDate.getTime();
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - durationMs);

    label = `${customStart} to ${customEnd}`;
    comparisonLabel = 'vs preceding period';

    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    if (days <= 2) granularity = 'hour';
    else if (days <= 62) granularity = 'day';
    else if (days <= 180) granularity = 'week';
    else granularity = 'month';
  } else {
    // Default fallback to 7 days
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    startDate = startOfDay(start);
    endDate = endOfDay(now);

    const prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    prevStartDate = startOfDay(prevStart);
    prevEndDate = endOfDay(prevEnd);

    label = 'Last 7 Days';
    comparisonLabel = 'vs previous 7 days';
    granularity = 'day';
  }

  const daysCount = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    range,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    prevStartISO: prevStartDate.toISOString(),
    prevEndISO: prevEndDate.toISOString(),
    label,
    comparisonLabel,
    granularity,
    daysCount,
    customStart,
    customEnd,
  };
}

/**
 * Calculates percentage change between current and previous values safely
 */
export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null; // Signals "Up from ₹0" / "New activity"
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Legacy compatibility alias for existing components
 */
export function getDateBounds(range: AnalyticsDateRange, customStart?: string, customEnd?: string) {
  const bounds = getAnalyticsDateBounds(range, customStart, customEnd);
  return {
    startISO: bounds.startISO,
    endISO: bounds.endISO,
  };
}

/**
 * Fetches comprehensive primary business summary with true prior-period comparisons
 */
export async function fetchCafeAnalyticsSummary(bounds: DateRangeBounds): Promise<CafeAnalyticsSummary> {
  const { startISO, endISO, prevStartISO, prevEndISO } = bounds;

  // 1. Fetch current period completed orders + cancelled orders
  const { data: currentOrders, error: curErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      paid_amount,
      due_amount,
      discount_amount,
      payment_status,
      payment_method,
      status,
      created_at,
      order_items ( item_name, quantity, total_price )
    `)
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (curErr) throw new Error(curErr.message);

  // 2. Fetch previous period completed orders for comparison
  const { data: prevOrders, error: prevErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      paid_amount,
      due_amount,
      status,
      order_items ( quantity )
    `)
    .eq('status', 'completed')
    .gte('created_at', prevStartISO)
    .lte('created_at', prevEndISO);

  if (prevErr) throw new Error(prevErr.message);

  // 3. Fetch payments collected in current period and previous period
  const { data: curPayments, error: curPayErr } = await (supabase as any)
    .from('payments')
    .select('amount, payment_method, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (curPayErr) throw new Error(curPayErr.message);

  const { data: prevPayments, error: prevPayErr } = await (supabase as any)
    .from('payments')
    .select('amount, created_at')
    .gte('created_at', prevStartISO)
    .lte('created_at', prevEndISO);

  if (prevPayErr) throw new Error(prevPayErr.message);

  // 4. Fetch all active completed orders with outstanding dues across the entire cafe
  const { data: outstandingOrders, error: outErr } = await (supabase as any)
    .from('orders')
    .select('customer_id, due_amount')
    .eq('status', 'completed')
    .gt('due_amount', 0);

  if (outErr) throw new Error(outErr.message);

  // -------------------------------------------------------------
  // Process Current Period Metrics
  // -------------------------------------------------------------
  const allOrders = currentOrders || [];
  const completedOrders = allOrders.filter((o: any) => o.status === 'completed');
  const cancelledOrders = allOrders.filter((o: any) => o.status === 'cancelled');

  const sales_revenue = completedOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const completed_orders = completedOrders.length;
  const avg_order_value = completed_orders > 0 ? Math.round(sales_revenue / completed_orders) : 0;
  const total_discount_amount = completedOrders.reduce((sum: number, o: any) => sum + Number(o.discount_amount || 0), 0);
  const cancelled_orders_count = cancelledOrders.length;

  let total_items_sold = 0;
  const itemMap = new Map<string, { quantity: number; revenue: number }>();
  const hourMap = new Map<number, { orders: number; revenue: number }>();

  completedOrders.forEach((o: any) => {
    // Peak hour analysis
    const hour = new Date(o.created_at).getHours();
    const currH = hourMap.get(hour) || { orders: 0, revenue: 0 };
    hourMap.set(hour, {
      orders: currH.orders + 1,
      revenue: currH.revenue + Number(o.total_amount || 0),
    });

    // Items calculation
    (o.order_items || []).forEach((item: any) => {
      const q = Number(item.quantity || 0);
      const p = Number(item.total_price || 0);
      total_items_sold += q;

      const name = item.item_name || 'Cafe Item';
      const currI = itemMap.get(name) || { quantity: 0, revenue: 0 };
      itemMap.set(name, {
        quantity: currI.quantity + q,
        revenue: currI.revenue + p,
      });
    });
  });

  // Determine top selling item
  let top_selling_item: { name: string; quantity: number; revenue: number } | null = null;
  if (itemMap.size > 0) {
    const sortedItems = Array.from(itemMap.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.quantity - a.quantity);

    if (sortedItems.length > 0) {
      top_selling_item = sortedItems[0];
    }
  }

  // Determine peak hour
  let busiest_hour: { label: string; orders: number; revenue: number } | null = null;
  if (hourMap.size > 0) {
    let maxHour = -1;
    let maxOrders = 0;
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
      busiest_hour = {
        label: `${startH} ${startAmPm} – ${endH} ${endAmPm}`,
        orders: maxOrders,
        revenue: maxRevenue,
      };
    }
  }

  // Collections calculation (Source of truth: payments ledger + upfront paid orders)
  const paymentsList = curPayments || [];
  let collected_amount = 0;
  let upi_amount = 0;

  if (paymentsList.length > 0) {
    collected_amount = paymentsList.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    upi_amount = paymentsList
      .filter((p: any) => (p.payment_method || '').toLowerCase() === 'upi')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  } else {
    // Fallback if payments ledger is empty for older orders
    collected_amount = completedOrders.reduce((sum: number, o: any) => sum + Number(o.paid_amount || 0), 0);
    upi_amount = completedOrders
      .filter((o: any) => (o.payment_method || '').toLowerCase() === 'upi')
      .reduce((sum: number, o: any) => sum + Number(o.paid_amount || 0), 0);
  }

  const upi_collection_pct = collected_amount > 0 ? Math.round((upi_amount / collected_amount) * 100) : 0;

  // Active current outstanding across cafe
  const duesList = outstandingOrders || [];
  const current_outstanding = duesList.reduce((sum: number, o: any) => sum + Number(o.due_amount || 0), 0);
  const dueCustIds = new Set(duesList.filter((o: any) => o.customer_id).map((o: any) => o.customer_id));
  const customers_with_dues = dueCustIds.size;

  // -------------------------------------------------------------
  // Process Previous Period Metrics
  // -------------------------------------------------------------
  const prevCompleted = prevOrders || [];
  const prev_sales_revenue = prevCompleted.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const prev_completed_orders = prevCompleted.length;
  const prev_avg_order_value = prev_completed_orders > 0 ? Math.round(prev_sales_revenue / prev_completed_orders) : 0;
  const prev_total_items_sold = prevCompleted.reduce((sum: number, o: any) => {
    const q = (o.order_items || []).reduce((iSum: number, item: any) => iSum + Number(item.quantity || 0), 0);
    return sum + q;
  }, 0);

  const prevPaymentsList = prevPayments || [];
  const prev_collected_amount =
    prevPaymentsList.length > 0
      ? prevPaymentsList.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
      : prevCompleted.reduce((sum: number, o: any) => sum + Number(o.paid_amount || 0), 0);

  // Comparison Percentages
  const sales_change_pct = calculatePercentageChange(sales_revenue, prev_sales_revenue);
  const orders_change_pct = calculatePercentageChange(completed_orders, prev_completed_orders);
  const aov_change_pct = calculatePercentageChange(avg_order_value, prev_avg_order_value);
  const items_change_pct = calculatePercentageChange(total_items_sold, prev_total_items_sold);
  const collected_change_pct = calculatePercentageChange(collected_amount, prev_collected_amount);

  return {
    sales_revenue,
    completed_orders,
    avg_order_value,
    total_items_sold,
    collected_amount,
    current_outstanding,
    customers_with_dues,
    cancelled_orders_count,
    total_discount_amount,
    prev_sales_revenue,
    prev_completed_orders,
    prev_avg_order_value,
    prev_total_items_sold,
    prev_collected_amount,
    sales_change_pct,
    orders_change_pct,
    aov_change_pct,
    items_change_pct,
    collected_change_pct,
    top_selling_item,
    top_category: null, // Will be enriched from category query
    busiest_hour,
    upi_collection_pct,
  };
}

/**
 * Fetches time-series trend points (Hourly, Daily, Weekly, Monthly) with Sales, Orders, AOV, and Collections
 */
export async function fetchCafeTrendData(bounds: DateRangeBounds): Promise<CafeTrendPoint[]> {
  const { startISO, endISO, granularity } = bounds;

  // 1. Fetch completed orders
  const { data: orders, error: ordErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      paid_amount,
      status,
      created_at,
      order_items ( quantity )
    `)
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: true });

  if (ordErr) throw new Error(ordErr.message);

  // 2. Fetch payments
  const { data: payments, error: payErr } = await (supabase as any)
    .from('payments')
    .select('amount, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (payErr) throw new Error(payErr.message);

  const start = new Date(startISO);
  const end = new Date(endISO);
  const pointsMap = new Map<string, { label: string; sales: number; orders: number; items: number; collected: number }>();

  // Pre-seed continuous timeline buckets so charts don't have broken gaps
  if (granularity === 'hour') {
    // 00:00 to 23:00
    for (let h = 0; h < 24; h++) {
      const hStr = `${h.toString().padStart(2, '0')}:00`;
      const hour12 = h % 12 || 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      pointsMap.set(hStr, {
        label: `${hour12} ${ampm}`,
        sales: 0,
        orders: 0,
        items: 0,
        collected: 0,
      });
    }
  } else if (granularity === 'day') {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const stop = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cur <= stop) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const displayLabel = `${cur.getDate()} ${cur.toLocaleString('default', { month: 'short' })}`;

      pointsMap.set(dateKey, {
        label: displayLabel,
        sales: 0,
        orders: 0,
        items: 0,
        collected: 0,
      });

      cur.setDate(cur.getDate() + 1);
    }
  }

  // Populate completed orders
  (orders || []).forEach((o: any) => {
    const d = new Date(o.created_at);
    let key = '';

    if (granularity === 'hour') {
      key = `${d.getHours().toString().padStart(2, '0')}:00`;
    } else if (granularity === 'day') {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      key = `${yyyy}-${mm}-${dd}`;
    } else {
      // Weekly or monthly
      key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    }

    const itemsCount = (o.order_items || []).reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0);
    const existing = pointsMap.get(key) || {
      label: key,
      sales: 0,
      orders: 0,
      items: 0,
      collected: 0,
    };

    existing.sales += Number(o.total_amount || 0);
    existing.orders += 1;
    existing.items += itemsCount;
    pointsMap.set(key, existing);
  });

  // Populate payments
  (payments || []).forEach((p: any) => {
    const d = new Date(p.created_at);
    let key = '';

    if (granularity === 'hour') {
      key = `${d.getHours().toString().padStart(2, '0')}:00`;
    } else if (granularity === 'day') {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      key = `${yyyy}-${mm}-${dd}`;
    } else {
      key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    }

    if (pointsMap.has(key)) {
      pointsMap.get(key)!.collected += Number(p.amount || 0);
    }
  });

  return Array.from(pointsMap.entries()).map(([key, val]) => ({
    key,
    label: val.label,
    sales: val.sales,
    orders: val.orders,
    aov: val.orders > 0 ? Math.round(val.sales / val.orders) : 0,
    items: val.items,
    collected: val.collected,
  }));
}

/**
 * Fetches top menu products ranked by quantity sold and item revenue
 */
export async function fetchCafeProductPerformance(
  bounds: DateRangeBounds,
  limit = 10
): Promise<CafeProductPerformance[]> {
  const { startISO, endISO } = bounds;

  const { data, error } = await (supabase as any)
    .from('order_items')
    .select(`
      item_name,
      quantity,
      unit_price,
      total_price,
      menu_item:menu_items (
        id,
        name,
        category:categories ( name )
      ),
      order:orders!inner (
        id,
        status,
        created_at
      )
    `)
    .eq('order.status', 'completed')
    .gte('order.created_at', startISO)
    .lte('order.created_at', endISO);

  if (error) throw new Error(error.message);

  const productMap = new Map<
    string,
    {
      item_name: string;
      category_name: string;
      quantity_sold: number;
      revenue: number;
      order_ids: Set<string>;
    }
  >();

  let grandTotalRevenue = 0;

  (data || []).forEach((row: any) => {
    const name = row.item_name || row.menu_item?.name || 'Cafe Item';
    const catName = row.menu_item?.category?.name || 'Specialties';
    const q = Number(row.quantity || 0);
    const rev = Number(row.total_price || 0);
    const ordId = row.order?.id;

    grandTotalRevenue += rev;

    const existing = productMap.get(name) || {
      item_name: name,
      category_name: catName,
      quantity_sold: 0,
      revenue: 0,
      order_ids: new Set<string>(),
    };

    existing.quantity_sold += q;
    existing.revenue += rev;
    if (ordId) existing.order_ids.add(ordId);

    productMap.set(name, existing);
  });

  const sorted = Array.from(productMap.values())
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, limit);

  return sorted.map((p, idx) => ({
    rank: idx + 1,
    item_name: p.item_name,
    category_name: p.category_name,
    quantity_sold: p.quantity_sold,
    revenue: p.revenue,
    order_count: p.order_ids.size,
    avg_price: p.quantity_sold > 0 ? Math.round(p.revenue / p.quantity_sold) : 0,
    revenue_share_pct: grandTotalRevenue > 0 ? Number(((p.revenue / grandTotalRevenue) * 100).toFixed(1)) : 0,
  }));
}

/**
 * Fetches category performance breakdown
 */
export async function fetchCafeCategoryPerformance(bounds: DateRangeBounds): Promise<CafeCategoryPerformance[]> {
  const { startISO, endISO } = bounds;

  const { data, error } = await (supabase as any)
    .from('order_items')
    .select(`
      item_name,
      quantity,
      total_price,
      menu_item:menu_items (
        category_id,
        category:categories ( id, name )
      ),
      order:orders!inner ( status, created_at )
    `)
    .eq('order.status', 'completed')
    .gte('order.created_at', startISO)
    .lte('order.created_at', endISO);

  if (error) throw new Error(error.message);

  const catMap = new Map<
    string,
    {
      category_id: string;
      category_name: string;
      item_names: Set<string>;
      quantity_sold: number;
      revenue: number;
    }
  >();

  let grandTotalRevenue = 0;

  (data || []).forEach((row: any) => {
    const catId = row.menu_item?.category?.id || 'uncategorized';
    const catName = row.menu_item?.category?.name || 'Uncategorized / Other';
    const q = Number(row.quantity || 0);
    const rev = Number(row.total_price || 0);
    const itemName = row.item_name || 'Item';

    grandTotalRevenue += rev;

    const existing = catMap.get(catId) || {
      category_id: catId,
      category_name: catName,
      item_names: new Set<string>(),
      quantity_sold: 0,
      revenue: 0,
    };

    existing.quantity_sold += q;
    existing.revenue += rev;
    existing.item_names.add(itemName);

    catMap.set(catId, existing);
  });

  const categories = Array.from(catMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => ({
      category_id: c.category_id,
      category_name: c.category_name,
      item_count: c.item_names.size,
      quantity_sold: c.quantity_sold,
      revenue: c.revenue,
      revenue_share_pct: grandTotalRevenue > 0 ? Number(((c.revenue / grandTotalRevenue) * 100).toFixed(1)) : 0,
    }));

  return categories;
}

/**
 * Fetches payment methods collections & order payment status breakdown
 */
export async function fetchCafePaymentSummary(bounds: DateRangeBounds): Promise<CafePaymentSummary> {
  const { startISO, endISO } = bounds;

  // 1. Payments ledger collections in period
  const { data: payments, error: payErr } = await (supabase as any)
    .from('payments')
    .select('amount, payment_method, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (payErr) throw new Error(payErr.message);

  // 2. Orders payment status for completed orders in period
  const { data: orders, error: ordErr } = await (supabase as any)
    .from('orders')
    .select('id, total_amount, paid_amount, due_amount, payment_status, payment_method')
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (ordErr) throw new Error(ordErr.message);

  // Process payment methods
  const methodsMap: Record<string, { label: string; amount: number; count: number }> = {
    upi: { label: 'UPI / QR', amount: 0, count: 0 },
    cash: { label: 'Cash', amount: 0, count: 0 },
    card: { label: 'Card', amount: 0, count: 0 },
    other: { label: 'Other', amount: 0, count: 0 },
  };

  let totalCollected = 0;

  if (payments && payments.length > 0) {
    payments.forEach((p: any) => {
      const raw = (p.payment_method || 'other').toLowerCase();
      const key = methodsMap[raw] ? raw : 'other';
      const amt = Number(p.amount || 0);

      methodsMap[key].amount += amt;
      methodsMap[key].count += 1;
      totalCollected += amt;
    });
  } else {
    // Fallback if payments table was not yet populated for legacy orders
    (orders || []).forEach((o: any) => {
      const raw = (o.payment_method || 'other').toLowerCase();
      const key = methodsMap[raw] ? raw : 'other';
      const amt = Number(o.paid_amount || (o.payment_status === 'paid' ? o.total_amount : 0) || 0);

      if (amt > 0) {
        methodsMap[key].amount += amt;
        methodsMap[key].count += 1;
        totalCollected += amt;
      }
    });
  }

  const methods = Object.entries(methodsMap).map(([method, val]) => ({
    method,
    label: val.label,
    amount: val.amount,
    count: val.count,
    percentage: totalCollected > 0 ? Number(((val.amount / totalCollected) * 100).toFixed(1)) : 0,
  }));

  // Process order payment statuses (Paid in Full, Partial, Unpaid)
  const statusMap: Record<string, { label: string; order_count: number; total_amount: number; paid_amount: number; due_amount: number }> = {
    paid: { label: 'Paid in Full', order_count: 0, total_amount: 0, paid_amount: 0, due_amount: 0 },
    partial: { label: 'Partially Paid', order_count: 0, total_amount: 0, paid_amount: 0, due_amount: 0 },
    unpaid: { label: 'Unpaid / Pay Later', order_count: 0, total_amount: 0, paid_amount: 0, due_amount: 0 },
  };

  let grandOrdersCount = (orders || []).length;

  (orders || []).forEach((o: any) => {
    const rawStatus = (o.payment_status || 'paid').toLowerCase();
    const key = statusMap[rawStatus] ? rawStatus : 'paid';

    statusMap[key].order_count += 1;
    statusMap[key].total_amount += Number(o.total_amount || 0);
    statusMap[key].paid_amount += Number(o.paid_amount || (key === 'paid' ? o.total_amount : 0) || 0);
    statusMap[key].due_amount += Number(o.due_amount || 0);
  });

  const statuses = Object.entries(statusMap).map(([status, val]) => ({
    status: status as 'paid' | 'partial' | 'unpaid',
    label: val.label,
    order_count: val.order_count,
    total_amount: val.total_amount,
    paid_amount: val.paid_amount,
    due_amount: val.due_amount,
    percentage: grandOrdersCount > 0 ? Number(((val.order_count / grandOrdersCount) * 100).toFixed(1)) : 0,
  }));

  return {
    total_collected: totalCollected,
    methods,
    statuses,
  };
}

/**
 * Fetches Cafe credit / Pay Later analytics and top outstanding customers
 */
export async function fetchCafeCreditAnalytics(bounds: DateRangeBounds): Promise<CafeCreditAnalytics> {
  const { startISO, endISO } = bounds;

  // 1. Fetch all active completed orders with outstanding dues across the entire cafe
  const { data: outstandingOrders, error: outErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      customer_id,
      customer_name,
      due_amount,
      created_at,
      customer:customers ( id, name, phone )
    `)
    .eq('status', 'completed')
    .gt('due_amount', 0)
    .order('created_at', { ascending: true });

  if (outErr) throw new Error(outErr.message);

  // 2. Fetch partial completed orders
  const { data: partialOrders } = await (supabase as any)
    .from('orders')
    .select('id')
    .eq('status', 'completed')
    .eq('payment_status', 'partial');

  // 3. Fetch payments received during the period that paid off credit
  const { data: creditPayments } = await (supabase as any)
    .from('payments')
    .select(`
      amount,
      order:orders ( created_at )
    `)
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  const period_collections_from_credit = (creditPayments || []).reduce((sum: number, p: any) => {
    return sum + Number(p.amount || 0);
  }, 0);

  const duesList = outstandingOrders || [];
  const current_outstanding = duesList.reduce((sum: number, o: any) => sum + Number(o.due_amount || 0), 0);
  const outstanding_orders_count = duesList.length;
  const partial_orders_count = (partialOrders || []).length;

  // Group by customer to find top debtors
  const customerMap = new Map<
    string,
    { customer_name: string; phone: string | null; total_due: number; oldest_due_date: string; orders_count: number }
  >();

  duesList.forEach((o: any) => {
    const custId = o.customer_id || o.customer?.id;
    if (!custId) return;

    const name = o.customer?.name || o.customer_name || 'Customer';
    const phone = o.customer?.phone || null;
    const due = Number(o.due_amount || 0);

    const existing = customerMap.get(custId) || {
      customer_name: name,
      phone,
      total_due: 0,
      oldest_due_date: o.created_at,
      orders_count: 0,
    };

    existing.total_due += due;
    existing.orders_count += 1;
    if (new Date(o.created_at) < new Date(existing.oldest_due_date)) {
      existing.oldest_due_date = o.created_at;
    }

    customerMap.set(custId, existing);
  });

  const top_debtors = Array.from(customerMap.entries())
    .map(([customer_id, val]) => ({
      customer_id,
      ...val,
    }))
    .sort((a, b) => b.total_due - a.total_due)
    .slice(0, 5);

  return {
    current_outstanding,
    customers_with_dues_count: customerMap.size,
    outstanding_orders_count,
    partial_orders_count,
    period_collections_from_credit,
    top_debtors,
  };
}

/**
 * Fetches peak ordering hours and optional day-of-week breakdown
 */
export async function fetchCafePeakHours(bounds: DateRangeBounds): Promise<CafePeakHoursAnalytics> {
  const { startISO, endISO, daysCount } = bounds;

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select('id, total_amount, created_at')
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

  // Hourly buckets 0..23
  const hourMap = new Map<number, { order_count: number; revenue: number }>();
  for (let h = 0; h < 24; h++) {
    hourMap.set(h, { order_count: 0, revenue: 0 });
  }

  // Day-of-week buckets 0..6 (0 = Sun, 1 = Mon ... 6 = Sat)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = new Map<number, { order_count: number; revenue: number }>();
  for (let d = 0; d < 7; d++) {
    dayMap.set(d, { order_count: 0, revenue: 0 });
  }

  (orders || []).forEach((o: any) => {
    const dateObj = new Date(o.created_at);
    const hour = dateObj.getHours();
    const day = dateObj.getDay();
    const amt = Number(o.total_amount || 0);

    const hVal = hourMap.get(hour)!;
    hVal.order_count += 1;
    hVal.revenue += amt;

    const dVal = dayMap.get(day)!;
    dVal.order_count += 1;
    dVal.revenue += amt;
  });

  // Calculate busiest hour
  let maxHour = -1;
  let maxOrders = 0;
  let maxRevenue = 0;

  const hourly: CafePeakHourPoint[] = Array.from(hourMap.entries()).map(([hour, val]) => {
    if (val.order_count > maxOrders) {
      maxOrders = val.order_count;
      maxHour = hour;
      maxRevenue = val.revenue;
    }

    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return {
      hour,
      label: `${hour12} ${ampm}`,
      order_count: val.order_count,
      revenue: val.revenue,
    };
  });

  let busiest_hour: { label: string; orders: number; revenue: number } | null = null;
  if (maxHour >= 0 && maxOrders > 0) {
    const startH = maxHour % 12 || 12;
    const startAmPm = maxHour >= 12 ? 'PM' : 'AM';
    const endH = (maxHour + 1) % 12 || 12;
    const endAmPm = maxHour + 1 >= 12 && maxHour + 1 < 24 ? 'PM' : 'AM';

    busiest_hour = {
      label: `${startH} ${startAmPm} – ${endH} ${endAmPm}`,
      orders: maxOrders,
      revenue: maxRevenue,
    };
  }

  // Day of week breakdown (only if period >= 7 days)
  let day_of_week: CafeDayOfWeekPoint[] | undefined;
  if (daysCount >= 7) {
    // Reorder from Monday (1) to Sunday (0)
    const orderIndices = [1, 2, 3, 4, 5, 6, 0];
    day_of_week = orderIndices.map((dayIdx) => {
      const val = dayMap.get(dayIdx)!;
      return {
        day_index: dayIdx,
        day_name: dayNames[dayIdx],
        order_count: val.order_count,
        revenue: val.revenue,
        avg_order_value: val.order_count > 0 ? Math.round(val.revenue / val.order_count) : 0,
      };
    });
  }

  return {
    hourly,
    busiest_hour,
    day_of_week,
  };
}

/**
 * Fetches daily performance records for the detailed performance drilldown table
 */
export async function fetchCafeDailyPerformance(bounds: DateRangeBounds): Promise<CafeDailyRecord[]> {
  const { startISO, endISO } = bounds;

  // 1. Fetch completed orders
  const { data: orders, error: ordErr } = await (supabase as any)
    .from('orders')
    .select(`
      id,
      total_amount,
      paid_amount,
      due_amount,
      discount_amount,
      created_at,
      order_items ( quantity )
    `)
    .eq('status', 'completed')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: false });

  if (ordErr) throw new Error(ordErr.message);

  // 2. Fetch payments
  const { data: payments, error: payErr } = await (supabase as any)
    .from('payments')
    .select('amount, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (payErr) throw new Error(payErr.message);

  const dayMap = new Map<
    string,
    {
      date: string;
      formatted_date: string;
      orders: number;
      items_sold: number;
      sales: number;
      collected: number;
      discount_amount: number;
      outstanding_created: number;
    }
  >();

  (orders || []).forEach((o: any) => {
    const d = new Date(o.created_at);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const formatted = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

    const itemsQty = (o.order_items || []).reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0);

    const existing = dayMap.get(dateKey) || {
      date: dateKey,
      formatted_date: formatted,
      orders: 0,
      items_sold: 0,
      sales: 0,
      collected: 0,
      discount_amount: 0,
      outstanding_created: 0,
    };

    existing.orders += 1;
    existing.items_sold += itemsQty;
    existing.sales += Number(o.total_amount || 0);
    existing.discount_amount += Number(o.discount_amount || 0);
    existing.outstanding_created += Number(o.due_amount || 0);

    dayMap.set(dateKey, existing);
  });

  (payments || []).forEach((p: any) => {
    const d = new Date(p.created_at);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const formatted = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

    const existing = dayMap.get(dateKey) || {
      date: dateKey,
      formatted_date: formatted,
      orders: 0,
      items_sold: 0,
      sales: 0,
      collected: 0,
      discount_amount: 0,
      outstanding_created: 0,
    };

    existing.collected += Number(p.amount || 0);
    dayMap.set(dateKey, existing);
  });

  const sortedRows = Array.from(dayMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => ({
      ...r,
      aov: r.orders > 0 ? Math.round(r.sales / r.orders) : 0,
    }));

  return sortedRows;
}

/**
 * Escapes formula injection characters for safe CSV export
 */
export function sanitizeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  let str = String(field).trim();
  // Escape formulas: = + - @ \t \r
  if (['=', '+', '-', '@', '\t', '\r'].some((char) => str.startsWith(char))) {
    str = `'${str}`;
  }
  // Double quote any internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// -------------------------------------------------------------
// Legacy Functions (Preserved for Dashboard and backward-compatibility)
// -------------------------------------------------------------
export async function fetchCafeDashboardMetrics(): Promise<CafeDashboardMetrics> {
  const bounds = getAnalyticsDateBounds('today');
  const summary = await fetchCafeAnalyticsSummary(bounds);

  return {
    total_revenue: summary.sales_revenue,
    total_orders: summary.completed_orders,
    avg_order_value: summary.avg_order_value,
    total_items_sold: summary.total_items_sold,
    collected_today: summary.collected_amount,
    outstanding_credit: summary.current_outstanding,
    customers_with_dues_count: summary.customers_with_dues,
    yesterday_revenue: summary.prev_sales_revenue,
    yesterday_orders: summary.prev_completed_orders,
    revenue_change_pct: summary.sales_change_pct,
    orders_change_pct: summary.orders_change_pct,
    peak_hour: summary.busiest_hour,
    top_item: summary.top_selling_item ? { rank: 1, ...summary.top_selling_item } : null,
  };
}

export async function fetchCafeOutstandingCustomers(limit = 5): Promise<OutstandingCustomerSummary[]> {
  const bounds = getAnalyticsDateBounds('today');
  const creditData = await fetchCafeCreditAnalytics(bounds);

  return creditData.top_debtors.slice(0, limit).map((d) => ({
    customer_id: d.customer_id,
    customer_name: d.customer_name,
    phone: d.phone,
    total_due: d.total_due,
    oldest_due_date: d.oldest_due_date,
    orders_count: d.orders_count,
  }));
}

export async function fetchAnalyticsMetrics(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  const bounds = getAnalyticsDateBounds(range, customStart, customEnd);
  const summary = await fetchCafeAnalyticsSummary(bounds);
  return {
    total_revenue: summary.sales_revenue,
    total_orders: summary.completed_orders,
    avg_order_value: summary.avg_order_value,
    total_items_sold: summary.total_items_sold,
    revenue_change_pct: summary.sales_change_pct,
    orders_change_pct: summary.orders_change_pct,
  };
}

export async function fetchRevenueTrend(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<RevenueTrendPoint[]> {
  const bounds = getAnalyticsDateBounds(range, customStart, customEnd);
  const points = await fetchCafeTrendData(bounds);
  return points.map((p) => ({
    label: p.label,
    revenue: p.sales,
    orders: p.orders,
  }));
}

export async function fetchTopSellingItems(
  range: AnalyticsDateRange = 'today',
  customStartOrLimit?: string | number,
  customEnd?: string,
  limit = 5
): Promise<TopSellingItem[]> {
  const actualLimit = typeof customStartOrLimit === 'number' ? customStartOrLimit : limit;
  const actualStart = typeof customStartOrLimit === 'string' ? customStartOrLimit : undefined;

  const bounds = getAnalyticsDateBounds(range, actualStart, customEnd);
  const products = await fetchCafeProductPerformance(bounds, actualLimit);
  return products.map((p) => ({
    rank: p.rank,
    name: p.item_name,
    quantity: p.quantity_sold,
    revenue: p.revenue,
  }));
}

export async function fetchPaymentMethodBreakdown(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<PaymentMethodBreakdownItem[]> {
  const bounds = getAnalyticsDateBounds(range, customStart, customEnd);
  const paymentSummary = await fetchCafePaymentSummary(bounds);
  return paymentSummary.methods.map((m) => ({
    method: m.method,
    label: m.label,
    order_count: m.count,
    revenue: m.amount,
    percentage: m.percentage,
  }));
}

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

export async function fetchExportOrdersData(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  const bounds = getAnalyticsDateBounds(range, customStart, customEnd);
  const { data, error } = await (supabase as any)
    .from('orders')
    .select('*')
    .gte('created_at', bounds.startISO)
    .lte('created_at', bounds.endISO)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

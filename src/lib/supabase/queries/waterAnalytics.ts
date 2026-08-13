import { supabase } from '../client';
import type {
  WaterAnalyticsDateRange,
  WaterKpiSummary,
  WaterRevenuePoint,
  WaterOrderVolumePoint,
  WaterProductPerfItem,
  WaterPaymentStatusItem,
  WaterOutstandingPoint,
  WaterEventAnalyticsData,
} from '../../../types/water.types';

export function getWaterDateBounds(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): { startISO: string; endISO: string; daysCount: number } {
  const now = new Date();

  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: 1 };
  }

  if (range === 'yesterday') {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: 1 };
  }

  if (range === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: 7 };
  }

  if (range === 'days_30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: 30 };
  }

  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: days };
  }

  if (range === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: days };
  }

  if (range === 'custom' && customStart && customEnd) {
    const start = new Date(`${customStart}T00:00:00.000Z`);
    const end = new Date(`${customEnd}T23:59:59.999Z`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      daysCount: days,
    };
  }

  // Fallback today
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { startISO: start.toISOString(), endISO: end.toISOString(), daysCount: 1 };
}

function getPreviousPeriodBounds(
  startISO: string,
  daysCount: number
): { prevStartISO: string; prevEndISO: string } {
  const currentStart = new Date(startISO);
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = new Date(currentStart.getTime() - daysCount * 24 * 60 * 60 * 1000);
  return {
    prevStartISO: prevStart.toISOString(),
    prevEndISO: prevEnd.toISOString(),
  };
}

export async function fetchWaterKpiSummary(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterKpiSummary> {
  const { startISO, endISO, daysCount } = getWaterDateBounds(range, customStart, customEnd);
  const { prevStartISO, prevEndISO } = getPreviousPeriodBounds(startISO, daysCount);

  // Fetch current period orders
  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('id, total_amount, amount_paid, amount_due, created_at, items:water_order_items(item_name, quantity)')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

  // Fetch previous period orders for comparison
  const { data: prevOrders } = await (supabase as any)
    .from('water_orders')
    .select('id, total_amount, items:water_order_items(quantity)')
    .gte('created_at', prevStartISO)
    .lte('created_at', prevEndISO);

  let totalOrders = 0;
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let totalCansSold = 0;
  let normalCansSold = 0;
  let coolingCansSold = 0;

  (orders || []).forEach((ord: any) => {
    totalOrders += 1;
    totalRevenue += Number(ord.total_amount || 0);
    totalPaid += Number(ord.amount_paid || 0);
    totalDue += Number(ord.amount_due || 0);

    (ord.items || []).forEach((item: any) => {
      const qty = Number(item.quantity || 0);
      totalCansSold += qty;
      const name = (item.item_name || '').toLowerCase();
      if (name.includes('cooling')) {
        coolingCansSold += qty;
      } else {
        normalCansSold += qty;
      }
    });
  });

  let prevOrdersCount = 0;
  let prevRevenue = 0;
  let prevCans = 0;

  (prevOrders || []).forEach((ord: any) => {
    prevOrdersCount += 1;
    prevRevenue += Number(ord.total_amount || 0);
    (ord.items || []).forEach((item: any) => {
      prevCans += Number(item.quantity || 0);
    });
  });

  // Calculate percentage changes
  const revenueChangePct =
    prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
      : totalRevenue > 0
      ? 100
      : 0;

  const ordersChangePct =
    prevOrdersCount > 0
      ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100
      : totalOrders > 0
      ? 100
      : 0;

  const cansChangePct =
    prevCans > 0
      ? ((totalCansSold - prevCans) / prevCans) * 100
      : totalCansSold > 0
      ? 100
      : 0;

  // Fetch events in range
  const { data: events } = await (supabase as any)
    .from('water_event_requests')
    .select('id, status')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  const totalEvents = events?.length || 0;
  const confirmedEvents = events?.filter((e: any) => e.status === 'confirmed' || e.status === 'completed').length || 0;

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalCansSold,
    normalCansSold,
    coolingCansSold,
    totalPaid,
    totalDue,
    totalEvents,
    confirmedEvents,
    revenueChangePct: Math.round(revenueChangePct * 10) / 10,
    ordersChangePct: Math.round(ordersChangePct * 10) / 10,
    cansChangePct: Math.round(cansChangePct * 10) / 10,
  };
}

export async function fetchWaterRevenueTrend(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterRevenuePoint[]> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('id, total_amount, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, { revenue: number; orders: number; label: string }> = {};

  if (range === 'today' || range === 'yesterday') {
    // Hour-by-hour grouping (00:00 to 23:00)
    for (let h = 6; h <= 21; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      map[hourStr] = { revenue: 0, orders: 0, label: hourStr };
    }

    (orders || []).forEach((ord: any) => {
      const dt = new Date(ord.created_at);
      const h = dt.getHours();
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      if (!map[hourStr]) {
        map[hourStr] = { revenue: 0, orders: 0, label: hourStr };
      }
      map[hourStr].revenue += Number(ord.total_amount || 0);
      map[hourStr].orders += 1;
    });

    return Object.entries(map).map(([date, val]) => ({
      date,
      label: val.label,
      revenue: val.revenue,
      orders: val.orders,
    }));
  }

  // Daily grouping
  (orders || []).forEach((ord: any) => {
    const dt = new Date(ord.created_at);
    const dateKey = dt.toISOString().split('T')[0];
    const label = dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (!map[dateKey]) {
      map[dateKey] = { revenue: 0, orders: 0, label };
    }
    map[dateKey].revenue += Number(ord.total_amount || 0);
    map[dateKey].orders += 1;
  });

  return Object.entries(map).map(([date, val]) => ({
    date,
    label: val.label,
    revenue: val.revenue,
    orders: val.orders,
  }));
}

export async function fetchWaterOrderVolume(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterOrderVolumePoint[]> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('id, order_status, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, { completed: number; cancelled: number; total: number; label: string }> = {};

  (orders || []).forEach((ord: any) => {
    const dt = new Date(ord.created_at);
    const dateKey = range === 'today' || range === 'yesterday'
      ? `${dt.getHours().toString().padStart(2, '0')}:00`
      : dt.toISOString().split('T')[0];
    const label = range === 'today' || range === 'yesterday'
      ? `${dt.getHours().toString().padStart(2, '0')}:00`
      : dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (!map[dateKey]) {
      map[dateKey] = { completed: 0, cancelled: 0, total: 0, label };
    }
    map[dateKey].total += 1;
    if (ord.order_status === 'cancelled') {
      map[dateKey].cancelled += 1;
    } else {
      map[dateKey].completed += 1;
    }
  });

  return Object.entries(map).map(([date, val]) => ({
    date,
    label: val.label,
    completed: val.completed,
    cancelled: val.cancelled,
    total: val.total,
  }));
}

export async function fetchWaterProductPerformance(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterProductPerfItem[]> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  // Fetch order items joined with orders within date range
  const { data: items, error } = await (supabase as any)
    .from('water_order_items')
    .select('water_product_id, item_name, quantity, total_price, order:water_orders!inner(created_at)')
    .gte('order.created_at', startISO)
    .lte('order.created_at', endISO);

  if (error) throw new Error(error.message);

  // Fetch active products catalog for dynamic list
  const { data: products } = await (supabase as any)
    .from('water_products')
    .select('id, name');

  const prodMap: Record<string, { product_id: string; product_name: string; quantity: number; revenue: number }> = {};

  // Initialize with DB products
  (products || []).forEach((p: any) => {
    prodMap[p.id] = { product_id: p.id, product_name: p.name, quantity: 0, revenue: 0 };
  });

  let grandRevenue = 0;

  (items || []).forEach((item: any) => {
    const key = item.water_product_id || item.item_name;
    const name = item.item_name || 'Water Product';
    const qty = Number(item.quantity || 0);
    const rev = Number(item.total_price || 0);
    grandRevenue += rev;

    if (!prodMap[key]) {
      prodMap[key] = { product_id: key, product_name: name, quantity: 0, revenue: 0 };
    }
    prodMap[key].quantity += qty;
    prodMap[key].revenue += rev;
  });

  return Object.values(prodMap)
    .map((p) => ({
      ...p,
      percentage: grandRevenue > 0 ? Math.round((p.revenue / grandRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.quantity - a.quantity);
}

export async function fetchWaterPaymentSummary(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterPaymentStatusItem[]> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('payment_status, total_amount, amount_paid, amount_due')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

  let paidCount = 0;
  let paidAmount = 0;
  let partialCount = 0;
  let partialAmount = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  let totalOrdersCount = 0;

  (orders || []).forEach((ord: any) => {
    totalOrdersCount += 1;
    const due = Number(ord.amount_due || 0);
    const paid = Number(ord.amount_paid || 0);
    const total = Number(ord.total_amount || 0);

    if (ord.payment_status === 'paid' || due === 0) {
      paidCount += 1;
      paidAmount += total;
    } else if (ord.payment_status === 'partial' || (paid > 0 && due > 0)) {
      partialCount += 1;
      partialAmount += paid;
    } else {
      pendingCount += 1;
      pendingAmount += due;
    }
  });

  return [
    {
      status: 'paid',
      label: 'Fully Paid',
      count: paidCount,
      amount: paidAmount,
      percentage: totalOrdersCount > 0 ? Math.round((paidCount / totalOrdersCount) * 100) : 0,
    },
    {
      status: 'partial',
      label: 'Partially Paid',
      count: partialCount,
      amount: partialAmount,
      percentage: totalOrdersCount > 0 ? Math.round((partialCount / totalOrdersCount) * 100) : 0,
    },
    {
      status: 'pending',
      label: 'Pay Later / Pending',
      count: pendingCount,
      amount: pendingAmount,
      percentage: totalOrdersCount > 0 ? Math.round((pendingCount / totalOrdersCount) * 100) : 0,
    },
  ];
}

export async function fetchWaterOutstandingTrend(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterOutstandingPoint[]> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('amount_due, created_at')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .gt('amount_due', 0)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const map: Record<string, { due: number; label: string }> = {};

  (orders || []).forEach((ord: any) => {
    const dt = new Date(ord.created_at);
    const dateKey = dt.toISOString().split('T')[0];
    const label = dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (!map[dateKey]) {
      map[dateKey] = { due: 0, label };
    }
    map[dateKey].due += Number(ord.amount_due || 0);
  });

  return Object.entries(map).map(([date, val]) => ({
    date,
    label: val.label,
    due: val.due,
  }));
}

export async function fetchWaterEventAnalytics(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterEventAnalyticsData> {
  const { startISO, endISO } = getWaterDateBounds(range, customStart, customEnd);

  const { data: events, error } = await (supabase as any)
    .from('water_event_requests')
    .select('*')
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const timeMap: Record<string, any> = {};
  const typeMap: Record<string, { count: number; estimated_cans: number }> = {};

  let totalEvents = 0;
  let newEvents = 0;
  let contactedEvents = 0;
  let confirmedEvents = 0;
  let completedEvents = 0;
  let cancelledEvents = 0;
  let totalEstimatedCans = 0;

  (events || []).forEach((evt: any) => {
    totalEvents += 1;
    const cans = Number(evt.estimated_quantity || 0);
    totalEstimatedCans += cans;

    if (evt.status === 'new') newEvents += 1;
    else if (evt.status === 'contacted') contactedEvents += 1;
    else if (evt.status === 'confirmed') confirmedEvents += 1;
    else if (evt.status === 'completed') completedEvents += 1;
    else if (evt.status === 'cancelled') cancelledEvents += 1;

    // Time grouping
    const dt = new Date(evt.created_at);
    const dateKey = dt.toISOString().split('T')[0];
    const label = dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    if (!timeMap[dateKey]) {
      timeMap[dateKey] = {
        date: dateKey,
        label,
        new: 0,
        contacted: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        estimated_cans: 0,
      };
    }
    timeMap[dateKey].estimated_cans += cans;
    if (evt.status in timeMap[dateKey]) {
      timeMap[dateKey][evt.status] += 1;
    }

    // Type grouping
    const typeKey = evt.event_type || 'Other';
    if (!typeMap[typeKey]) {
      typeMap[typeKey] = { count: 0, estimated_cans: 0 };
    }
    typeMap[typeKey].count += 1;
    typeMap[typeKey].estimated_cans += cans;
  });

  return {
    timeData: Object.values(timeMap),
    typeData: Object.entries(typeMap).map(([type, val]) => ({
      type,
      count: val.count,
      estimated_cans: val.estimated_cans,
    })),
    summary: {
      totalEvents,
      newEvents,
      confirmedEvents,
      completedEvents,
      cancelledEvents,
      totalEstimatedCans,
    },
  };
}

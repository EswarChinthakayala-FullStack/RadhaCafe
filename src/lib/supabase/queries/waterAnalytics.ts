import { supabase } from '../client';
import type { AnalyticsDateRange } from '../../../types';

export interface WaterAnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalCansSold: number;
  normalCansSold: number;
  coolingCansSold: number;
  avgOrderValue: number;
  totalPaid: number;
  totalDue: number;
  totalEvents: number;
}

function getDateBounds(range: AnalyticsDateRange = 'today', customStart?: string, customEnd?: string) {
  const now = new Date();

  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }

  if (range === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }

  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }

  if (range === 'custom' && customStart && customEnd) {
    return {
      startISO: `${customStart}T00:00:00.000Z`,
      endISO: `${customEnd}T23:59:59.999Z`,
    };
  }

  // Fallback today
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export async function fetchWaterAnalyticsSummary(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
): Promise<WaterAnalyticsSummary> {
  const { startISO, endISO } = getDateBounds(range, customStart, customEnd);

  // Fetch water orders in range
  const { data: orders, error } = await (supabase as any)
    .from('water_orders')
    .select('id, total_amount, amount_paid, amount_due, created_at, items:water_order_items(item_name, quantity)')
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  if (error) throw new Error(error.message);

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

  // Fetch events in range
  const { count: eventsCount } = await (supabase as any)
    .from('water_event_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  return {
    totalOrders,
    totalRevenue,
    totalCansSold,
    normalCansSold,
    coolingCansSold,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalPaid,
    totalDue,
    totalEvents: eventsCount || 0,
  };
}

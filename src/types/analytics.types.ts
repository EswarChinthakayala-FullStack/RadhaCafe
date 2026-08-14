export type AnalyticsDateRange = 'today' | 'week' | 'month' | 'custom';

export interface AnalyticsMetrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  revenue_change_pct?: number | null;
  orders_change_pct?: number | null;
}

export interface PeakHourInfo {
  label: string;
  orders: number;
  revenue: number;
}

export interface CafeDashboardMetrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  collected_today: number;
  outstanding_credit: number;
  customers_with_dues_count: number;
  yesterday_revenue: number;
  yesterday_orders: number;
  revenue_change_pct: number | null;
  orders_change_pct: number | null;
  peak_hour: PeakHourInfo | null;
  top_item: TopSellingItem | null;
}

export interface OutstandingCustomerSummary {
  customer_id: string;
  customer_name: string;
  phone: string | null;
  total_due: number;
  oldest_due_date: string | null;
  orders_count: number;
}

export interface DailySummaryMetrics {
  order_date: string | null;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  total_items_sold: number;
}

export interface RevenueTrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  rank: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  label: string;
  order_count: number;
  revenue: number;
  percentage: number;
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ItemPerformanceData {
  item_id?: string;
  item_name: string;
  category_name?: string;
  quantity_sold: number;
  total_revenue: number;
}

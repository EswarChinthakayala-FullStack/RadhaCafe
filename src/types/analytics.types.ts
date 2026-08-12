export type AnalyticsDateRange = 'today' | 'week' | 'month' | 'custom';

export interface AnalyticsMetrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  revenue_change_pct?: number | null;
  orders_change_pct?: number | null;
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

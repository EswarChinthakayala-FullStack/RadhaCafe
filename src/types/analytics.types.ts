export type AnalyticsDateRange = 'today' | 'yesterday' | '7d' | 'week' | '30d' | 'month' | 'prev_month' | 'custom';

export type AnalyticsGranularity = 'hour' | 'day' | 'week' | 'month';

export interface DateRangeBounds {
  range: AnalyticsDateRange;
  startISO: string;
  endISO: string;
  prevStartISO: string;
  prevEndISO: string;
  label: string;
  comparisonLabel: string;
  granularity: AnalyticsGranularity;
  daysCount: number;
  customStart?: string;
  customEnd?: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  changePct: number | null;
  changeAmount: number;
  isPositive: boolean | null; // null if no change or 0
}

export interface CafeAnalyticsSummary {
  sales_revenue: number;
  completed_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  collected_amount: number;
  current_outstanding: number;
  customers_with_dues: number;
  cancelled_orders_count: number;
  total_discount_amount: number;
  
  // Previous Period Comparisons
  prev_sales_revenue: number;
  prev_completed_orders: number;
  prev_avg_order_value: number;
  prev_total_items_sold: number;
  prev_collected_amount: number;

  sales_change_pct: number | null;
  orders_change_pct: number | null;
  aov_change_pct: number | null;
  items_change_pct: number | null;
  collected_change_pct: number | null;

  // Highlights / Deterministic Insights
  top_selling_item: { name: string; quantity: number; revenue: number } | null;
  top_category: { name: string; revenue: number; percentage: number } | null;
  busiest_hour: { label: string; orders: number; revenue: number } | null;
  upi_collection_pct: number;
}

export interface CafeTrendPoint {
  key: string;
  label: string;
  sales: number;
  orders: number;
  aov: number;
  items: number;
  collected: number;
}

export interface CafeProductPerformance {
  rank: number;
  item_name: string;
  category_name: string;
  quantity_sold: number;
  revenue: number;
  order_count: number;
  avg_price: number;
  revenue_share_pct: number;
}

export interface CafeCategoryPerformance {
  category_id: string;
  category_name: string;
  item_count: number;
  quantity_sold: number;
  revenue: number;
  revenue_share_pct: number;
}

export interface PaymentMethodItem {
  method: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PaymentStatusItem {
  status: 'paid' | 'partial' | 'unpaid';
  label: string;
  order_count: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  percentage: number;
}

export interface CafePaymentSummary {
  total_collected: number;
  methods: PaymentMethodItem[];
  statuses: PaymentStatusItem[];
}

export interface TopDebtorCustomer {
  customer_id: string;
  customer_name: string;
  phone: string | null;
  total_due: number;
  oldest_due_date: string | null;
  orders_count: number;
}

export interface CafeCreditAnalytics {
  current_outstanding: number;
  customers_with_dues_count: number;
  outstanding_orders_count: number;
  partial_orders_count: number;
  period_collections_from_credit: number;
  top_debtors: TopDebtorCustomer[];
}

export interface CafePeakHourPoint {
  hour: number;
  label: string;
  order_count: number;
  revenue: number;
}

export interface CafeDayOfWeekPoint {
  day_index: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  day_name: string;
  order_count: number;
  revenue: number;
  avg_order_value: number;
}

export interface CafePeakHoursAnalytics {
  hourly: CafePeakHourPoint[];
  busiest_hour: { label: string; orders: number; revenue: number } | null;
  day_of_week?: CafeDayOfWeekPoint[];
}

export interface CafeDailyRecord {
  date: string;
  formatted_date: string;
  orders: number;
  items_sold: number;
  sales: number;
  collected: number;
  aov: number;
  discount_amount: number;
  outstanding_created: number;
}

// -------------------------------------------------------------
// Legacy & Dashboard Compatibility Types
// -------------------------------------------------------------
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

export interface TopSellingItem {
  rank: number;
  name: string;
  quantity: number;
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

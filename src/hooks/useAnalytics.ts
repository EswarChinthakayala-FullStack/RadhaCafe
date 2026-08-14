import { useQuery } from '@tanstack/react-query';
import {
  fetchCafeAnalyticsSummary,
  fetchCafeTrendData,
  fetchCafeProductPerformance,
  fetchCafeCategoryPerformance,
  fetchCafePaymentSummary,
  fetchCafeCreditAnalytics,
  fetchCafePeakHours,
  fetchCafeDailyPerformance,
  fetchCafeDashboardMetrics,
  fetchCafeOutstandingCustomers,
  fetchAnalyticsMetrics,
  fetchRevenueTrend,
  fetchTopSellingItems,
  fetchPaymentMethodBreakdown,
  fetchHistoricalDailySummaries,
  fetchExportOrdersData,
} from '../lib/supabase/queries/analytics';
import type {
  AnalyticsDateRange,
  DateRangeBounds,
  CafeAnalyticsSummary,
  CafeTrendPoint,
  CafeProductPerformance,
  CafeCategoryPerformance,
  CafePaymentSummary,
  CafeCreditAnalytics,
  CafePeakHoursAnalytics,
  CafeDailyRecord,
} from '../types';

export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  cafe: () => [...ANALYTICS_QUERY_KEYS.all, 'cafe'] as const,
  summary: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'summary', bounds.startISO, bounds.endISO],
  trend: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'trend', bounds.startISO, bounds.endISO, bounds.granularity],
  products: (bounds: DateRangeBounds, limit = 10) => [...ANALYTICS_QUERY_KEYS.cafe(), 'products', bounds.startISO, bounds.endISO, limit],
  categories: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'categories', bounds.startISO, bounds.endISO],
  payments: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'payments', bounds.startISO, bounds.endISO],
  credit: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'credit', bounds.startISO, bounds.endISO],
  peakHours: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'peakHours', bounds.startISO, bounds.endISO],
  daily: (bounds: DateRangeBounds) => [...ANALYTICS_QUERY_KEYS.cafe(), 'daily', bounds.startISO, bounds.endISO],
};

/**
 * Hook for core primary business KPI summary & period comparison
 */
export function useCafeAnalyticsSummary(bounds: DateRangeBounds) {
  return useQuery<CafeAnalyticsSummary>({
    queryKey: ANALYTICS_QUERY_KEYS.summary(bounds),
    queryFn: () => fetchCafeAnalyticsSummary(bounds),
    staleTime: bounds.range === 'today' ? 15000 : 60000,
  });
}

/**
 * Hook for time-series trend points (Sales, Orders, AOV, Collections)
 */
export function useCafeTrendData(bounds: DateRangeBounds) {
  return useQuery<CafeTrendPoint[]>({
    queryKey: ANALYTICS_QUERY_KEYS.trend(bounds),
    queryFn: () => fetchCafeTrendData(bounds),
    staleTime: bounds.range === 'today' ? 15000 : 60000,
  });
}

/**
 * Hook for ranked top menu products
 */
export function useCafeProductPerformance(bounds: DateRangeBounds, limit = 10) {
  return useQuery<CafeProductPerformance[]>({
    queryKey: ANALYTICS_QUERY_KEYS.products(bounds, limit),
    queryFn: () => fetchCafeProductPerformance(bounds, limit),
    staleTime: bounds.range === 'today' ? 30000 : 120000,
  });
}

/**
 * Hook for category performance breakdown
 */
export function useCafeCategoryPerformance(bounds: DateRangeBounds) {
  return useQuery<CafeCategoryPerformance[]>({
    queryKey: ANALYTICS_QUERY_KEYS.categories(bounds),
    queryFn: () => fetchCafeCategoryPerformance(bounds),
    staleTime: bounds.range === 'today' ? 30000 : 120000,
  });
}

/**
 * Hook for payment methods & order payment statuses
 */
export function useCafePaymentSummary(bounds: DateRangeBounds) {
  return useQuery<CafePaymentSummary>({
    queryKey: ANALYTICS_QUERY_KEYS.payments(bounds),
    queryFn: () => fetchCafePaymentSummary(bounds),
    staleTime: bounds.range === 'today' ? 20000 : 90000,
  });
}

/**
 * Hook for customer credit exposure & top debtors
 */
export function useCafeCreditAnalytics(bounds: DateRangeBounds) {
  return useQuery<CafeCreditAnalytics>({
    queryKey: ANALYTICS_QUERY_KEYS.credit(bounds),
    queryFn: () => fetchCafeCreditAnalytics(bounds),
    staleTime: 30000,
  });
}

/**
 * Hook for peak ordering hours and day-of-week patterns
 */
export function useCafePeakHours(bounds: DateRangeBounds) {
  return useQuery<CafePeakHoursAnalytics>({
    queryKey: ANALYTICS_QUERY_KEYS.peakHours(bounds),
    queryFn: () => fetchCafePeakHours(bounds),
    staleTime: 60000,
  });
}

/**
 * Hook for daily performance records table
 */
export function useCafeDailyPerformance(bounds: DateRangeBounds) {
  return useQuery<CafeDailyRecord[]>({
    queryKey: ANALYTICS_QUERY_KEYS.daily(bounds),
    queryFn: () => fetchCafeDailyPerformance(bounds),
    staleTime: 60000,
  });
}

// -------------------------------------------------------------
// Legacy Hook Wrappers
// -------------------------------------------------------------
export function useCafeDashboardMetrics() {
  return useQuery({
    queryKey: ['analytics', 'cafeDashboardMetrics'],
    queryFn: () => fetchCafeDashboardMetrics(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

export function useCafeOutstandingCustomers(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'cafeOutstandingCustomers', limit],
    queryFn: () => fetchCafeOutstandingCustomers(limit),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useDailySummary() {
  return useQuery({
    queryKey: ['analytics', 'metrics', 'today'],
    queryFn: () => fetchAnalyticsMetrics('today'),
    refetchInterval: 45000,
    staleTime: 30000,
  });
}

export function useAnalyticsMetrics(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['analytics', 'metrics', range, customStart, customEnd],
    queryFn: () => fetchAnalyticsMetrics(range, customStart, customEnd),
    refetchInterval: range === 'today' ? 45000 : false,
    staleTime: range === 'today' ? 30000 : 300000,
  });
}

export function useRevenueTrend(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['analytics', 'revenueTrend', range, customStart, customEnd],
    queryFn: () => fetchRevenueTrend(range, customStart, customEnd),
    staleTime: 60000,
  });
}

export function useTopSellingItems(
  range: AnalyticsDateRange = 'today',
  customStartOrLimit?: string | number,
  customEnd?: string,
  limit = 5
) {
  const actualLimit = typeof customStartOrLimit === 'number' ? customStartOrLimit : limit;
  const actualStart = typeof customStartOrLimit === 'string' ? customStartOrLimit : undefined;

  return useQuery({
    queryKey: ['analytics', 'topItems', range, actualStart, customEnd, actualLimit],
    queryFn: () => fetchTopSellingItems(range, actualStart, customEnd, actualLimit),
    staleTime: 60000,
  });
}

export function usePaymentMethodBreakdown(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['analytics', 'paymentBreakdown', range, customStart, customEnd],
    queryFn: () => fetchPaymentMethodBreakdown(range, customStart, customEnd),
    staleTime: 60000,
  });
}

export function useHistoricalDailySummaries(limit = 30) {
  return useQuery({
    queryKey: ['analytics', 'historicalSummaries', limit],
    queryFn: () => fetchHistoricalDailySummaries(limit),
    staleTime: 120000,
  });
}

export function useExportOrders(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['analytics', 'exportOrders', range, customStart, customEnd],
    queryFn: () => fetchExportOrdersData(range, customStart, customEnd),
    enabled: false,
  });
}

import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsMetrics,
  fetchRevenueTrend,
  fetchTopSellingItems,
  fetchPaymentMethodBreakdown,
  fetchHistoricalDailySummaries,
  fetchExportOrdersData,
} from '../lib/supabase/queries/analytics';
import type { AnalyticsDateRange } from '../types';

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

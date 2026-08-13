import { useQuery } from '@tanstack/react-query';
import {
  fetchWaterKpiSummary,
  fetchWaterRevenueTrend,
  fetchWaterOrderVolume,
  fetchWaterProductPerformance,
  fetchWaterPaymentSummary,
  fetchWaterOutstandingTrend,
  fetchWaterEventAnalytics,
} from '../lib/supabase/queries/waterAnalytics';
import type { WaterAnalyticsDateRange } from '../types/water.types';

export function useWaterKpiSummary(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'summary', range, customStart, customEnd],
    queryFn: () => fetchWaterKpiSummary(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

// Backward-compatible alias
export const useWaterAnalytics = useWaterKpiSummary;

export function useWaterRevenueTrend(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'revenue_trend', range, customStart, customEnd],
    queryFn: () => fetchWaterRevenueTrend(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

export function useWaterOrderVolume(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'order_volume', range, customStart, customEnd],
    queryFn: () => fetchWaterOrderVolume(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

export function useWaterProductPerformance(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'product_performance', range, customStart, customEnd],
    queryFn: () => fetchWaterProductPerformance(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

export function useWaterPaymentSummary(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'payment_summary', range, customStart, customEnd],
    queryFn: () => fetchWaterPaymentSummary(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

export function useWaterOutstandingTrend(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'outstanding_trend', range, customStart, customEnd],
    queryFn: () => fetchWaterOutstandingTrend(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

export function useWaterEventAnalytics(
  range: WaterAnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['water_analytics', 'event_analytics', range, customStart, customEnd],
    queryFn: () => fetchWaterEventAnalytics(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchWaterAnalyticsSummary } from '../lib/supabase/queries/waterAnalytics';
import type { AnalyticsDateRange } from '../types';

export function useWaterAnalytics(
  range: AnalyticsDateRange = 'today',
  customStart?: string,
  customEnd?: string
) {
  return useQuery({
    queryKey: ['waterAnalytics', range, customStart, customEnd],
    queryFn: () => fetchWaterAnalyticsSummary(range, customStart, customEnd),
    staleTime: 1000 * 30,
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchTodaysSpecials, fetchBestSellingItems } from '../lib/supabase/queries/menuRecommendations';

export function useTodaysSpecials() {
  return useQuery({
    queryKey: ['menu', 'todays-specials'],
    queryFn: () => fetchTodaysSpecials(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useBestSellingItems(limit = 6, days = 30) {
  return useQuery({
    queryKey: ['menu', 'best-sellers', limit, days],
    queryFn: () => fetchBestSellingItems(limit, days),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

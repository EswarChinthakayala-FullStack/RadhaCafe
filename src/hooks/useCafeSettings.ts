import { useQuery } from '@tanstack/react-query';
import { fetchCafeSettings } from '../lib/supabase/queries/settings';

export const SETTINGS_QUERY_KEY = ['cafeSettings'] as const;

export function useCafeSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchCafeSettings,
    staleTime: 300000, // Cache for 5 minutes
  });
}

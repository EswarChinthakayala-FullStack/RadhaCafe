import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCafeSettings, updateCafeSettings, type CafeSettings } from '../lib/supabase/queries/settings';
import { fetchPrinterSettings, updatePrinterSettings, type PrinterSettings } from '../lib/supabase/queries/printer';

export const SETTINGS_QUERY_KEYS = {
  cafe: ['cafeSettings'] as const,
  printer: ['printerSettings'] as const,
};

export function useCafeSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.cafe,
    queryFn: fetchCafeSettings,
    staleTime: 60000,
  });
}

export function useUpdateCafeSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CafeSettings>) => updateCafeSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.cafe });
      queryClient.invalidateQueries({ queryKey: ['settings', 'cafe'] });
    },
  });
}

export function usePrinterSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.printer,
    queryFn: fetchPrinterSettings,
    staleTime: 60000,
  });
}

export function useUpdatePrinterSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PrinterSettings>) => updatePrinterSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.printer });
    },
  });
}

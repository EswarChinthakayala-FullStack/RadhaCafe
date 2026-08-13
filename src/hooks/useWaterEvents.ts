import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWaterEvents,
  createWaterEventInquiry,
  updateWaterEventStatus,
} from '../lib/supabase/queries/waterEvents';
import type { CreateWaterEventPayload, WaterEventStatus } from '../types';

export function useWaterEvents(statusFilter?: string) {
  return useQuery({
    queryKey: ['waterEvents', statusFilter],
    queryFn: () => fetchWaterEvents(statusFilter),
    staleTime: 1000 * 15,
  });
}

export function useCreateWaterEventInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWaterEventPayload) => createWaterEventInquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterEvents'] });
      queryClient.invalidateQueries({ queryKey: ['waterAnalytics'] });
    },
  });
}

export function useUpdateWaterEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WaterEventStatus }) =>
      updateWaterEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterEvents'] });
      queryClient.invalidateQueries({ queryKey: ['waterAnalytics'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWaterOrders,
  fetchWaterOrderById,
  createWaterOrder,
  type WaterOrderFilterParams,
} from '../lib/supabase/queries/waterOrders';
import type { CreateWaterOrderPayload } from '../types';

export function useWaterOrders(params: WaterOrderFilterParams = {}) {
  return useQuery({
    queryKey: ['waterOrders', params],
    queryFn: () => fetchWaterOrders(params),
    staleTime: 1000 * 15,
  });
}

export function useWaterOrder(id?: string) {
  return useQuery({
    queryKey: ['waterOrder', id],
    queryFn: () => (id ? fetchWaterOrderById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 15,
  });
}

export function useCreateWaterOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWaterOrderPayload) => createWaterOrder(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waterOrders'] });
      queryClient.invalidateQueries({ queryKey: ['waterCustomers'] });
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['waterCustomer', variables.customer_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['waterAnalytics'] });
    },
  });
}

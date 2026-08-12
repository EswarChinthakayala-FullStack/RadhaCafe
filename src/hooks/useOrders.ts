import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, fetchOrders, type OrderFilterParams } from '../lib/supabase/queries/orders';
import { useAuth } from './useAuth';
import type { CreateOrderPayload } from '../types';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  list: (params: OrderFilterParams) => ['orders', 'list', params] as const,
};

export function useOrders(params: OrderFilterParams = {}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => fetchOrders(params),
    staleTime: 15000,
    enabled: isAuthenticated,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    retry: false, // Non-idempotent operation: prevent duplicate order creation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });
}

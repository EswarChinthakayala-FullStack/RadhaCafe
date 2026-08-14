import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrder,
  fetchOrders,
  fetchOrderOperationalSummary,
  cancelOrder,
  type OrderFilterParams,
} from '../lib/supabase/queries/orders';
import { useAuth } from './useAuth';
import type { CreateOrderPayload } from '../types';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  list: (params: OrderFilterParams) => ['orders', 'list', params] as const,
  summary: (startDate?: string, endDate?: string) => ['orders', 'operational-summary', startDate, endDate] as const,
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

export function useOrderOperationalSummary(startDate?: string, endDate?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.summary(startDate, endDate),
    queryFn: () => fetchOrderOperationalSummary(startDate, endDate),
    staleTime: 20000,
    enabled: isAuthenticated,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
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

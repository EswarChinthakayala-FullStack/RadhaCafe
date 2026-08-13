import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWaterCustomers,
  fetchWaterCustomerById,
  searchWaterCustomers,
  createWaterCustomer,
  type WaterCustomerFilterParams,
} from '../lib/supabase/queries/waterCustomers';
import type { CreateWaterCustomerPayload } from '../types';

export function useWaterCustomers(params: WaterCustomerFilterParams = {}) {
  return useQuery({
    queryKey: ['waterCustomers', params],
    queryFn: () => fetchWaterCustomers(params),
    staleTime: 1000 * 30,
  });
}

export function useWaterCustomer(id?: string) {
  return useQuery({
    queryKey: ['waterCustomer', id],
    queryFn: () => (id ? fetchWaterCustomerById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 15,
  });
}

export function useWaterCustomerSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['waterCustomerSearch', searchTerm],
    queryFn: () => searchWaterCustomers(searchTerm),
    enabled: Boolean(searchTerm && searchTerm.trim().length >= 1),
    staleTime: 1000 * 10,
  });
}

export function useCreateWaterCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWaterCustomerPayload) => createWaterCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['waterCustomerSearch'] });
    },
  });
}

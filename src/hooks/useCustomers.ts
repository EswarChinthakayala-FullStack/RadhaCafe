import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomers,
  fetchCustomerById,
  searchCustomers,
  createCustomer,
} from '../lib/supabase/queries/customers';
import type { CustomerFilterParams, CreateCustomerPayload } from '../types';

export function useCustomers(params: CustomerFilterParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => (id ? fetchCustomerById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 15,
  });
}

export function useCustomerSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['customerSearch', searchTerm],
    queryFn: () => searchCustomers(searchTerm),
    enabled: Boolean(searchTerm && searchTerm.trim().length >= 1),
    staleTime: 1000 * 10,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerSearch'] });
    },
  });
}

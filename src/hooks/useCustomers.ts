import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomers,
  fetchCustomerById,
  fetchCustomerOperationalSummary,
  fetchCustomerLedger,
  searchCustomers,
  createCustomer,
  updateCustomer,
} from '../lib/supabase/queries/customers';
import type {
  CustomerFilterParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '../types';

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

export function useCustomerOperationalSummary() {
  return useQuery({
    queryKey: ['customers', 'summary-metrics'],
    queryFn: () => fetchCustomerOperationalSummary(),
    staleTime: 1000 * 30,
  });
}

export function useCustomerLedger(customerId?: string) {
  return useQuery({
    queryKey: ['customer', customerId, 'ledger'],
    queryFn: () => (customerId ? fetchCustomerLedger(customerId) : []),
    enabled: Boolean(customerId),
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

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      updateCustomer(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customerSearch'] });
    },
  });
}

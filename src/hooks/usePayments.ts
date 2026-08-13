import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordPayment, fetchCustomerPayments, fetchOrderPayments } from '../lib/supabase/queries/payments';
import type { RecordPaymentPayload } from '../types';

export function useCustomerPayments(customerId?: string) {
  return useQuery({
    queryKey: ['customerPayments', customerId],
    queryFn: () => (customerId ? fetchCustomerPayments(customerId) : []),
    enabled: Boolean(customerId),
    staleTime: 1000 * 15,
  });
}

export function useOrderPayments(orderId?: string) {
  return useQuery({
    queryKey: ['orderPayments', orderId],
    queryFn: () => (orderId ? fetchOrderPayments(orderId) : []),
    enabled: Boolean(orderId),
    staleTime: 1000 * 15,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) => recordPayment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customerPayments', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (variables.order_id) {
        queryClient.invalidateQueries({ queryKey: ['order', variables.order_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

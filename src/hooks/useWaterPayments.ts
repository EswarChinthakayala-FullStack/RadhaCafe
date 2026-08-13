import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordWaterPayment, fetchWaterCustomerPayments } from '../lib/supabase/queries/waterPayments';
import type { RecordWaterPaymentPayload } from '../types';

export function useWaterCustomerPayments(customerId?: string) {
  return useQuery({
    queryKey: ['waterCustomerPayments', customerId],
    queryFn: () => (customerId ? fetchWaterCustomerPayments(customerId) : []),
    enabled: Boolean(customerId),
    staleTime: 1000 * 15,
  });
}

export function useRecordWaterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordWaterPaymentPayload) => recordWaterPayment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waterCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['waterCustomer', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['waterCustomerPayments', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['waterOrders'] });
      if (variables.water_order_id) {
        queryClient.invalidateQueries({ queryKey: ['waterOrder', variables.water_order_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['waterAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['water_analytics'] });
    },
  });
}

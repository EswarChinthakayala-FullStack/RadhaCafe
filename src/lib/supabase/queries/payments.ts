import { supabase } from '../client';
import type { Payment, RecordPaymentPayload } from '../../../types';

export async function recordPayment(payload: RecordPaymentPayload): Promise<any> {
  const { data, error } = await (supabase as any).rpc('record_customer_payment', {
    p_customer_id: payload.customer_id,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes || null,
    p_order_id: payload.order_id || null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCustomerPayments(customerId: string): Promise<Payment[]> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .select(`
      id,
      order_id,
      customer_id,
      amount,
      payment_method,
      notes,
      created_at,
      orders:order_id ( order_number )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((p: any) => ({
    ...p,
    order_number: p.orders?.order_number || null,
  }));
}

export async function fetchOrderPayments(orderId: string): Promise<Payment[]> {
  const { data, error } = await (supabase as any)
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Payment[]) || [];
}

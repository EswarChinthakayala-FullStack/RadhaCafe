import { supabase } from '../client';
import type { WaterPayment, RecordWaterPaymentPayload } from '../../../types';

export async function recordWaterPayment(payload: RecordWaterPaymentPayload): Promise<any> {
  const { data, error } = await (supabase as any).rpc('record_water_customer_payment', {
    p_customer_id: payload.customer_id,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes || null,
    p_water_order_id: payload.water_order_id || null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchWaterCustomerPayments(customerId: string): Promise<WaterPayment[]> {
  const { data, error } = await (supabase as any)
    .from('water_payments')
    .select(
      `
      id,
      water_order_id,
      water_customer_id,
      amount,
      payment_method,
      notes,
      created_at,
      water_orders:water_order_id ( order_number )
    `
    )
    .eq('water_customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((p: any) => ({
    ...p,
    order_number: p.water_orders?.order_number || null,
  }));
}

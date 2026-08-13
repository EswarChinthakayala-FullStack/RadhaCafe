import { supabase } from '../client';
import type { WaterEventRequest, CreateWaterEventPayload, WaterEventStatus } from '../../../types';

export async function fetchWaterEvents(statusFilter?: string): Promise<WaterEventRequest[]> {
  let query = (supabase as any)
    .from('water_event_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as WaterEventRequest[]) || [];
}

export async function createWaterEventInquiry(payload: CreateWaterEventPayload): Promise<Partial<WaterEventRequest>> {
  const insertPayload = {
    customer_name: payload.customer_name.trim(),
    phone: payload.phone.trim(),
    event_type: payload.event_type.trim(),
    event_date: payload.event_date,
    estimated_quantity: payload.estimated_quantity,
    location: payload.location.trim(),
    notes: payload.notes?.trim() || null,
    status: 'new' as WaterEventStatus,
  };

  const { error } = await (supabase as any)
    .from('water_event_requests')
    .insert([insertPayload]);

  if (error) throw new Error(error.message);
  return insertPayload;
}

export async function updateWaterEventStatus(id: string, status: WaterEventStatus): Promise<WaterEventRequest> {
  const { data, error } = await (supabase as any)
    .from('water_event_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WaterEventRequest;
}

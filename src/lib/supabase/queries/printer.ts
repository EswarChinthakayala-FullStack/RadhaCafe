import { supabase } from '../client';
import type { Database } from '../../../types/supabase.types';

export type PrinterSettings = Database['public']['Tables']['printer_settings']['Row'];
type PrinterSettingsUpdate = Database['public']['Tables']['printer_settings']['Update'];

export async function fetchPrinterSettings(): Promise<PrinterSettings | null> {
  const { data, error } = await supabase
    .from('printer_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePrinterSettings(settings: PrinterSettingsUpdate): Promise<PrinterSettings> {
  const { data, error } = await supabase
    .from('printer_settings')
    .upsert([{ ...settings, updated_at: new Date().toISOString() }] as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markOrderAsPrinted(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ is_printed: true } as never)
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

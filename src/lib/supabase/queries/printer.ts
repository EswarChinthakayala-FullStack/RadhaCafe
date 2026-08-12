import { supabase } from '../client';

export interface PrinterSettings {
  id?: string;
  printer_name: string | null;
  device_id: string | null;
  paper_width: number; // 32 or 48
  auto_connect: boolean;
  updated_at?: string;
}

export async function fetchPrinterSettings(): Promise<PrinterSettings | null> {
  const { data, error } = await (supabase as any)
    .from('printer_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PrinterSettings) || null;
}

export async function updatePrinterSettings(settings: Partial<PrinterSettings>): Promise<PrinterSettings> {
  const { data, error } = await (supabase as any)
    .from('printer_settings')
    .upsert([{ ...settings, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PrinterSettings;
}

export async function markOrderAsPrinted(orderId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('orders')
    .update({ is_printed: true })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

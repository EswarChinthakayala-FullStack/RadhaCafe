import { supabase } from '../client';
import type { Database } from '../../../types/supabase.types';
import type { SavedPrinter, SavedPrinterInsert, SavedPrinterUpdate } from '../../../types/printer.types';

export type PrinterSettings = Database['public']['Tables']['printer_settings']['Row'];
export type PrinterSettingsUpdate = Database['public']['Tables']['printer_settings']['Update'];

/**
 * Retrieves the global printer settings record
 */
export async function fetchPrinterSettings(): Promise<PrinterSettings | null> {
  const { data, error } = await supabase
    .from('printer_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Updates or creates global printer settings
 */
export async function updatePrinterSettings(settings: PrinterSettingsUpdate): Promise<PrinterSettings> {
  const { data, error } = await supabase
    .from('printer_settings')
    .upsert([{ ...settings, updated_at: new Date().toISOString() }] as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Retrieves all saved RadhaCafe Bluetooth thermal printers
 */
export async function fetchSavedPrinters(): Promise<SavedPrinter[]> {
  const [printersRes, settingsRes] = await Promise.all([
    supabase
      .from('saved_printers')
      .select('*')
      .order('created_at', { ascending: false }),
    fetchPrinterSettings().catch(() => null),
  ]);

  if (printersRes.error) throw new Error(printersRes.error.message);

  const preferredId = settingsRes?.preferred_printer_id;
  const printers = (printersRes.data || []) as SavedPrinter[];

  // Attach is_preferred flag and sort preferred printer first
  const mapped = printers.map((p) => ({
    ...p,
    is_preferred: preferredId ? p.id === preferredId : false,
  }));

  return mapped.sort((a, b) => {
    if (a.is_preferred && !b.is_preferred) return -1;
    if (!a.is_preferred && b.is_preferred) return 1;
    return new Date(b.last_connected_at || b.created_at).getTime() - new Date(a.last_connected_at || a.created_at).getTime();
  });
}

/**
 * Retrieves the single preferred saved printer if set and valid
 */
export async function fetchPreferredPrinter(): Promise<SavedPrinter | null> {
  const settings = await fetchPrinterSettings();
  if (!settings?.preferred_printer_id) {
    // If no preferred ID, check if there is only 1 saved printer and use it
    const all = await fetchSavedPrinters();
    return all.length > 0 ? all[0] : null;
  }

  const { data, error } = await supabase
    .from('saved_printers')
    .select('*')
    .eq('id', settings.preferred_printer_id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...(data as SavedPrinter),
    is_preferred: true,
  };
}

/**
 * Saves or updates a verified Bluetooth thermal printer in database
 */
export async function saveVerifiedPrinter(printerData: SavedPrinterInsert): Promise<SavedPrinter> {
  const now = new Date().toISOString();

  // Upsert on device_id conflict
  const { data, error } = await supabase
    .from('saved_printers')
    .upsert(
      [
        {
          device_id: printerData.device_id,
          device_name: printerData.device_name ?? null,
          friendly_name: printerData.friendly_name ?? printerData.device_name ?? 'Thermal Printer',
          profile_key: printerData.profile_key || 'generic-ble-escpos',
          service_uuid: printerData.service_uuid ?? null,
          characteristic_uuid: printerData.characteristic_uuid ?? null,
          write_mode: printerData.write_mode ?? 'without-response',
          chunk_size: printerData.chunk_size ?? 20,
          paper_width: printerData.paper_width ?? 32,
          is_enabled: printerData.is_enabled ?? true,
          last_connected_at: now,
          updated_at: now,
        },
      ] as never,
      { onConflict: 'device_id' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  const saved = data as SavedPrinter;

  // If no preferred printer is set yet, automatically make this first printer preferred
  try {
    const settings = await fetchPrinterSettings();
    if (!settings?.preferred_printer_id) {
      await updatePrinterSettings({
        preferred_printer_id: saved.id,
        printer_name: saved.device_name || saved.friendly_name,
        device_id: saved.device_id,
      });
      saved.is_preferred = true;
    } else {
      saved.is_preferred = settings.preferred_printer_id === saved.id;
    }
  } catch {
    // Non-blocking preference sync
  }

  return saved;
}

/**
 * Updates metadata for an existing saved printer (e.g. rename friendly name, paper width)
 */
export async function updateSavedPrinter(id: string, updates: SavedPrinterUpdate): Promise<SavedPrinter> {
  const { data, error } = await supabase
    .from('saved_printers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SavedPrinter;
}

/**
 * Sets a saved printer as the preferred default printer for RadhaCafe
 */
export async function setPreferredPrinter(printerId: string): Promise<void> {
  const { data: printer, error: fetchErr } = await supabase
    .from('saved_printers')
    .select('id, device_name, friendly_name, device_id')
    .eq('id', printerId)
    .single();

  if (fetchErr || !printer) throw new Error('Printer not found');

  const p = printer as { id: string; device_name: string | null; friendly_name: string | null; device_id: string };

  await updatePrinterSettings({
    preferred_printer_id: p.id,
    printer_name: p.device_name || p.friendly_name,
    device_id: p.device_id,
  });
}

/**
 * Removes a saved printer from RadhaCafe database and unsets preferred pointer if matched
 */
export async function removeSavedPrinter(printerId: string): Promise<void> {
  // Check if this was preferred
  const settings = await fetchPrinterSettings();
  if (settings?.preferred_printer_id === printerId) {
    await updatePrinterSettings({
      preferred_printer_id: null,
      printer_name: null,
      device_id: null,
    }).catch(() => null);
  }

  const { error } = await supabase
    .from('saved_printers')
    .delete()
    .eq('id', printerId);

  if (error) throw new Error(error.message);
}

/**
 * Records a successful connection timestamp asynchronously
 */
export async function recordPrinterConnectionSuccess(deviceId: string): Promise<void> {
  try {
    await supabase
      .from('saved_printers')
      .update({
        last_connected_at: new Date().toISOString(),
        last_error_code: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('device_id', deviceId);
  } catch {
    // Non-blocking log update
  }
}

/**
 * Records a connection failure for diagnostics asynchronously
 */
export async function recordPrinterConnectionFailure(deviceId: string, errorCode: string): Promise<void> {
  try {
    await supabase
      .from('saved_printers')
      .update({
        last_connection_failed_at: new Date().toISOString(),
        last_error_code: errorCode,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('device_id', deviceId);
  } catch {
    // Non-blocking log update
  }
}

/**
 * Updates order is_printed flag in database
 */
export async function markOrderAsPrinted(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ is_printed: true } as never)
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

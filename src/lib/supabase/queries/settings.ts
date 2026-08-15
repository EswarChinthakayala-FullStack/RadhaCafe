import { supabase } from '../client';
import type { Database } from '../../../types/supabase.types';

export type CafeSettings = Database['public']['Tables']['cafe_settings']['Row'];
type CafeSettingsUpdate = Database['public']['Tables']['cafe_settings']['Update'];

export async function fetchCafeSettings(): Promise<CafeSettings | null> {
  const { data, error } = await (supabase as any)
    .from('cafe_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as CafeSettings;
  return {
    ...row,
    tax_percentage:
      row.tax_percentage !== null && row.tax_percentage !== undefined
        ? Number(row.tax_percentage)
        : 0,
  };
}

export async function updateCafeSettings(settings: CafeSettingsUpdate): Promise<CafeSettings> {
  // Obtain the existing row ID so upsert targets the single singleton settings row
  const existing = await fetchCafeSettings().catch(() => null);
  const targetId = settings.id || existing?.id;

  const payload: any = {
    ...settings,
    ...(targetId ? { id: targetId } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('cafe_settings')
    .upsert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CafeSettings;
}

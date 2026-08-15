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
  // First check if an existing row exists to cleanly update by ID
  const existing = await fetchCafeSettings().catch(() => null);

  if (existing?.id) {
    const { data, error } = await (supabase as any)
      .from('cafe_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cafe_settings:', error);
      throw new Error(error.message);
    }
    return data as CafeSettings;
  } else {
    const { data, error } = await (supabase as any)
      .from('cafe_settings')
      .insert([
        {
          cafe_name: 'RadhaCafe',
          currency: 'INR',
          ...settings,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting cafe_settings:', error);
      throw new Error(error.message);
    }
    return data as CafeSettings;
  }
}

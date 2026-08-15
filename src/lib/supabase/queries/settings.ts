import { supabase } from '../client';
import type { Database } from '../../../types/supabase.types';

export type CafeSettings = Database['public']['Tables']['cafe_settings']['Row'];
type CafeSettingsUpdate = Database['public']['Tables']['cafe_settings']['Update'];

export async function fetchCafeSettings(): Promise<CafeSettings | null> {
  const { data, error } = await supabase
    .from('cafe_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCafeSettings(settings: CafeSettingsUpdate): Promise<CafeSettings> {
  const { data, error } = await supabase
    .from('cafe_settings')
    .upsert([{ ...settings, updated_at: new Date().toISOString() }] as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

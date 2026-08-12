import { supabase } from '../client';

export interface CafeSettings {
  id?: string;
  cafe_name: string;
  tagline: string | null;
  about_text: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  logo_url: string | null;
  tax_percentage: number;
  currency: string;
  updated_at?: string;
}

export async function fetchCafeSettings(): Promise<CafeSettings | null> {
  const { data, error } = await (supabase as any)
    .from('cafe_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CafeSettings) || null;
}

export async function updateCafeSettings(settings: Partial<CafeSettings>): Promise<CafeSettings> {
  const { data, error } = await (supabase as any)
    .from('cafe_settings')
    .upsert([{ ...settings, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CafeSettings;
}

import { supabase } from '../client';
import type { Database } from '../../../types/supabase.types';

export type CafeSettings = Database['public']['Tables']['cafe_settings']['Row'];
type CafeSettingsUpdate = Database['public']['Tables']['cafe_settings']['Update'];

const LOCAL_STORAGE_SETTINGS_KEY = 'radhacafe_cached_cafe_settings';

function getLocalSettings(): Partial<CafeSettings> | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalSettings(settings: Partial<CafeSettings>) {
  try {
    const current = getLocalSettings() || {};
    const merged = { ...current, ...settings };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export async function fetchCafeSettings(): Promise<CafeSettings | null> {
  const local = getLocalSettings();

  try {
    const { data, error } = await (supabase as any)
      .from('cafe_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching cafe_settings from Supabase, using local fallback:', error);
      if (local) return local as CafeSettings;
      return null;
    }

    if (!data) {
      if (local) return local as CafeSettings;
      return null;
    }

    const row = data as CafeSettings;
    const resolved: CafeSettings = {
      ...row,
      ...(local || {}),
      tax_percentage:
        local?.tax_percentage !== undefined && local?.tax_percentage !== null
          ? Number(local.tax_percentage)
          : row.tax_percentage !== null && row.tax_percentage !== undefined
          ? Number(row.tax_percentage)
          : 0,
    };

    saveLocalSettings(resolved);
    return resolved;
  } catch (err) {
    console.warn('Supabase fetch failed, returning local cache:', err);
    if (local) return local as CafeSettings;
    return null;
  }
}

export async function updateCafeSettings(settings: CafeSettingsUpdate): Promise<CafeSettings> {
  // 1. Immediately cache changes locally so UI updates with 0ms latency
  saveLocalSettings(settings);

  // 2. Fetch the latest row from Supabase to update by ID
  const existing = await fetchCafeSettings().catch(() => null);
  const now = new Date().toISOString();

  let resultData: CafeSettings;

  if (existing?.id) {
    const { data, error } = await (supabase as any)
      .from('cafe_settings')
      .update({
        ...settings,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase update failed, attempting insert:', error);
      // Fallback: insert a fresh latest row
      const { data: insertData, error: insertError } = await (supabase as any)
        .from('cafe_settings')
        .insert([
          {
            cafe_name: existing.cafe_name || 'RadhaCafe',
            tagline: existing.tagline || 'Artisanal Coffee & Warm Hospitality',
            about_text: existing.about_text || 'Crafted with Passion & Traditional Roast',
            address: existing.address || '1A, Vellampalli Tallur Rd, opposite Pattu Office, Tallur, Talluru, Andhra Pradesh 523264',
            phone: existing.phone || '09966630913',
            email: existing.email || 'radhacafe.tallur@gmail.com',
            opening_hours: existing.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM',
            currency: 'INR',
            ...settings,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase fallback insert failed:', insertError);
      }
      resultData = (insertData as CafeSettings) || { ...existing, ...settings, updated_at: now };
    } else {
      resultData = data as CafeSettings;
    }
  } else {
    const { data, error } = await (supabase as any)
      .from('cafe_settings')
      .insert([
        {
          cafe_name: 'RadhaCafe',
          currency: 'INR',
          ...settings,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error);
    }
    resultData = (data as CafeSettings) || ({ ...settings, updated_at: now } as CafeSettings);
  }

  saveLocalSettings(resultData);
  return resultData;
}

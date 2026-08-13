import { supabase } from '../client';
import type { WaterProduct, CreateWaterProductPayload } from '../../../types';

export async function fetchWaterProducts(onlyAvailable = false): Promise<WaterProduct[]> {
  let query = (supabase as any)
    .from('water_products')
    .select('*')
    .order('created_at', { ascending: true });

  if (onlyAvailable) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as WaterProduct[]) || [];
}

export async function fetchWaterProductById(id: string): Promise<WaterProduct | null> {
  const { data, error } = await (supabase as any)
    .from('water_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return (data as WaterProduct) || null;
}

export async function createWaterProduct(payload: CreateWaterProductPayload): Promise<WaterProduct> {
  const { data, error } = await (supabase as any)
    .from('water_products')
    .insert({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      water_type: payload.water_type,
      unit_name: payload.unit_name,
      price: payload.price,
      is_available: payload.is_available ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WaterProduct;
}

export async function updateWaterProduct(id: string, payload: Partial<CreateWaterProductPayload>): Promise<WaterProduct> {
  const { data, error } = await (supabase as any)
    .from('water_products')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WaterProduct;
}

export async function deleteWaterProduct(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('water_products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

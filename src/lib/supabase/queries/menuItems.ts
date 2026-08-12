import { supabase } from '../client';
import type { CreateMenuItemInput, MenuItem, UpdateMenuItemInput } from '../../../types';

export async function fetchMenuItems(availableOnly = false): Promise<MenuItem[]> {
  let query = (supabase as any)
    .from('menu_items')
    .select(`
      *,
      category:categories(*)
    `)
    .order('name', { ascending: true });

  if (availableOnly) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as MenuItem[]) || [];
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
  const payload = {
    name: input.name,
    description: input.description || null,
    price: input.price,
    category_id: input.category_id || null,
    image_url: input.image_url || null,
    is_available: input.is_available ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('menu_items')
    .insert([payload])
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as MenuItem;
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<MenuItem> {
  const payload = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.price !== undefined && { price: input.price }),
    ...(input.category_id !== undefined && { category_id: input.category_id }),
    ...(input.image_url !== undefined && { image_url: input.image_url }),
    ...(input.is_available !== undefined && { is_available: input.is_available }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as MenuItem;
}

export async function toggleMenuItemAvailability(id: string, is_available: boolean): Promise<MenuItem> {
  const payload = {
    is_available,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as MenuItem;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await (supabase as any).from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

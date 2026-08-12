import { supabase } from '../client';
import type { Category } from '../../../types';

export type { Category };

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await (supabase as any)
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Category[]) || [];
}

export async function createCategory(input: { name: string; icon?: string | null; display_order?: number }): Promise<Category> {
  const payload = {
    name: input.name,
    icon: input.icon || null,
    display_order: input.display_order ?? 0,
  };

  const { data, error } = await (supabase as any)
    .from('categories')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, input: { name?: string; icon?: string | null; display_order?: number }): Promise<Category> {
  const payload = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.icon !== undefined && { icon: input.icon }),
    ...(input.display_order !== undefined && { display_order: input.display_order }),
  };

  const { data, error } = await (supabase as any)
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await (supabase as any).from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderCategories(items: { id: string; display_order: number }[]): Promise<void> {
  const updates = items.map((item) =>
    (supabase as any)
      .from('categories')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r: any) => r.error);
  if (firstError?.error) {
    throw new Error(firstError.error.message);
  }
}

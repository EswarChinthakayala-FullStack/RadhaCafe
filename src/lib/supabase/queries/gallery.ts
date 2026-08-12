import { supabase } from '../client';
import { BUCKETS } from '../storage';

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as GalleryItem[]) || [];
}

export async function createGalleryItem(
  image_url: string,
  caption?: string,
  display_order = 0
): Promise<GalleryItem> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .insert([{ image_url, caption: caption || null, display_order }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GalleryItem;
}

export async function updateGalleryItem(
  id: string,
  input: { caption?: string; display_order?: number }
): Promise<GalleryItem> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GalleryItem;
}

export async function deleteGalleryItem(id: string, imageUrl?: string): Promise<void> {
  // 1. Delete DB record
  const { error: dbError } = await (supabase as any).from('gallery_images').delete().eq('id', id);
  if (dbError) throw new Error(dbError.message);

  // 2. Cleanup Storage file if storage URL matches gallery-images bucket
  if (imageUrl && imageUrl.includes(BUCKETS.GALLERY_IMAGES)) {
    try {
      const parts = imageUrl.split(`${BUCKETS.GALLERY_IMAGES}/`);
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from(BUCKETS.GALLERY_IMAGES).remove([filePath]);
      }
    } catch {
      // Storage cleanup failure logged non-blockingly
    }
  }
}

export async function reorderGalleryItems(
  orderedItems: { id: string; display_order: number }[]
): Promise<void> {
  const updates = orderedItems.map((item) =>
    (supabase as any)
      .from('gallery_images')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError && firstError.error) {
    throw new Error(firstError.error.message);
  }
}

import { supabase } from '../client';
import { BUCKETS } from '../storage';

export interface GalleryItem {
  id: string;
  image_url: string;
  title?: string | null;
  caption: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  display_order: number;
  created_at: string;
}

export interface CreateGalleryItemInput {
  image_url: string;
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  display_order?: number;
}

export interface UpdateGalleryItemInput {
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  display_order?: number;
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .select('id, image_url, title, caption, alt_text, width, height, display_order, created_at')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as GalleryItem[]) || [];
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .insert([
      {
        image_url: input.image_url,
        title: input.title || null,
        caption: input.caption || null,
        alt_text: input.alt_text || null,
        width: input.width || null,
        height: input.height || null,
        display_order: input.display_order ?? 0,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GalleryItem;
}

export async function updateGalleryItem(
  id: string,
  input: UpdateGalleryItemInput
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

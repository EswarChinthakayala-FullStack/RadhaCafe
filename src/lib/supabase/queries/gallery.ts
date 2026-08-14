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
  // Use select('*') for 100% backward compatibility with remote Supabase schema
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as GalleryItem[]) || [];
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  const fullPayload: Record<string, any> = {
    image_url: input.image_url,
    caption: input.caption || null,
    display_order: input.display_order ?? 0,
  };

  if (input.title) fullPayload.title = input.title;
  if (input.alt_text) fullPayload.alt_text = input.alt_text;
  if (input.width) fullPayload.width = input.width;
  if (input.height) fullPayload.height = input.height;

  // Try inserting with optional columns
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .insert([fullPayload])
    .select()
    .single();

  if (!error) return data as GalleryItem;

  // If remote database doesn't have extended columns yet, fallback to base schema
  if (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204') {
    const { data: fallbackData, error: fallbackError } = await (supabase as any)
      .from('gallery_images')
      .insert([
        {
          image_url: input.image_url,
          caption: input.caption || null,
          display_order: input.display_order ?? 0,
        },
      ])
      .select()
      .single();

    if (fallbackError) throw new Error(fallbackError.message);
    return fallbackData as GalleryItem;
  }

  throw new Error(error.message);
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

  if (!error) return data as GalleryItem;

  // Fallback to base columns if extended columns do not exist yet on remote instance
  if (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204') {
    const basePayload: Record<string, any> = {};
    if (input.caption !== undefined) basePayload.caption = input.caption;
    if (input.display_order !== undefined) basePayload.display_order = input.display_order;

    const { data: fallbackData, error: fallbackError } = await (supabase as any)
      .from('gallery_images')
      .update(basePayload)
      .eq('id', id)
      .select()
      .single();

    if (fallbackError) throw new Error(fallbackError.message);
    return fallbackData as GalleryItem;
  }

  throw new Error(error.message);
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

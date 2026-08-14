import { supabase } from '../client';
import { BUCKETS } from '../storage';
import type { GalleryImageEditConfig } from '../../../types/galleryEditor.types';

export interface GalleryItem {
  id: string;
  image_url: string;
  original_image_url?: string | null;
  edit_config?: GalleryImageEditConfig | null;
  edited_at?: string | null;
  title?: string | null;
  caption: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  views_count?: number | null;
  display_order: number;
  created_at: string;
}

export interface CreateGalleryItemInput {
  image_url: string;
  original_image_url?: string | null;
  edit_config?: GalleryImageEditConfig | null;
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  display_order?: number;
}

export interface UpdateGalleryItemInput {
  image_url?: string;
  original_image_url?: string | null;
  edit_config?: GalleryImageEditConfig | null;
  edited_at?: string | null;
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  views_count?: number | null;
  display_order?: number;
}

export interface SaveGalleryImageEditInput {
  id: string;
  editedBlob: Blob;
  editConfig: GalleryImageEditConfig;
  width: number;
  height: number;
  caption?: string | null;
  title?: string | null;
}

/**
 * Fetches all gallery items sorted with TOP VIEWED photos in the first order.
 */
export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .select('*');

  if (error) throw new Error(error.message);

  const items = (data as GalleryItem[]) || [];

  // Sort by top viewed in first order (highest views_count first), then display_order
  items.sort((a, b) => {
    const viewsA = a.views_count ?? (a as any).views ?? 0;
    const viewsB = b.views_count ?? (b as any).views ?? 0;
    if (viewsB !== viewsA) {
      return viewsB - viewsA;
    }
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

  return items;
}

/**
 * Increment view count atomically when a user opens/views a gallery image
 */
export async function incrementGalleryItemView(id: string): Promise<void> {
  if (!id) return;

  try {
    // Try RPC first for atomic increment
    const { error: rpcError } = await (supabase as any).rpc('increment_gallery_view', {
      image_id: id,
    });

    if (!rpcError) return;

    // Fallback: direct update if RPC is not registered yet
    const { data: item } = await (supabase as any)
      .from('gallery_images')
      .select('views_count')
      .eq('id', id)
      .single();

    const currentViews = item?.views_count || 0;
    await (supabase as any)
      .from('gallery_images')
      .update({ views_count: currentViews + 1 })
      .eq('id', id);
  } catch {
    // Non-blocking view increment
  }
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  const fullPayload: Record<string, any> = {
    image_url: input.image_url,
    original_image_url: input.original_image_url || input.image_url,
    caption: input.caption || null,
    display_order: input.display_order ?? 0,
    views_count: 0,
  };

  if (input.title) fullPayload.title = input.title;
  if (input.alt_text) fullPayload.alt_text = input.alt_text;
  if (input.width) fullPayload.width = input.width;
  if (input.height) fullPayload.height = input.height;
  if (input.edit_config) fullPayload.edit_config = input.edit_config;

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

/**
 * Save an edited image derivative, preserving the original photo.
 */
export async function saveGalleryImageEdit(
  input: SaveGalleryImageEditInput
): Promise<GalleryItem> {
  // 1. Fetch current row to determine original image URL
  const { data: currentItem, error: fetchError } = await (supabase as any)
    .from('gallery_images')
    .select('*')
    .eq('id', input.id)
    .single();

  if (fetchError || !currentItem) {
    throw new Error('Gallery item not found');
  }

  const originalUrl = currentItem.original_image_url || currentItem.image_url;

  // 2. Upload new edited derivative to storage
  const fileExt = 'webp';
  const fileName = `gallery/edited/${input.id}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.GALLERY_IMAGES)
    .upload(fileName, input.editedBlob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload edited photo');
  }

  const { data: publicData } = supabase.storage
    .from(BUCKETS.GALLERY_IMAGES)
    .getPublicUrl(fileName);

  const editedUrl = publicData.publicUrl;

  // 3. Update database record
  const updatePayload: Record<string, any> = {
    image_url: editedUrl,
    original_image_url: originalUrl,
    edit_config: input.editConfig,
    width: input.width,
    height: input.height,
    edited_at: new Date().toISOString(),
  };

  if (input.caption !== undefined) updatePayload.caption = input.caption;
  if (input.title !== undefined) updatePayload.title = input.title;

  const { data: updatedData, error: updateError } = await (supabase as any)
    .from('gallery_images')
    .update(updatePayload)
    .eq('id', input.id)
    .select()
    .single();

  if (!updateError) {
    return updatedData as GalleryItem;
  }

  // Fallback for base columns if columns not in DB
  const fallbackPayload: Record<string, any> = {
    image_url: editedUrl,
  };
  if (input.caption !== undefined) fallbackPayload.caption = input.caption;

  const { data: fbData, error: fbError } = await (supabase as any)
    .from('gallery_images')
    .update(fallbackPayload)
    .eq('id', input.id)
    .select()
    .single();

  if (fbError) throw new Error(fbError.message);
  return fbData as GalleryItem;
}

/**
 * Restore original unedited photo.
 */
export async function restoreGalleryOriginal(id: string): Promise<GalleryItem> {
  const { data: item, error: fetchError } = await (supabase as any)
    .from('gallery_images')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !item) {
    throw new Error('Gallery item not found');
  }

  const originalUrl = item.original_image_url || item.image_url;

  const { data: updatedItem, error: updateError } = await (supabase as any)
    .from('gallery_images')
    .update({
      image_url: originalUrl,
      edit_config: null,
      edited_at: null,
    })
    .eq('id', id)
    .select()
    .single();

  if (!updateError) {
    return updatedItem as GalleryItem;
  }

  // Fallback update if extended columns are absent
  const { data: fbData, error: fbError } = await (supabase as any)
    .from('gallery_images')
    .update({ image_url: originalUrl })
    .eq('id', id)
    .select()
    .single();

  if (fbError) throw new Error(fbError.message);
  return fbData as GalleryItem;
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

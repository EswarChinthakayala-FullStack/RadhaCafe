import { supabase } from './client';

export const BUCKETS = {
  MENU_IMAGES: 'menu-images',
  GALLERY_IMAGES: 'gallery-images',
  CAFE_ASSETS: 'cafe-assets',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file format. Please upload JPEG, PNG, WebP, or SVG images.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 5 MB limit.' };
  }
  return { valid: true };
}

export async function uploadImageToStorage(
  file: File,
  bucket: BucketName,
  folder = ''
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { url: null, error: validation.error || 'Validation failed' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Image upload failed' };
  }
}

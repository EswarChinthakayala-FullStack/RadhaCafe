import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
} from '../lib/supabase/queries/gallery';

export const GALLERY_QUERY_KEY = ['gallery', 'images'] as const;

export function useGalleryImages() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: fetchGalleryItems,
    staleTime: 60000,
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { image_url: string; caption?: string; display_order?: number }) =>
      createGalleryItem(input.image_url, input.caption, input.display_order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { caption?: string; display_order?: number } }) =>
      updateGalleryItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl?: string }) => deleteGalleryItem(id, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}

export function useReorderGalleryItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedItems: { id: string; display_order: number }[]) => reorderGalleryItems(orderedItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}

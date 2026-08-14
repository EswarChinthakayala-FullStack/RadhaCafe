import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  incrementGalleryItemView,
  type CreateGalleryItemInput,
  type UpdateGalleryItemInput,
  type GalleryItem,
} from '../lib/supabase/queries/gallery';

export const GALLERY_QUERY_KEY = ['gallery', 'images'] as const;

export function useGalleryImages() {
  return useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: fetchGalleryItems,
    staleTime: 60000,
  });
}

export function useIncrementGalleryView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incrementGalleryItemView(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: GALLERY_QUERY_KEY });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<GalleryItem[]>(GALLERY_QUERY_KEY);

      // Optimistically update query data instantly
      queryClient.setQueryData<GalleryItem[]>(GALLERY_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === id
            ? { ...item, views_count: (item.views_count ?? 0) + 1 }
            : item
        );
      });

      return { previousItems };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(GALLERY_QUERY_KEY, context.previousItems);
      }
    },
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGalleryItemInput) => createGalleryItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGalleryItemInput }) =>
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

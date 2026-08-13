import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWaterProducts,
  fetchWaterProductById,
  createWaterProduct,
  updateWaterProduct,
  deleteWaterProduct,
} from '../lib/supabase/queries/waterProducts';
import type { CreateWaterProductPayload } from '../types';

export function useWaterProducts(onlyAvailable = false) {
  return useQuery({
    queryKey: ['waterProducts', onlyAvailable],
    queryFn: () => fetchWaterProducts(onlyAvailable),
    staleTime: 1000 * 30,
  });
}

export function useWaterProduct(id?: string) {
  return useQuery({
    queryKey: ['waterProduct', id],
    queryFn: () => (id ? fetchWaterProductById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCreateWaterProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWaterProductPayload) => createWaterProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterProducts'] });
    },
  });
}

export function useUpdateWaterProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateWaterProductPayload> }) =>
      updateWaterProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waterProducts'] });
      queryClient.invalidateQueries({ queryKey: ['waterProduct', variables.id] });
    },
  });
}

export function useDeleteWaterProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWaterProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterProducts'] });
    },
  });
}

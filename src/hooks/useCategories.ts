import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type Category,
} from '../lib/supabase/queries/categories';
import { toast } from '../components/ui/toast';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 300000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string | null; display_order?: number }) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.add({
        title: 'Category Created',
        description: 'New menu category added successfully.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Creating Category',
        description: err.message || 'Unable to create category.',
        type: 'error',
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; icon?: string | null; display_order?: number } }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.add({
        title: 'Category Updated',
        description: 'Menu category details updated successfully.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Updating Category',
        description: err.message || 'Unable to update category.',
        type: 'error',
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.add({
        title: 'Category Deleted',
        description: 'Category removed. Associated menu items are now uncategorized.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Deleting Category',
        description: err.message || 'Unable to delete category.',
        type: 'error',
      });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; display_order: number }[]) => reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.add({
        title: 'Categories Reordered',
        description: 'Category display order updated successfully.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Reordering Failed',
        description: err.message || 'Unable to update category order.',
        type: 'error',
      });
    },
  });
}

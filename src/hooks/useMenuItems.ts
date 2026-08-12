import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from '../lib/supabase/queries/menuItems';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '../types';
import { toast } from '../components/ui/toast';

export const MENU_QUERY_KEYS = {
  all: ['menuItems'] as const,
  items: (availableOnly: boolean) => ['menuItems', { availableOnly }] as const,
};

export function useMenuItems(availableOnly = false) {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.items(availableOnly),
    queryFn: () => fetchMenuItems(availableOnly),
    staleTime: 60000,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => createMenuItem(input),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.all });
      toast.add({
        title: 'Menu Item Created',
        description: `"${newItem.name}" added to menu catalog.`,
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Creating Item',
        description: err.message || 'Unable to create menu item.',
        type: 'error',
      });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMenuItemInput }) => updateMenuItem(id, input),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.all });
      toast.add({
        title: 'Menu Item Updated',
        description: `"${updatedItem.name}" details saved successfully.`,
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Updating Item',
        description: err.message || 'Unable to update menu item.',
        type: 'error',
      });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      toggleMenuItemAvailability(id, is_available),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.all });
      toast.add({
        title: 'Availability Updated',
        description: `"${item.name}" is now ${item.is_available ? 'Available' : 'Unavailable'}.`,
        type: 'info',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Updating Availability',
        description: err.message || 'Unable to change availability status.',
        type: 'error',
      });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.all });
      toast.add({
        title: 'Menu Item Deleted',
        description: 'Menu item removed from catalog.',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast.add({
        title: 'Error Deleting Item',
        description: err.message || 'Unable to delete menu item.',
        type: 'error',
      });
    },
  });
}

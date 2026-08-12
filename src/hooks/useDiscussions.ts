import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllReviews,
  fetchPublicReviews,
  approveReview,
  deleteReview,
  submitReview,
} from '../lib/supabase/queries/discussion';

export const DISCUSSIONS_QUERY_KEY = ['discussions'] as const;

export function useDiscussions(adminMode = true) {
  return useQuery({
    queryKey: ['discussions', adminMode ? 'admin' : 'public'],
    queryFn: adminMode ? fetchAllReviews : fetchPublicReviews,
    staleTime: 30000,
  });
}

export function useApproveDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
    },
  });
}

export function useDeleteDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
    },
  });
}

export function useSubmitDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { customer_name: string; rating: number; message: string }) => submitReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
    },
  });
}

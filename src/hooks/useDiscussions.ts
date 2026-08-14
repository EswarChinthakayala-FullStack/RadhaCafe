import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPublicReviewSummary,
  fetchPublicReviewsList,
  fetchAdminReviewSummary,
  fetchAdminReviewsList,
  submitPublicReview,
  toggleReviewHelpfulVote,
  adminReplyToReview,
  adminDeleteReviewReply,
  approveReview,
  unpublishReview,
  deleteReview,
  fetchAllReviews,
  fetchPublicReviews,
  type PublicReviewQueryParams,
  type PublicReviewSummary,
  type PublicReviewsResponse,
  type AdminReviewQueryParams,
  type AdminReviewSummary,
  type AdminReviewsResponse,
  type DiscussionReview,
} from '../lib/supabase/queries/discussion';

export const DISCUSSIONS_QUERY_KEY = ['discussions'] as const;
export const REVIEW_SUMMARY_QUERY_KEY = ['reviews', 'summary'] as const;
export const PUBLIC_REVIEWS_QUERY_KEY = ['reviews', 'public-list'] as const;
export const ADMIN_REVIEW_SUMMARY_QUERY_KEY = ['reviews', 'admin-summary'] as const;
export const ADMIN_REVIEWS_QUERY_KEY = ['reviews', 'admin-list'] as const;

/**
 * Public Review Summary Hook (Average rating, 5-to-1 distribution, total reviews)
 */
export function usePublicReviewSummary() {
  return useQuery<PublicReviewSummary>({
    queryKey: REVIEW_SUMMARY_QUERY_KEY,
    queryFn: fetchPublicReviewSummary,
    staleTime: 60 * 1000,
  });
}

/**
 * Public Reviews List Hook with server-side filters, search, and sorting
 */
export function usePublicReviews(params: PublicReviewQueryParams) {
  return useQuery<PublicReviewsResponse>({
    queryKey: [...PUBLIC_REVIEWS_QUERY_KEY, params],
    queryFn: () => fetchPublicReviewsList(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Admin Review Summary Hook (Pending count, Approved count, Avg Approved Rating, Needs Reply count)
 */
export function useAdminReviewSummary() {
  return useQuery<AdminReviewSummary>({
    queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY,
    queryFn: fetchAdminReviewSummary,
    staleTime: 15 * 1000,
  });
}

/**
 * Admin Reviews List Hook with full server-side filtering, status, rating, reply state, search, and pagination
 */
export function useAdminReviews(params: AdminReviewQueryParams) {
  return useQuery<AdminReviewsResponse>({
    queryKey: [...ADMIN_REVIEWS_QUERY_KEY, params],
    queryFn: () => fetchAdminReviewsList(params),
    staleTime: 10 * 1000,
  });
}

/**
 * Public Submit Review Hook (Submits with is_approved = false)
 */
export function useSubmitPublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { customer_name: string; rating: number; message: string }) =>
      submitPublicReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Toggle Helpful Vote Hook with optimistic cache update
 */
export function useToggleReviewHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, sessionId }: { reviewId: string; sessionId: string }) =>
      toggleReviewHelpfulVote(reviewId, sessionId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Reply to customer review
 */
export function useAdminReplyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      adminReplyToReview(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
    },
  });
}

/**
 * Admin: Delete reply from review
 */
export function useAdminDeleteReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => adminDeleteReviewReply(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
    },
  });
}

/**
 * Admin: Approve a pending review
 */
export function useApproveDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Unpublish an approved review (revert to pending)
 */
export function useUnpublishDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Permanently delete a review
 */
export function useDeleteDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Compatibility Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useDiscussions(adminMode = true) {
  return useQuery<DiscussionReview[]>({
    queryKey: ['discussions', adminMode ? 'admin' : 'public'],
    queryFn: adminMode ? fetchAllReviews : fetchPublicReviews,
  });
}

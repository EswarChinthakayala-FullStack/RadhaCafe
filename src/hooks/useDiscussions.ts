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
  fetchAdminReviewById,
  fetchAdminReviewNavigation,
  type AdminReviewNavigationInfo,
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
export const ADMIN_REVIEW_DETAIL_QUERY_KEY = ['reviews', 'admin-detail'] as const;
export const ADMIN_REVIEW_NAV_QUERY_KEY = ['reviews', 'admin-nav'] as const;

/**
 * Admin Single Review Detail Hook
 */
export function useAdminReviewDetail(reviewId: string) {
  return useQuery<DiscussionReview | null>({
    queryKey: [...ADMIN_REVIEW_DETAIL_QUERY_KEY, reviewId],
    queryFn: () => fetchAdminReviewById(reviewId),
    enabled: Boolean(reviewId),
    staleTime: 20 * 1000,
  });
}

/**
 * Admin Review Navigation Hook (Previous, Next, Current Index, Total)
 */
export function useAdminReviewNavigation(reviewId: string, params: AdminReviewQueryParams) {
  return useQuery<AdminReviewNavigationInfo>({
    queryKey: [...ADMIN_REVIEW_NAV_QUERY_KEY, reviewId, params],
    queryFn: () => fetchAdminReviewNavigation(reviewId, params),
    enabled: Boolean(reviewId),
    staleTime: 15 * 1000,
  });
}

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
 * Public Submit Review Hook (Submits review and immediately invalidates all review caches)
 */
export function useSubmitPublicReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { customer_name: string; rating: number; message: string }) =>
      submitPublicReview(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY }),
      ]);
      queryClient.refetchQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
    },
  });
}

/**
 * Toggle Helpful Vote Hook with instant 0ms optimistic cache update
 */
export function useToggleReviewHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, sessionId }: { reviewId: string; sessionId: string }) =>
      toggleReviewHelpfulVote(reviewId, sessionId),
    onMutate: async ({ reviewId }) => {
      await queryClient.cancelQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });

      // Optimistically update all public reviews list queries in cache
      queryClient.setQueriesData<PublicReviewsResponse>(
        { queryKey: PUBLIC_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          const userVoted = new Set(old.userVotedIds || []);
          const isCurrentlyVoted = userVoted.has(reviewId);

          if (isCurrentlyVoted) {
            userVoted.delete(reviewId);
          } else {
            userVoted.add(reviewId);
          }

          return {
            ...old,
            userVotedIds: Array.from(userVoted),
            items: old.items.map((item) => {
              if (item.id !== reviewId) return item;
              const currentHelpful = Number(item.helpful_count || 0);
              const nextHelpful = isCurrentlyVoted
                ? Math.max(0, currentHelpful - 1)
                : currentHelpful + 1;
              return {
                ...item,
                helpful_count: nextHelpful,
              };
            }),
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Reply to customer review (with instant optimistic update)
 */
export function useAdminReplyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      adminReplyToReview(reviewId, reply),
    onMutate: async ({ reviewId, reply }) => {
      const nowIso = new Date().toISOString();

      // 1. Instantly update single review detail cache
      queryClient.setQueryData<DiscussionReview | null>(
        [...ADMIN_REVIEW_DETAIL_QUERY_KEY, reviewId],
        (prev) => (prev ? { ...prev, admin_reply: reply, admin_replied_at: nowIso } : null)
      );

      // 2. Instantly update all list queries in cache
      queryClient.setQueriesData<AdminReviewsResponse>(
        { queryKey: ADMIN_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === reviewId ? { ...item, admin_reply: reply, admin_replied_at: nowIso } : item
            ),
          };
        }
      );

      // 3. Instantly update summary counters
      queryClient.setQueryData<AdminReviewSummary>(
        ADMIN_REVIEW_SUMMARY_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            needs_reply_count: Math.max(0, old.needs_reply_count - 1),
            replied_count: old.replied_count + 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_DETAIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_NAV_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
    },
  });
}

/**
 * Admin: Delete reply from review (with instant optimistic update)
 */
export function useAdminDeleteReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => adminDeleteReviewReply(reviewId),
    onMutate: async (reviewId: string) => {
      // 1. Instantly update single review detail cache
      queryClient.setQueryData<DiscussionReview | null>(
        [...ADMIN_REVIEW_DETAIL_QUERY_KEY, reviewId],
        (prev) => (prev ? { ...prev, admin_reply: null, admin_replied_at: null } : null)
      );

      // 2. Instantly update all list queries in cache
      queryClient.setQueriesData<AdminReviewsResponse>(
        { queryKey: ADMIN_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === reviewId ? { ...item, admin_reply: null, admin_replied_at: null } : item
            ),
          };
        }
      );

      // 3. Instantly update summary counters
      queryClient.setQueryData<AdminReviewSummary>(
        ADMIN_REVIEW_SUMMARY_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            needs_reply_count: old.needs_reply_count + 1,
            replied_count: Math.max(0, old.replied_count - 1),
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_DETAIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_NAV_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
    },
  });
}

/**
 * Admin: Approve a pending review (with instant optimistic update)
 */
export function useApproveDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReview(id),
    onMutate: async (id: string) => {
      // 1. Instantly update single review detail cache
      queryClient.setQueryData<DiscussionReview | null>(
        [...ADMIN_REVIEW_DETAIL_QUERY_KEY, id],
        (prev) => (prev ? { ...prev, is_approved: true } : null)
      );

      // 2. Instantly update all list queries in cache
      queryClient.setQueriesData<AdminReviewsResponse>(
        { queryKey: ADMIN_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, is_approved: true } : item
            ),
          };
        }
      );

      // 3. Instantly update summary counters
      queryClient.setQueryData<AdminReviewSummary>(
        ADMIN_REVIEW_SUMMARY_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pending_count: Math.max(0, old.pending_count - 1),
            approved_count: old.approved_count + 1,
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_DETAIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_NAV_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Unpublish an approved review (with instant optimistic update)
 */
export function useUnpublishDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishReview(id),
    onMutate: async (id: string) => {
      // 1. Instantly update single review detail cache
      queryClient.setQueryData<DiscussionReview | null>(
        [...ADMIN_REVIEW_DETAIL_QUERY_KEY, id],
        (prev) => (prev ? { ...prev, is_approved: false } : null)
      );

      // 2. Instantly update all list queries in cache
      queryClient.setQueriesData<AdminReviewsResponse>(
        { queryKey: ADMIN_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, is_approved: false } : item
            ),
          };
        }
      );

      // 3. Instantly update summary counters
      queryClient.setQueryData<AdminReviewSummary>(
        ADMIN_REVIEW_SUMMARY_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pending_count: old.pending_count + 1,
            approved_count: Math.max(0, old.approved_count - 1),
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_DETAIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_NAV_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
    },
  });
}

/**
 * Admin: Permanently delete a review (with instant optimistic removal)
 */
export function useDeleteDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onMutate: async (id: string) => {
      // 1. Instantly clear single review detail cache
      queryClient.removeQueries({ queryKey: [...ADMIN_REVIEW_DETAIL_QUERY_KEY, id] });

      // 2. Instantly remove from all cached lists
      queryClient.setQueriesData<AdminReviewsResponse>(
        { queryKey: ADMIN_REVIEWS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            totalCount: Math.max(0, old.totalCount - 1),
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_DETAIL_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_NAV_QUERY_KEY });
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

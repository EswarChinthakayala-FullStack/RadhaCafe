import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import {
  useAdminReviewSummary,
  useAdminReviews,
  useApproveDiscussion,
  useUnpublishDiscussion,
  useAdminDeleteReply,
  useDeleteDiscussion,
  DISCUSSIONS_QUERY_KEY,
  ADMIN_REVIEW_SUMMARY_QUERY_KEY,
  ADMIN_REVIEWS_QUERY_KEY,
} from '../../../hooks/useDiscussions';
import { ReviewsPageHeader } from './ReviewsPageHeader';
import { ReviewAdminSummary } from './ReviewAdminSummary';
import { ReviewsToolbar, type ReviewsToolbarFilters } from './ReviewsToolbar';
import { AdminReviewList } from './AdminReviewList';
import { ReviewDetailsDialog } from './ReviewDetailsDialog';
import { AdminReplyDialog } from './AdminReplyDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

export function DiscussionModerator() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL filter state with defaults
  const search = searchParams.get('q') || '';
  const statusParam = searchParams.get('status');
  const status: 'all' | 'pending' | 'approved' =
    statusParam === 'approved' || statusParam === 'pending' ? statusParam : 'pending'; // Default to pending for moderation

  const ratingParam = searchParams.get('rating');
  const rating: number | 'all' =
    ratingParam && ['1', '2', '3', '4', '5'].includes(ratingParam)
      ? (Number(ratingParam) as 1 | 2 | 3 | 4 | 5)
      : 'all';

  const replyParam = searchParams.get('reply');
  const reply: 'all' | 'needed' | 'replied' =
    replyParam === 'needed' || replyParam === 'replied' ? replyParam : 'all';

  const sortParam = searchParams.get('sort');
  const sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' =
    sortParam === 'oldest' ||
    sortParam === 'highest' ||
    sortParam === 'lowest' ||
    sortParam === 'helpful'
      ? sortParam
      : 'newest';

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters: ReviewsToolbarFilters = useMemo(
    () => ({
      search,
      status,
      rating,
      reply,
      sort,
    }),
    [search, status, rating, reply, sort]
  );

  // Update URL Search Params
  const setFilters = useCallback(
    (newFilters: ReviewsToolbarFilters, newPage = 1) => {
      const params = new URLSearchParams();
      if (newFilters.search.trim()) params.set('q', newFilters.search.trim());
      if (newFilters.status !== 'all') params.set('status', newFilters.status);
      if (newFilters.rating !== 'all') params.set('rating', String(newFilters.rating));
      if (newFilters.reply !== 'all') params.set('reply', newFilters.reply);
      if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
      if (newPage > 1) params.set('page', String(newPage));
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ status: 'all' }), { replace: true });
  }, [setSearchParams]);

  // Server Queries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useAdminReviewSummary();

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useAdminReviews({
    search: filters.search,
    status: filters.status,
    rating: filters.rating,
    reply: filters.reply,
    sort: filters.sort,
    page,
    pageSize: 15,
  });

  // Mutations
  const approveMutation = useApproveDiscussion();
  const unpublishMutation = useUnpublishDiscussion();
  const deleteReplyMutation = useAdminDeleteReply();
  const deleteMutation = useDeleteDiscussion();

  // Modal / Dialog States
  const [detailsReviewId, setDetailsReviewId] = useState<string | null>(null);
  const [replyingReview, setReplyingReview] = useState<DiscussionReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<DiscussionReview | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Current reviews on active page
  const items = listData?.items || [];
  const totalCount = listData?.totalCount || 0;
  const totalPages = listData?.totalPages || 1;

  // Selected review for details modal
  const selectedDetailsReview = useMemo(() => {
    if (!detailsReviewId) return null;
    return items.find((r) => r.id === detailsReviewId) || null;
  }, [items, detailsReviewId]);

  const selectedDetailsIndex = useMemo(() => {
    if (!detailsReviewId) return -1;
    return items.findIndex((r) => r.id === detailsReviewId);
  }, [items, detailsReviewId]);

  // Realtime subscription to refresh moderation queue
  useEffect(() => {
    const channel = supabase
      .channel('admin-reviews-realtime-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'discussions' },
        () => {
          queryClient.invalidateQueries({ queryKey: DISCUSSIONS_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: ADMIN_REVIEW_SUMMARY_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Action handlers
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSummary(), refetchList()]);
      toast.add({
        title: 'Reviews Refreshed',
        description: 'Latest customer reviews loaded.',
        type: 'success',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (review: DiscussionReview) => {
    setApprovingId(review.id);
    try {
      await approveMutation.mutateAsync(review.id);
      toast.add({
        title: 'Review Approved',
        description: `Review from ${review.customer_name} is now published.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Approval Failed',
        description: err?.message || 'Unable to approve review.',
        type: 'error',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveAndReply = async (review: DiscussionReview) => {
    setApprovingId(review.id);
    try {
      await approveMutation.mutateAsync(review.id);
      setReplyingReview(review);
    } catch (err: any) {
      toast.add({
        title: 'Approval Failed',
        description: err?.message || 'Unable to approve review.',
        type: 'error',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleUnpublish = async (review: DiscussionReview) => {
    try {
      await unpublishMutation.mutateAsync(review.id);
      toast.add({
        title: 'Review Unpublished',
        description: `Review moved back to pending moderation.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unpublish Failed',
        description: err?.message || 'Unable to unpublish review.',
        type: 'error',
      });
    }
  };

  const handleRemoveReply = async (review: DiscussionReview) => {
    try {
      await deleteReplyMutation.mutateAsync(review.id);
      toast.add({
        title: 'Response Removed',
        description: 'Official response removed from this review.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Remove Response',
        description: err?.message || 'Unable to remove reply.',
        type: 'error',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteMutation.mutateAsync(deletingReview.id);
      toast.add({
        title: 'Review Deleted',
        description: 'The review submission has been permanently removed.',
        type: 'success',
      });
      if (detailsReviewId === deletingReview.id) {
        setDetailsReviewId(null);
      }
      setDeletingReview(null);
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err?.message || 'Unable to delete review.',
        type: 'error',
      });
    }
  };

  // Details Dialog sequence navigation
  const handleDetailsPrev = () => {
    if (selectedDetailsIndex > 0) {
      setDetailsReviewId(items[selectedDetailsIndex - 1].id);
    }
  };

  const handleDetailsNext = () => {
    if (selectedDetailsIndex >= 0 && selectedDetailsIndex < items.length - 1) {
      setDetailsReviewId(items[selectedDetailsIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <ReviewsPageHeader
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* KPI Summary Cards */}
      <ReviewAdminSummary
        summary={summary}
        isLoading={isSummaryLoading}
        activeStatusFilter={filters.status}
        activeReplyFilter={filters.reply}
        onSelectQuickFilter={(quickFilters) => {
          setFilters(
            {
              ...filters,
              status: quickFilters.status ?? filters.status,
              reply: quickFilters.reply ?? filters.reply,
            },
            1
          );
        }}
      />

      {/* Toolbar & Filters */}
      <ReviewsToolbar
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters, 1)}
        onReset={handleResetFilters}
        pendingCount={summary?.pending_count}
        approvedCount={summary?.approved_count}
        totalCount={summary?.total_reviews}
      />

      {/* Main Review List */}
      {isListError ? (
        <Card className="p-8 text-center border border-destructive/30 bg-destructive/5 space-y-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={AlertCircleIcon} size={20} />
          </div>
          <h3 className="font-heading font-bold text-sm text-foreground">
            Unable to load reviews
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please check your database connection or try refreshing the page.
          </p>
          <Button size="sm" variant="outline" onClick={handleRefreshAll} className="gap-1.5 text-xs">
            <HugeiconsIcon icon={RefreshIcon} size={13} />
            <span>Retry Loading</span>
          </Button>
        </Card>
      ) : (
        <AdminReviewList
          items={items}
          isLoading={isListLoading}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(newPage) => setFilters(filters, newPage)}
          onApprove={handleApprove}
          onApproveAndReply={handleApproveAndReply}
          onUnpublish={handleUnpublish}
          onOpenReply={(review) => setReplyingReview(review)}
          onOpenDetails={(review) => setDetailsReviewId(review.id)}
          onDelete={(review) => setDeletingReview(review)}
          onRemoveReply={handleRemoveReply}
          onResetFilters={handleResetFilters}
          activeStatus={filters.status}
          activeReply={filters.reply}
          approvingId={approvingId}
        />
      )}

      {/* Review Details Modal */}
      <ReviewDetailsDialog
        review={selectedDetailsReview}
        open={Boolean(selectedDetailsReview)}
        onOpenChange={(open) => {
          if (!open) setDetailsReviewId(null);
        }}
        onDeleteRequest={(review) => setDeletingReview(review)}
        onNavigatePrev={handleDetailsPrev}
        onNavigateNext={handleDetailsNext}
        hasPrev={selectedDetailsIndex > 0}
        hasNext={selectedDetailsIndex >= 0 && selectedDetailsIndex < items.length - 1}
      />

      {/* Quick Reply Dialog */}
      <AdminReplyDialog
        review={replyingReview}
        open={Boolean(replyingReview)}
        onOpenChange={(open) => {
          if (!open) setReplyingReview(null);
        }}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingReview)}
        onOpenChange={(open) => {
          if (!open) setDeletingReview(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border/80 rounded-2xl p-6 space-y-3 max-w-md shadow-2xl">
          <AlertDialogHeader className="space-y-1 text-left p-0">
            <AlertDialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
              Delete review from "{deletingReview?.customer_name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action will permanently remove this customer review and its RadhaCafe response from the system. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deletingReview && (
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-foreground/80 italic line-clamp-3">
              "{deletingReview.message}"
            </div>
          )}

          <AlertDialogFooter className="flex items-center gap-2 pt-2 border-t border-border/60">
            <AlertDialogCancel className="text-xs rounded-lg h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white font-bold text-xs rounded-lg h-9 px-4"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

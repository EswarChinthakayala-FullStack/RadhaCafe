import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminReviewDetail,
  useAdminReviewNavigation,
  useApproveDiscussion,
  useUnpublishDiscussion,
  useAdminReplyReview,
  useAdminDeleteReply,
  useDeleteDiscussion,
  ADMIN_REVIEW_DETAIL_QUERY_KEY,
} from '../../hooks/useDiscussions';
import { fetchAdminReviewById } from '../../lib/supabase/queries/discussion';
import { ReviewViewerToolbar } from '../../components/admin/discussion/ReviewViewerToolbar';
import { ReviewViewerContent } from '../../components/admin/discussion/ReviewViewerContent';
import { ReviewModerationPanel } from '../../components/admin/discussion/ReviewModerationPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from '../../components/ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  Globe02Icon,
} from '@hugeicons/core-free-icons';
import type { AdminReviewQueryParams } from '../../lib/supabase/queries/discussion';

export function AdminReviewViewerPage() {
  const { reviewId = '' } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Extract filter parameters from URL to maintain queue context
  const search = searchParams.get('q') || '';
  const status = (searchParams.get('status') || 'all') as 'all' | 'pending' | 'approved';
  const ratingParam = searchParams.get('rating');
  const rating = ratingParam && ['1', '2', '3', '4', '5'].includes(ratingParam)
    ? (Number(ratingParam) as 1 | 2 | 3 | 4 | 5)
    : 'all';
  const reply = (searchParams.get('reply') || 'all') as 'all' | 'needed' | 'replied';
  const sort = (searchParams.get('sort') || 'newest') as
    | 'newest'
    | 'oldest'
    | 'highest'
    | 'lowest'
    | 'helpful';

  const filterParams: AdminReviewQueryParams = useMemo(
    () => ({ search, status, rating, reply, sort }),
    [search, status, rating, reply, sort]
  );

  // Queries
  const {
    data: review,
    isLoading: isReviewLoading,
    isError: isReviewError,
    refetch: refetchReview,
  } = useAdminReviewDetail(reviewId);

  const {
    data: navInfo,
  } = useAdminReviewNavigation(reviewId, filterParams);

  // Mutations
  const approveMutation = useApproveDiscussion();
  const unpublishMutation = useUnpublishDiscussion();
  const replyMutation = useAdminReplyReview();
  const deleteReplyMutation = useAdminDeleteReply();
  const deleteMutation = useDeleteDiscussion();

  // Dialog & Flow States
  const [isReplyDirty, setIsReplyDirty] = useState(false);
  const [pendingNavTargetId, setPendingNavTargetId] = useState<string | null>(null);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isInitialReplying, setIsInitialReplying] = useState(false);
  const [isQueueFinished, setIsQueueFinished] = useState(false);

  // Prefetch neighboring reviews (Next and Prev)
  useEffect(() => {
    if (navInfo?.nextReviewId) {
      queryClient.prefetchQuery({
        queryKey: [...ADMIN_REVIEW_DETAIL_QUERY_KEY, navInfo.nextReviewId],
        queryFn: () => fetchAdminReviewById(navInfo.nextReviewId!),
        staleTime: 30 * 1000,
      });
    }
    if (navInfo?.prevReviewId) {
      queryClient.prefetchQuery({
        queryKey: [...ADMIN_REVIEW_DETAIL_QUERY_KEY, navInfo.prevReviewId],
        queryFn: () => fetchAdminReviewById(navInfo.prevReviewId!),
        staleTime: 30 * 1000,
      });
    }
  }, [navInfo, queryClient]);

  // Back to Reviews list with exact search params
  const handleBackToList = useCallback(() => {
    navigate({
      pathname: '/admin/discussion',
      search: searchParams.toString(),
    });
  }, [navigate, searchParams]);

  // Navigate to another review
  const handleNavigateToReview = useCallback(
    (targetId: string) => {
      if (isReplyDirty) {
        setPendingNavTargetId(targetId);
        setIsDiscardAlertOpen(true);
        return;
      }

      setIsInitialReplying(false);
      navigate(
        {
          pathname: `/admin/discussion/${targetId}`,
          search: searchParams.toString(),
        },
        { replace: true }
      );
    },
    [isReplyDirty, navigate, searchParams]
  );

  const handleConfirmDiscardAndNavigate = () => {
    setIsDiscardAlertOpen(false);
    setIsReplyDirty(false);
    if (pendingNavTargetId) {
      if (pendingNavTargetId === 'BACK_TO_LIST') {
        handleBackToList();
      } else {
        navigate(
          {
            pathname: `/admin/discussion/${pendingNavTargetId}`,
            search: searchParams.toString(),
          },
          { replace: true }
        );
      }
      setPendingNavTargetId(null);
    }
  };

  // Keyboard navigation (ArrowLeft = Prev, ArrowRight = Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger navigation if user is focused inside a Textarea or Input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'textarea' || targetTag === 'input') {
        return;
      }

      if (e.key === 'ArrowLeft' && navInfo?.prevReviewId) {
        e.preventDefault();
        handleNavigateToReview(navInfo.prevReviewId);
      } else if (e.key === 'ArrowRight' && navInfo?.nextReviewId) {
        e.preventDefault();
        handleNavigateToReview(navInfo.nextReviewId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navInfo, handleNavigateToReview]);

  // Actions
  const handleApprove = async () => {
    if (!review) return;
    try {
      await approveMutation.mutateAsync(review.id);
      toast.add({
        title: 'Review Approved',
        description: `Review from ${review.customer_name} is now published.`,
        type: 'success',
      });

      // Auto-advance in Pending moderation queue
      if (status === 'pending') {
        if (navInfo?.nextReviewId) {
          handleNavigateToReview(navInfo.nextReviewId);
        } else if (navInfo?.prevReviewId) {
          handleNavigateToReview(navInfo.prevReviewId);
        } else {
          setIsQueueFinished(true);
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Approval Failed',
        description: err?.message || 'Unable to approve review.',
        type: 'error',
      });
    }
  };

  const handleApproveAndReply = async () => {
    if (!review) return;
    try {
      await approveMutation.mutateAsync(review.id);
      setIsInitialReplying(true);
      toast.add({
        title: 'Review Approved',
        description: `Now write an official response as RadhaCafe.`,
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Approval Failed',
        description: err?.message || 'Unable to approve review.',
        type: 'error',
      });
    }
  };

  const handleUnpublish = async () => {
    if (!review) return;
    try {
      await unpublishMutation.mutateAsync(review.id);
      toast.add({
        title: 'Review Unpublished',
        description: `Review moved back to pending moderation.`,
        type: 'success',
      });

      // Auto-advance if in Approved queue
      if (status === 'approved') {
        if (navInfo?.nextReviewId) {
          handleNavigateToReview(navInfo.nextReviewId);
        } else if (navInfo?.prevReviewId) {
          handleNavigateToReview(navInfo.prevReviewId);
        } else {
          setIsQueueFinished(true);
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Unpublish Failed',
        description: err?.message || 'Unable to unpublish review.',
        type: 'error',
      });
    }
  };

  const handleSaveReply = async (replyText: string) => {
    if (!review) return;
    try {
      await replyMutation.mutateAsync({
        reviewId: review.id,
        reply: replyText,
      });
      setIsReplyDirty(false);
      toast.add({
        title: 'Response Saved',
        description: 'Official RadhaCafe response updated successfully.',
        type: 'success',
      });

      // If in Needs Reply queue, auto-advance after publishing
      if (reply === 'needed' && !review.admin_reply) {
        if (navInfo?.nextReviewId) {
          handleNavigateToReview(navInfo.nextReviewId);
        } else if (navInfo?.prevReviewId) {
          handleNavigateToReview(navInfo.prevReviewId);
        } else {
          setIsQueueFinished(true);
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Failed to Save Response',
        description: err?.message || 'Please try again.',
        type: 'error',
      });
      throw err;
    }
  };

  const handleRemoveReply = async () => {
    if (!review) return;
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
      throw err;
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;
    try {
      await deleteMutation.mutateAsync(review.id);
      setIsDeleteAlertOpen(false);
      toast.add({
        title: 'Review Deleted',
        description: 'Review has been permanently removed.',
        type: 'success',
      });

      // Move to next available review or back to list
      if (navInfo?.nextReviewId) {
        handleNavigateToReview(navInfo.nextReviewId);
      } else if (navInfo?.prevReviewId) {
        handleNavigateToReview(navInfo.prevReviewId);
      } else {
        handleBackToList();
      }
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err?.message || 'Unable to delete review.',
        type: 'error',
      });
    }
  };

  // Queue context label for header
  const getQueueLabel = () => {
    if (status === 'pending') return 'Pending Moderation';
    if (status === 'approved') return 'Approved Reviews';
    if (reply === 'needed') return 'Needs Reply';
    return 'All Reviews';
  };

  // Loading Skeleton State
  if (isReviewLoading) {
    return (
      <div className="space-y-6 pb-12 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
        <div className="h-14 bg-card border-b border-border/80 px-6 flex items-center justify-between">
          <Skeleton className="h-8 w-32 rounded-lg bg-muted/60" />
          <Skeleton className="h-8 w-44 rounded-lg bg-muted/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-64 rounded-2xl bg-card border border-border/60" />
            <Skeleton className="h-32 rounded-2xl bg-card border border-border/60" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-44 rounded-2xl bg-card border border-border/60" />
            <Skeleton className="h-52 rounded-2xl bg-card border border-border/60" />
          </div>
        </div>
      </div>
    );
  }

  // Queue Completed State
  if (isQueueFinished) {
    return (
      <div className="space-y-6 pb-12 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
        <ReviewViewerToolbar
          review={{ customer_name: 'Moderation Queue', id: '', is_approved: true, message: '', rating: 5, created_at: '' }}
          onNavigatePrev={() => {}}
          onNavigateNext={() => {}}
          onBackToList={handleBackToList}
          onDeleteRequest={() => {}}
          onUnpublishRequest={() => {}}
          queueLabel={getQueueLabel()}
        />

        <div className="max-w-md mx-auto px-4 pt-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-heading text-foreground">You're all caught up!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              There are no more reviews waiting in this moderation queue.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="h-9 px-4 text-xs font-semibold rounded-xl border-border bg-card"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="mr-1.5" />
              <span>Back to Reviews</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                navigate('/reviews');
              }}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-cinnamon hover:bg-cinnamon/90 text-white shadow-2xs gap-1.5"
            >
              <HugeiconsIcon icon={Globe02Icon} size={14} />
              <span>View Public Reviews</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (isReviewError || !review) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <HugeiconsIcon icon={AlertCircleIcon} size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">Review Not Found</h3>
          <p className="text-xs text-muted-foreground">
            This review might have been deleted or the link is invalid.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBackToList}
            className="h-9 text-xs rounded-xl"
          >
            Back to Reviews
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => refetchReview()}
            className="h-9 text-xs bg-cinnamon text-white rounded-xl"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
      {/* 1. Full-Width Top Sticky Viewer Toolbar */}
      <ReviewViewerToolbar
        review={review}
        navInfo={navInfo}
        onNavigatePrev={() => {
          if (navInfo?.prevReviewId) handleNavigateToReview(navInfo.prevReviewId);
        }}
        onNavigateNext={() => {
          if (navInfo?.nextReviewId) handleNavigateToReview(navInfo.nextReviewId);
        }}
        onBackToList={handleBackToList}
        onDeleteRequest={() => setIsDeleteAlertOpen(true)}
        onUnpublishRequest={handleUnpublish}
        queueLabel={getQueueLabel()}
      />

      {/* 2. Responsive 2-Column Desktop / Stacked Tablet & Mobile Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Review Content (~65%) */}
          <div className="lg:col-span-8 space-y-6">
            <ReviewViewerContent review={review} />
          </div>

          {/* Right Column: Moderation & RadhaCafe Response Management (~35%, Sticky on Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-16 space-y-6">
            <ReviewModerationPanel
              review={review}
              onApprove={handleApprove}
              onApproveAndReply={handleApproveAndReply}
              onUnpublish={handleUnpublish}
              onDeleteRequest={() => setIsDeleteAlertOpen(true)}
              onSaveReply={handleSaveReply}
              onRemoveReply={handleRemoveReply}
              isApprovePending={approveMutation.isPending}
              isUnpublishPending={unpublishMutation.isPending}
              isReplySaving={replyMutation.isPending}
              isReplyRemoving={deleteReplyMutation.isPending}
              isInitialReplying={isInitialReplying}
              onDirtyChange={setIsReplyDirty}
            />
          </div>
        </div>
      </div>

      {/* 3. Discard Draft Confirmation Dialog */}
      <AlertDialog open={isDiscardAlertOpen} onOpenChange={setIsDiscardAlertOpen}>
        <AlertDialogContent className="bg-card border-border rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Discard unsaved response?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have an unsaved RadhaCafe response draft. Navigating away will discard your typed reply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscardAndNavigate}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              Discard & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 4. Delete Review Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-card border-border rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Permanently delete this review?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <span>
                Are you sure you want to delete the review from <strong>{review.customer_name}</strong>?
              </span>
              <span className="block italic text-foreground/80 bg-secondary/40 p-2.5 rounded-lg border border-border/60 line-clamp-2">
                &ldquo;{review.message}&rdquo;
              </span>
              <span className="block text-destructive font-semibold">
                This action cannot be undone and will remove it permanently from the database.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { AdminReviewCard } from './AdminReviewCard';
import { Skeleton } from '../../ui/skeleton';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FilterIcon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

interface AdminReviewListProps {
  items: DiscussionReview[];
  isLoading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onApprove: (review: DiscussionReview) => void;
  onApproveAndReply: (review: DiscussionReview) => void;
  onUnpublish: (review: DiscussionReview) => void;
  onOpenReply: (review: DiscussionReview) => void;
  onOpenDetails: (review: DiscussionReview) => void;
  onDelete: (review: DiscussionReview) => void;
  onRemoveReply: (review: DiscussionReview) => void;
  onResetFilters: () => void;
  activeStatus: 'all' | 'pending' | 'approved';
  activeReply: 'all' | 'needed' | 'replied';
  approvingId?: string | null;
}

export function AdminReviewList({
  items,
  isLoading,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onApprove,
  onApproveAndReply,
  onUnpublish,
  onOpenReply,
  onOpenDetails,
  onDelete,
  onRemoveReply,
  onResetFilters,
  activeStatus,
  activeReply,
  approvingId,
}: AdminReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl bg-card/80 border border-border/40" />
        ))}
      </div>
    );
  }

  // Specific contextual empty states
  if (items.length === 0) {
    if (activeStatus === 'pending') {
      return (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">
            You're all caught up!
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are currently no customer reviews waiting for moderation. New reviews will appear here automatically.
          </p>
        </div>
      );
    }

    if (activeReply === 'needed') {
      return (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card space-y-3">
          <div className="w-12 h-12 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">
            All reviews have a response
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Great job! Every approved customer review has received an official RadhaCafe reply.
          </p>
        </div>
      );
    }

    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card space-y-3">
        <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
          <HugeiconsIcon icon={Comment01Icon} size={24} />
        </div>
        <h3 className="font-heading font-bold text-base text-foreground">
          No reviews match these filters
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Try searching for different keywords or clearing active status and rating filters.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={onResetFilters}
          className="text-xs font-semibold gap-1.5 rounded-lg border-border/80"
        >
          <HugeiconsIcon icon={FilterIcon} size={13} />
          <span>Clear Filters</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Review Cards Stack */}
      <div className="space-y-3">
        {items.map((review) => (
          <AdminReviewCard
            key={review.id}
            review={review}
            onApprove={onApprove}
            onApproveAndReply={onApproveAndReply}
            onUnpublish={onUnpublish}
            onOpenReply={onOpenReply}
            onOpenDetails={onOpenDetails}
            onDelete={onDelete}
            onRemoveReply={onRemoveReply}
            isApprovePending={approvingId === review.id}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-3 text-xs">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <span className="text-xs text-muted-foreground font-medium">
            Page <span className="font-bold text-foreground">{currentPage}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span>{' '}
            <span className="text-[11px]">({totalCount} reviews)</span>
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80"
          >
            <span className="hidden sm:inline">Next</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreVerticalIcon,
  Globe02Icon,
  Copy01Icon,
  Delete02Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview, AdminReviewNavigationInfo } from '../../../lib/supabase/queries/discussion';

interface ReviewViewerToolbarProps {
  review: DiscussionReview;
  navInfo?: AdminReviewNavigationInfo;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onBackToList: () => void;
  onDeleteRequest: () => void;
  onUnpublishRequest: () => void;
  queueLabel?: string;
}

export function ReviewViewerToolbar({
  review,
  navInfo,
  onNavigatePrev,
  onNavigateNext,
  onBackToList,
  onDeleteRequest,
  onUnpublishRequest,
  queueLabel,
}: ReviewViewerToolbarProps) {
  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/reviews#review-${review.id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.add({
      title: 'Review Link Copied',
      description: 'Public review link copied to clipboard.',
      type: 'success',
    });
  };

  const handleViewPublic = () => {
    window.open(`/reviews#review-${review.id}`, '_blank', 'noopener,noreferrer');
  };

  const currentIndex = navInfo?.currentIndex || 1;
  const totalCount = navInfo?.totalCount || 1;
  const hasPrev = navInfo?.hasPrev ?? false;
  const hasNext = navInfo?.hasNext ?? false;

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/80 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 transition-all">
      {/* Left: Back Button & Review Position */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBackToList}
          className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-lg gap-1.5 border-border/80 bg-card text-foreground hover:bg-secondary shadow-2xs shrink-0"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span className="hidden sm:inline">Back to Reviews</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="h-4 w-px bg-border/80 hidden sm:block" />

        {/* Position Counter Pill */}
        <div className="flex items-center gap-1.5 truncate">
          <Badge
            variant="outline"
            className="text-[11px] font-mono font-bold text-foreground border-border/80 bg-secondary/40 px-2 sm:px-2.5 py-0.5 rounded-md shrink-0"
          >
            {currentIndex} of {totalCount}
          </Badge>

          {queueLabel && (
            <span className="text-xs text-muted-foreground font-medium hidden md:inline truncate">
              in {queueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Right: Prev/Next Slider Navigation & Actions Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Previous Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={onNavigatePrev}
          className="h-8 sm:h-9 px-2 sm:px-3 text-xs font-semibold rounded-lg gap-1 border-border/80 bg-card text-foreground hover:bg-secondary shadow-2xs disabled:opacity-40"
          title="Previous review (Left Arrow)"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span className="hidden md:inline">Previous</span>
        </Button>

        {/* Next Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={onNavigateNext}
          className="h-8 sm:h-9 px-2 sm:px-3 text-xs font-semibold rounded-lg gap-1 border-border/80 bg-card text-foreground hover:bg-secondary shadow-2xs disabled:opacity-40"
          title="Next review (Right Arrow)"
        >
          <span className="hidden md:inline">Next</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg border-border/80 bg-card text-muted-foreground hover:text-foreground shadow-2xs"
                title="More review options"
              />
            }
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={15} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-card border-border/80 text-xs rounded-xl shadow-xl p-1.5">
            {review.is_approved && (
              <>
                <DropdownMenuItem
                  onClick={handleViewPublic}
                  className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
                >
                  <HugeiconsIcon icon={Globe02Icon} size={14} className="text-cinnamon" />
                  <span>View on Website</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} className="text-muted-foreground" />
                  <span>Copy Public Link</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={onUnpublishRequest}
                  className="gap-2 p-2 rounded-lg cursor-pointer text-amber-600 hover:bg-amber-500/10"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  <span>Unpublish Review</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem
              onClick={onDeleteRequest}
              className="gap-2 p-2 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 font-semibold"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              <span>Delete Review</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

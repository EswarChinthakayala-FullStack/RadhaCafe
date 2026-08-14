import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Message01Icon,
  MoreVerticalIcon,
  ThumbsUpIcon,
  Coffee02Icon,
  EyeIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

const AVATAR_COLORS = [
  'bg-cinnamon/20 text-cinnamon',
  'bg-[#6F4E37]/20 text-[#6F4E37] dark:text-[#E5A88B]',
  'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  'bg-[#3E2723]/20 text-[#3E2723] dark:text-[#D7CCC8]',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return 'RC';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface AdminReviewCardProps {
  review: DiscussionReview;
  onApprove: (review: DiscussionReview) => void;
  onApproveAndReply: (review: DiscussionReview) => void;
  onUnpublish: (review: DiscussionReview) => void;
  onOpenReply: (review: DiscussionReview) => void;
  onOpenDetails: (review: DiscussionReview) => void;
  onDelete: (review: DiscussionReview) => void;
  onRemoveReply: (review: DiscussionReview) => void;
  isApprovePending?: boolean;
}

export function AdminReviewCard({
  review,
  onApprove,
  onApproveAndReply,
  onUnpublish,
  onOpenReply,
  onOpenDetails,
  onDelete,
  onRemoveReply,
  isApprovePending = false,
}: AdminReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = getInitials(review.customer_name);
  const avatarColor = getAvatarColor(review.customer_name);
  const isLong = review.message.length > 180;
  const isApproved = review.is_approved;
  const hasReply = Boolean(review.admin_reply);
  const needsReply = isApproved && !hasReply;

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {/* Top Header: Customer Info + Rating + Badges + Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/80 shadow-2xs shrink-0">
              <AvatarFallback className={`font-bold text-xs ${avatarColor}`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-bold text-sm text-foreground">
                  {review.customer_name}
                </h4>

                {/* Status Badge */}
                <Badge
                  variant={isApproved ? 'default' : 'outline'}
                  className={`text-[10px] font-bold rounded-md px-2 py-0.5 ${
                    isApproved
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                      : 'text-amber-700 border-amber-500/40 bg-amber-500/10'
                  }`}
                >
                  {isApproved ? 'Published' : 'Pending Moderation'}
                </Badge>

                {needsReply && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/10"
                  >
                    Needs Reply
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span>{formatDate(review.created_at)}</span>
                {review.helpful_count && review.helpful_count > 0 ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <HugeiconsIcon icon={ThumbsUpIcon} size={11} />
                    <span>{review.helpful_count} helpful</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Star Rating & Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="flex items-center gap-0.5 text-amber-500"
              aria-label={`Rated ${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={13}
                  className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
                />
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                    aria-label="More review options"
                  />
                }
              >
                <HugeiconsIcon icon={MoreVerticalIcon} size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border/80 text-xs">
                <DropdownMenuItem onClick={() => onOpenDetails(review)} className="gap-2">
                  <HugeiconsIcon icon={EyeIcon} size={14} />
                  <span>View Full Details</span>
                </DropdownMenuItem>

                {isApproved && (
                  <DropdownMenuItem onClick={() => onUnpublish(review)} className="gap-2 text-amber-600">
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                    <span>Unpublish (Make Pending)</span>
                  </DropdownMenuItem>
                )}

                {hasReply && (
                  <DropdownMenuItem onClick={() => onRemoveReply(review)} className="gap-2 text-destructive">
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                    <span>Remove Owner Reply</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onDelete(review)} className="gap-2 text-destructive font-semibold">
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  <span>Delete Review</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Review Message Body */}
        <div className="space-y-1.5">
          <p
            onClick={() => isLong && setIsExpanded(!isExpanded)}
            className={`text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal ${
              !isExpanded && isLong ? 'line-clamp-3' : ''
            }`}
          >
            {review.message}
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-bold text-cinnamon hover:underline cursor-pointer inline-block"
            >
              {isExpanded ? 'Show less' : 'Read full review'}
            </button>
          )}
        </div>

        {/* Official RadhaCafe Response Box (if present) */}
        {hasReply && (
          <div className="p-3 rounded-xl bg-cinnamon/5 border border-cinnamon/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-cinnamon/15 pb-1.5">
              <div className="flex items-center gap-1.5 text-cinnamon font-bold font-heading text-[11px]">
                <HugeiconsIcon icon={Coffee02Icon} size={13} />
                <span>Response from RadhaCafe</span>
              </div>
              {review.admin_replied_at && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDate(review.admin_replied_at)}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground/80 italic leading-relaxed">
              &ldquo;{review.admin_reply}&rdquo;
            </p>
          </div>
        )}

        {/* Bottom Contextual Actions Row */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap text-xs">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onOpenDetails(review)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg px-2.5"
          >
            <HugeiconsIcon icon={EyeIcon} size={13} />
            <span>Details</span>
          </Button>

          <div className="flex items-center gap-2">
            {!isApproved ? (
              <>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onApproveAndReply(review)}
                  disabled={isApprovePending}
                  className="h-8 text-xs font-semibold border-border text-foreground hover:bg-secondary gap-1.5 rounded-lg px-3"
                >
                  <HugeiconsIcon icon={Message01Icon} size={13} className="text-cinnamon" />
                  <span>Approve & Reply</span>
                </Button>

                <Button
                  size="xs"
                  onClick={() => onApprove(review)}
                  disabled={isApprovePending}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 rounded-lg px-3.5 shadow-2xs"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                  <span>{isApprovePending ? 'Approving...' : 'Approve'}</span>
                </Button>
              </>
            ) : (
              <Button
                size="xs"
                variant={hasReply ? 'outline' : 'default'}
                onClick={() => onOpenReply(review)}
                className={`h-8 text-xs font-bold gap-1.5 rounded-lg px-3.5 ${
                  hasReply
                    ? 'border-border text-foreground hover:bg-secondary'
                    : 'bg-cinnamon hover:bg-cinnamon/90 text-white shadow-2xs'
                }`}
              >
                <HugeiconsIcon icon={Message01Icon} size={13} />
                <span>{hasReply ? 'Edit Reply' : 'Reply as RadhaCafe'}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

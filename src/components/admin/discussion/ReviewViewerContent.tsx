import { useState } from 'react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { formatDate } from '../../../lib/utils/formatDate';
import { ReviewCard } from '../../reviews/ReviewCard';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  ThumbsUpIcon,
  EyeIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  QuoteDownIcon,
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

interface ReviewViewerContentProps {
  review: DiscussionReview;
}

export function ReviewViewerContent({ review }: ReviewViewerContentProps) {
  const [showPublicPreview, setShowPublicPreview] = useState(false);

  const initials = getInitials(review.customer_name);
  const avatarColor = getAvatarColor(review.customer_name);
  const isApproved = review.is_approved;

  return (
    <div className="space-y-4">
      {/* Primary Customer Review Card (Clean Editorial Style) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-6">
        {/* Customer Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-border/60 flex-wrap">
          {/* Avatar & Customer Details */}
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-border/80 shadow-2xs shrink-0">
              <AvatarFallback className={`font-extrabold text-base sm:text-lg ${avatarColor}`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight truncate">
                  {review.customer_name}
                </h2>

                <Badge
                  variant={isApproved ? 'default' : 'outline'}
                  className={`text-[11px] font-bold rounded-md px-2.5 py-0.5 shrink-0 ${
                    isApproved
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                      : 'text-amber-700 border-amber-500/40 bg-amber-500/10'
                  }`}
                >
                  {isApproved ? 'Published' : 'Pending Moderation'}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>{formatDate(review.created_at)}</span>
                {review.helpful_count && review.helpful_count > 0 ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <HugeiconsIcon icon={ThumbsUpIcon} size={13} />
                    <span>{review.helpful_count} people found this helpful</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Star Rating Display */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div
              className="flex items-center gap-0.5 text-amber-500"
              aria-label={`Rated ${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={19}
                  className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/30'}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">{review.rating} of 5 stars</span>
          </div>
        </div>

        {/* Customer Review Body (Clean Quote Typography without heavy nested card) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cinnamon/60">
            <HugeiconsIcon icon={QuoteDownIcon} size={20} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Customer Feedback
            </span>
          </div>

          <div className="pl-3 sm:pl-4 border-l-2 border-cinnamon/30 py-1">
            <p className="text-base sm:text-lg text-foreground/95 leading-relaxed font-normal whitespace-pre-wrap">
              {review.message}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Public Appearance Preview */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <HugeiconsIcon icon={EyeIcon} size={15} className="text-cinnamon" />
            <span>Public Appearance Preview</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPublicPreview(!showPublicPreview)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg px-2.5"
          >
            <span>{showPublicPreview ? 'Hide Preview' : 'Show Preview'}</span>
            <HugeiconsIcon icon={showPublicPreview ? ArrowUp01Icon : ArrowDown01Icon} size={13} />
          </Button>
        </div>

        {showPublicPreview && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              This is how this review and your response appear to website guests on RadhaCafe:
            </p>
            <div className="p-4 rounded-xl bg-[#140A06] border border-[#3E2519]">
              <ReviewCard
                id={review.id}
                customerName={review.customer_name}
                message={review.message}
                rating={review.rating}
                createdAt={review.created_at}
                adminReply={review.admin_reply}
                adminRepliedAt={review.admin_replied_at}
                helpfulCount={review.helpful_count || 0}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

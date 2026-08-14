import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import type { AdminReviewSummary } from '../../../lib/supabase/queries/discussion';

interface ReviewAdminSummaryProps {
  summary?: AdminReviewSummary;
  isLoading?: boolean;
  activeStatusFilter: 'all' | 'pending' | 'approved';
  activeReplyFilter: 'all' | 'needed' | 'replied';
  onSelectQuickFilter: (filters: {
    status?: 'all' | 'pending' | 'approved';
    reply?: 'all' | 'needed' | 'replied';
  }) => void;
}

export function ReviewAdminSummary({
  summary,
  isLoading,
  activeStatusFilter,
  activeReplyFilter,
  onSelectQuickFilter,
}: ReviewAdminSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-card/80 border border-border/40" />
        ))}
      </div>
    );
  }

  const pending = summary?.pending_count ?? 0;
  const approved = summary?.approved_count ?? 0;
  const avgRating = summary?.average_approved_rating ?? 5.0;
  const needsReply = summary?.needs_reply_count ?? 0;

  const isPendingActive = activeStatusFilter === 'pending' && activeReplyFilter === 'all';
  const isApprovedActive = activeStatusFilter === 'approved' && activeReplyFilter === 'all';
  const isNeedsReplyActive = activeReplyFilter === 'needed';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Pending Reviews Card */}
      <Card
        onClick={() => onSelectQuickFilter({ status: 'pending', reply: 'all' })}
        className={`cursor-pointer transition-all duration-200 border rounded-xl shadow-2xs hover:shadow-md select-none ${
          isPendingActive
            ? 'ring-2 ring-amber-500/80 bg-amber-500/10 border-amber-500/40'
            : 'bg-card border-border/80 hover:border-amber-500/40'
        }`}
      >
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={14} className="text-amber-600" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Pending
              </p>
            </div>
            <h3 className="text-2xl font-extrabold text-amber-600 font-heading">
              {pending}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-amber-700 border-amber-500/40 bg-amber-500/10 text-[10px] font-semibold hidden sm:inline-flex"
          >
            Needs Review
          </Badge>
        </CardContent>
      </Card>

      {/* 2. Published Reviews Card */}
      <Card
        onClick={() => onSelectQuickFilter({ status: 'approved', reply: 'all' })}
        className={`cursor-pointer transition-all duration-200 border rounded-xl shadow-2xs hover:shadow-md select-none ${
          isApprovedActive
            ? 'ring-2 ring-emerald-500/80 bg-emerald-500/10 border-emerald-500/40'
            : 'bg-card border-border/80 hover:border-emerald-500/40'
        }`}
      >
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Published
              </p>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-600 font-heading">
              {approved}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-emerald-700 border-emerald-500/40 bg-emerald-500/10 text-[10px] font-semibold hidden sm:inline-flex"
          >
            Live on Site
          </Badge>
        </CardContent>
      </Card>

      {/* 3. Average Rating Card */}
      <Card className="bg-card border-border/80 rounded-xl shadow-2xs">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-500" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Avg Rating
              </p>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground font-heading flex items-center gap-1.5">
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
            </h3>
          </div>
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <HugeiconsIcon
                key={i}
                icon={StarIcon}
                size={13}
                className={i < Math.round(avgRating) ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Needs Reply Card */}
      <Card
        onClick={() => onSelectQuickFilter({ status: 'approved', reply: 'needed' })}
        className={`cursor-pointer transition-all duration-200 border rounded-xl shadow-2xs hover:shadow-md select-none ${
          isNeedsReplyActive
            ? 'ring-2 ring-cinnamon bg-cinnamon/10 border-cinnamon/40'
            : 'bg-card border-border/80 hover:border-cinnamon/40'
        }`}
      >
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <HugeiconsIcon icon={Message01Icon} size={14} className="text-cinnamon" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Needs Reply
              </p>
            </div>
            <h3 className="text-2xl font-extrabold text-cinnamon font-heading">
              {needsReply}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-cinnamon border-cinnamon/30 bg-cinnamon/10 text-[10px] font-semibold hidden sm:inline-flex"
          >
            Awaiting Response
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

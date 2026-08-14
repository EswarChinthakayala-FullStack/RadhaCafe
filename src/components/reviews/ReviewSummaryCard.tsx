import { Card, CardContent } from '../ui/card';
import { WriteReviewDialog } from '../landing/WriteReviewDialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import type { PublicReviewSummary } from '../../lib/supabase/queries/discussion';

interface ReviewSummaryCardProps {
  summary?: PublicReviewSummary;
  isLoading?: boolean;
  selectedRating: number | 'all';
  onSelectRating: (rating: number | 'all') => void;
  className?: string;
}

export function ReviewSummaryCard({
  summary,
  isLoading = false,
  selectedRating,
  onSelectRating,
  className = '',
}: ReviewSummaryCardProps) {
  const total = summary?.total_reviews || 0;
  const avgNum = summary?.average_rating || 5.0;
  const avg = avgNum.toFixed(1);

  const starCounts = [
    { star: 5, count: summary?.rating_5_count || 0 },
    { star: 4, count: summary?.rating_4_count || 0 },
    { star: 3, count: summary?.rating_3_count || 0 },
    { star: 2, count: summary?.rating_2_count || 0 },
    { star: 1, count: summary?.rating_1_count || 0 },
  ];

  if (isLoading) {
    return (
      <Card className={`border-[#3E2519]/70 bg-[#1D100A] rounded-2xl shadow-xl p-6 animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-10 bg-[#2C1810] rounded w-28" />
          <div className="h-4 bg-[#2C1810] rounded w-40" />
          <div className="space-y-2.5 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 bg-[#2C1810] rounded w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border border-[#3E2519]/70 bg-[#1D100A]/95 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden ${className}`}>
      <CardContent className="p-6 sm:p-7 space-y-6">
        {/* Rating Header Overview */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-5xl sm:text-6xl font-extrabold text-cream tracking-tight">
              {avg}
            </span>
            <div className="space-y-1">
              <div
                className="flex items-center gap-1 text-amber-400"
                aria-label={`Rated ${avg} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={18}
                    className={
                      i < Math.round(avgNum)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[#3E2519]'
                    }
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-[#E5A88B]">
                {total} {total === 1 ? 'verified review' : 'guest reviews'}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
            Calculated directly from authentic RadhaCafe guest submissions.
          </p>
        </div>

        {/* Rating Breakdown Bars (Clickable to Filter) */}
        <div className="space-y-2.5 pt-2 border-t border-[#3E2519]/60">
          <p className="text-[11px] font-bold text-cream/80 uppercase tracking-wider">
            Rating Breakdown
          </p>
          <div className="space-y-2 text-xs" role="list" aria-label="Review rating distribution">
            {starCounts.map(({ star, count }) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const isSelected = selectedRating === star;

              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => onSelectRating(isSelected ? 'all' : star)}
                  className={`w-full flex items-center gap-3 p-1.5 rounded-lg transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-[#B85C1E]/20 border border-[#E5A88B]/40'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  aria-label={`Filter by ${star} star reviews: ${count} reviews (${percentage}%)`}
                >
                  <span className={`w-12 text-[11px] font-semibold shrink-0 flex items-center gap-1 ${
                    isSelected ? 'text-[#E5A88B]' : 'text-cream/80 group-hover:text-cream'
                  }`}>
                    <span>{star}</span>
                    <HugeiconsIcon icon={StarIcon} size={12} className="fill-amber-400 text-amber-400" />
                  </span>

                  {/* Visual Progress Track */}
                  <div className="flex-1 h-2.5 bg-[#140A06] rounded-full overflow-hidden border border-[#3E2519]/70 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#B85C1E] to-[#E5A88B]'
                          : 'bg-gradient-to-r from-[#8B5A2B] to-[#E5A88B]/80 group-hover:from-[#B85C1E] group-hover:to-[#E5A88B]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className={`w-8 text-right text-[11px] font-mono shrink-0 ${
                    isSelected ? 'text-[#E5A88B] font-bold' : 'text-cream/60 group-hover:text-cream/90'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRating !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectRating('all')}
              className="mt-2 text-xs font-semibold text-[#E5A88B] hover:text-[#EEB89D] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Reset rating filter (Show all)
            </button>
          )}
        </div>

        {/* Write a Review Button */}
        <div className="pt-2 border-t border-[#3E2519]/60">
          <WriteReviewDialog className="w-full justify-center py-3 text-xs" />
        </div>
      </CardContent>
    </Card>
  );
}

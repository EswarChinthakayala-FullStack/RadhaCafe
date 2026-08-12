import { WriteReviewDialog } from '../landing/WriteReviewDialog';
import type { DiscussionReview } from '../../lib/supabase/queries/discussion';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, Comment01Icon } from '@hugeicons/core-free-icons';

interface ReviewsHeaderProps {
  reviews?: DiscussionReview[];
}

export function ReviewsHeader({ reviews = [] }: ReviewsHeaderProps) {
  const totalReviews = reviews.length;

  const avgRatingNum =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews
      : 5.0;
  const avgRating = avgRatingNum.toFixed(1);

  // Calculate rating counts for 5, 4, 3, 2, 1 stars
  const counts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating || 5) === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <section className="bg-gradient-to-b from-[#1C100B] via-[#140A06] to-[#140A06] pt-24 pb-14 border-b border-[#2C1810] relative overflow-hidden">
      {/* Warm Ambient Glow Spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Introduction */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-bold uppercase tracking-widest">
              <HugeiconsIcon icon={Comment01Icon} size={14} />
              <span>RADHACAFE COMMUNITY</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-[1.1] tracking-tight">
              Good Coffee Deserves{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Good Company
              </span>
            </h1>

            <p className="text-xs sm:text-base text-cream/75 leading-relaxed max-w-xl font-normal">
              Discover authentic guest stories and feedback from coffee lovers at RadhaCafe. Every review helps us perfect our roast & hospitality.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <WriteReviewDialog />
              <a
                href="#all-reviews"
                className="text-xs font-bold text-cream/70 hover:text-[#E5A88B] transition-colors underline underline-offset-4"
              >
                Read Guest Testimonials
              </a>
            </div>
          </div>

          {/* Right Column: Rating Summary Card with Distribution Bars */}
          <div className="lg:col-span-5">
            <div className="bg-[#1D100A] border border-[#2C1810] rounded-md p-6 sm:p-7 shadow-xl space-y-6">
              {/* Top Summary Number & Stars */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#2C1810]">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-4xl sm:text-5xl font-bold text-cream">
                      {avgRating}
                    </span>
                    <span className="text-xs text-cream/60 font-medium">/ 5.0</span>
                  </div>
                  <p className="text-xs font-semibold text-cream/70 mt-1">Guest Rating</p>
                </div>

                <div className="text-right space-y-1">
                  <div
                    className="flex items-center gap-1 justify-end text-amber-400"
                    aria-label={`Rated ${avgRating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={16}
                        className={
                          i < Math.round(avgRatingNum)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#2C1810]'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-[#E5A88B]">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>

              {/* Rating Distribution Bars */}
              <div className="space-y-2 text-xs">
                {counts.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-12 text-cream/70 font-semibold text-[11px] shrink-0">
                      {star} Stars
                    </span>

                    {/* Progress Track */}
                    <div className="flex-1 h-2 bg-[#140A06] rounded-full overflow-hidden border border-[#2C1810]">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5A2B] to-[#E5A88B] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="w-8 text-right text-[11px] font-medium text-cream/50 shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

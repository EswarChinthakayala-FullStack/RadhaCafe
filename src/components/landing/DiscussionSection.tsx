import { useQuery } from '@tanstack/react-query';
import { fetchPublicReviews } from '../../lib/supabase/queries/discussion';
import { WriteReviewDialog } from './WriteReviewDialog';
import { ScrollReveal } from '../shared/ScrollReveal';
import { ReviewCard } from '../reviews/ReviewCard';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon } from '@hugeicons/core-free-icons';

export function DiscussionSection() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['discussions', 'public'],
    queryFn: fetchPublicReviews,
  });

  const count = reviews?.length || 0;
  const gridClasses =
    count === 1
      ? 'max-w-md mx-auto grid-cols-1'
      : count === 2
        ? 'max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2'
        : 'grid sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="reviews" className="py-20 bg-[#170D09] text-cream border-b border-[#2C1810]">
      <div className="container px-4 md:px-8 max-w-5xl mx-auto space-y-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#2C1810]">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold text-[#E5A88B] tracking-widest uppercase">
                Community & Feedback
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-cream flex items-center gap-3">
                Guest{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">Experiences</span>
                <HugeiconsIcon icon={Comment01Icon} size={28} className="text-[#E5A88B]" />
              </h2>
              <p className="text-xs sm:text-sm text-cream/70">
                Read approved stories from our guests or share your own visit to RadhaCafe.
              </p>
            </div>

            <WriteReviewDialog />
          </div>
        </ScrollReveal>

        {/* Approved Reviews Grid */}
        <div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#2C1810] bg-[#1D100A] p-5 space-y-3 animate-pulse rounded-md">
                  <div className="h-4 bg-[#2C1810] rounded w-28" />
                  <div className="h-3 bg-[#2C1810] rounded w-full" />
                  <div className="h-3 bg-[#2C1810] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className={`grid gap-6 ${gridClasses}`}>
              {reviews.slice(0, 6).map((r, idx) => (
                <ScrollReveal key={r.id} delay={0.08 * idx}>
                  <ReviewCard
                    id={r.id}
                    customerName={r.customer_name}
                    message={r.message}
                    rating={r.rating || 5}
                    createdAt={r.created_at}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#1D100A] rounded-md border border-dashed border-[#2C1810] max-w-md mx-auto space-y-3">
              <HugeiconsIcon icon={Comment01Icon} size={36} className="mx-auto text-[#E5A88B]/50" />
              <p className="text-base font-bold text-cream">No reviews yet</p>
              <p className="text-xs text-cream/60">
                Be the first guest to leave a review for RadhaCafe.
              </p>
              <div className="pt-2">
                <WriteReviewDialog />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

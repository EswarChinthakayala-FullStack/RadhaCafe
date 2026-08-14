import { Link } from 'react-router-dom';
import { usePublicReviews, usePublicReviewSummary } from '../../hooks/useDiscussions';
import { ROUTES } from '../../constants/routes';
import { WriteReviewDialog } from './WriteReviewDialog';
import { ScrollReveal } from '../shared/ScrollReveal';
import { ReviewCard } from '../reviews/ReviewCard';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  StarIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export function DiscussionSection() {
  const { data: summary } = usePublicReviewSummary();
  const { data: reviewsData, isLoading } = usePublicReviews({
    sort: 'relevant',
    page: 1,
    pageSize: 3,
  });

  const reviews = reviewsData?.items || [];
  const totalCount = summary?.total_reviews ?? (reviewsData?.totalCount || 0);

  return (
    <section
      id="reviews"
      className="py-20 sm:py-28 bg-[#170D09] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Guest Reviews and Feedback"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                <HugeiconsIcon icon={StarIcon} size={13} className="fill-current" />
                <span>Guest Experiences</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                What Our{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">Guests Say</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                Authentic stories and feedback from patrons across Tallur and beyond.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <WriteReviewDialog />
              <Link
                to={ROUTES.PUBLIC.REVIEWS}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-cream hover:text-white border border-white/15 text-xs font-semibold transition-all"
              >
                <span>View All Reviews</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Approved Reviews Preview Grid (3 Curated Cards) */}
        <div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-[#3E2519]/70 bg-[#1D100A] p-6 space-y-4 animate-pulse rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2C1810]" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-[#2C1810] rounded w-24" />
                      <div className="h-2.5 bg-[#2C1810] rounded w-16" />
                    </div>
                  </div>
                  <div className="h-3 bg-[#2C1810] rounded w-full" />
                  <div className="h-3 bg-[#2C1810] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {reviews.map((r, idx) => (
                  <ScrollReveal key={r.id} direction="up" delay={0.08 * idx} className="h-full">
                    <ReviewCard
                      id={r.id}
                      customerName={r.customer_name}
                      message={r.message}
                      rating={r.rating || 5}
                      createdAt={r.created_at}
                      adminReply={r.admin_reply}
                      adminRepliedAt={r.admin_replied_at}
                      helpfulCount={r.helpful_count || 0}
                      className="h-full"
                    />
                  </ScrollReveal>
                ))}
              </div>

              {/* View All Reviews CTA Link Bar */}
              <div className="text-center pt-2">
                <Link
                  to={ROUTES.PUBLIC.REVIEWS}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1D100A] hover:bg-[#B85C1E] text-cream hover:text-white border border-[#3E2519] text-xs font-bold transition-all shadow-md group"
                >
                  <span>Read all {totalCount > 0 ? `${totalCount} reviews` : 'reviews'}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#1D100A]/80 rounded-2xl border border-dashed border-[#3E2519] max-w-md mx-auto space-y-3">
              <div className="p-3 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] w-fit mx-auto">
                <HugeiconsIcon icon={Comment01Icon} size={28} />
              </div>
              <p className="font-heading font-bold text-base text-cream">No published reviews yet</p>
              <p className="text-xs text-cream/60 leading-relaxed">
                Be the first to share your experience enjoying coffee and hospitality at RadhaCafe.
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

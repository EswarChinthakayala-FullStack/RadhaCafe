import { WriteReviewDialog } from '../landing/WriteReviewDialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon } from '@hugeicons/core-free-icons';

interface ReviewsHeaderProps {
  totalReviews?: number;
  averageRating?: number;
  reviews?: any[];
}

export function ReviewsHeader(_props: ReviewsHeaderProps) {
  return (
    <section className="bg-gradient-to-b from-[#1C100B] via-[#140A06] to-[#140A06] pt-24 pb-12 border-b border-[#2C1810] relative overflow-hidden">
      {/* Warm Ambient Glow Spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-6xl mx-auto relative z-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-bold uppercase tracking-widest">
              <HugeiconsIcon icon={Comment01Icon} size={14} />
              <span>GUEST REVIEWS</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cream leading-[1.08] tracking-tight">
              What our guests{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                are saying
              </span>
            </h1>

            <p className="text-xs sm:text-base text-[#EAD5C3]/80 leading-relaxed font-normal">
              Real experiences shared by visitors to RadhaCafe. Every review helps us craft better brews, meals, and hospitality in Tallur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <WriteReviewDialog />
          </div>
        </div>
      </div>
    </section>
  );
}

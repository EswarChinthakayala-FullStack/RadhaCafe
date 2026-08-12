import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicReviews } from '../../lib/supabase/queries/discussion';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { ReviewsHeader } from '../../components/reviews/ReviewsHeader';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { ReviewSkeleton } from '../../components/reviews/ReviewSkeleton';
import { ReviewErrorState } from '../../components/reviews/ReviewErrorState';
import { ReviewEmptyState } from '../../components/reviews/ReviewEmptyState';
import { WriteReviewDialog } from '../../components/landing/WriteReviewDialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, Comment01Icon } from '@hugeicons/core-free-icons';

export function PublicDiscussionPage() {
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  const { data: reviews, isLoading, isError, refetch } = useQuery({
    queryKey: ['discussions', 'public'],
    queryFn: fetchPublicReviews,
  });

  // Derived filtered reviews list
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (selectedRating === 'all') return reviews;
    return reviews.filter((r) => Math.round(r.rating || 5) === selectedRating);
  }, [reviews, selectedRating]);

  // Highlight top 5-star review as featured quote
  const featuredReview = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    return reviews.find((r) => r.rating === 5) || null;
  }, [reviews]);

  // Remaining list after excluding featured review if showing all
  const displayGridReviews = useMemo(() => {
    if (selectedRating !== 'all' || !featuredReview) return filteredReviews;
    return filteredReviews.filter((r) => r.id !== featuredReview.id);
  }, [filteredReviews, featuredReview, selectedRating]);

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Editorial Header & Rating Breakdown Summary */}
      <ReviewsHeader reviews={reviews} />

      {/* Main Reviews Experience */}
      <main id="all-reviews" className="flex-1 py-16 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-12">
          {/* Section Header & Rating Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
                Guest Stories & Feedback
              </h2>
              <p className="text-xs sm:text-sm text-cream/65 mt-1">
                Real experiences shared by customers at RadhaCafe.
              </p>
            </div>

            {/* Filter Tabs */}
            {reviews && reviews.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-1.5 bg-[#1D100A] p-1.5 rounded-full border border-[#2C1810]"
                role="tablist"
                aria-label="Filter reviews by rating"
              >
                <button
                  onClick={() => setSelectedRating('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedRating === 'all'
                    ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                    : 'text-cream/70 hover:text-cream hover:bg-white/5'
                    }`}
                >
                  All ({reviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => Math.round(r.rating || 5) === star).length;
                  if (count === 0 && selectedRating !== star) return null;
                  return (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${selectedRating === star
                        ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                        : 'text-cream/70 hover:text-cream hover:bg-white/5'
                        }`}
                    >
                      <span>{star}</span>
                      <HugeiconsIcon icon={StarIcon} size={11} className="fill-current" />
                      <span className="opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <ReviewSkeleton count={6} />
          ) : isError ? (
            <ReviewErrorState onRetry={() => refetch()} />
          ) : !reviews || reviews.length === 0 ? (
            <ReviewEmptyState />
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center bg-[#1D100A] rounded-md border border-dashed border-[#2C1810] max-w-md mx-auto space-y-3">
              <HugeiconsIcon icon={Comment01Icon} size={32} className="mx-auto text-[#E5A88B]/50" />
              <p className="text-sm font-bold text-cream">No reviews match this rating</p>
              <p className="text-xs text-cream/60">Try selecting another filter or view all reviews.</p>
              <button
                onClick={() => setSelectedRating('all')}
                className="mt-2 text-xs font-bold text-[#E5A88B] hover:underline"
              >
                Show All Reviews
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured Testimonial Hero Card (when viewing All Reviews) */}
              {selectedRating === 'all' && featuredReview && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E5A88B] animate-pulse" />
                    <span className="text-xs font-bold text-[#E5A88B] uppercase tracking-wider">
                      Featured Guest Story
                    </span>
                  </div>
                  <ReviewCard
                    customerName={featuredReview.customer_name}
                    message={featuredReview.message}
                    rating={featuredReview.rating || 5}
                    createdAt={featuredReview.created_at}
                    isFeatured
                  />
                </div>
              )}

              {/* Reviews Grid */}
              {displayGridReviews.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayGridReviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      id={r.id}
                      customerName={r.customer_name}
                      message={r.message}
                      rating={r.rating || 5}
                      createdAt={r.created_at}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Share Your Experience CTA Banner */}
          <div className="mt-16 bg-[#1D100A] border border-[#2C1810] rounded-md p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={Comment01Icon} size={24} />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-cream">
                Enjoyed Your Time at RadhaCafe?
              </h3>
              <p className="text-xs sm:text-sm text-cream/70 leading-relaxed">
                We would love to hear from you. Share your coffee & dining experience with our community.
              </p>
            </div>
            <div className="pt-2">
              <WriteReviewDialog />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

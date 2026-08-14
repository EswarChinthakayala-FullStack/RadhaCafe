import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublicReviewSummary, usePublicReviews, useToggleReviewHelpful } from '../../hooks/useDiscussions';
import { getAnonymousSessionId } from '../../lib/utils/reviewSession';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { ReviewsHeader } from '../../components/reviews/ReviewsHeader';
import { ReviewSummaryCard } from '../../components/reviews/ReviewSummaryCard';
import { ReviewToolbar } from '../../components/reviews/ReviewToolbar';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { ReviewSkeleton } from '../../components/reviews/ReviewSkeleton';
import { ReviewEmptyState } from '../../components/reviews/ReviewEmptyState';
import { WriteReviewDialog } from '../../components/landing/WriteReviewDialog';
import { Button } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  ArrowDown01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import type { ReviewSortOption, DiscussionReview } from '../../lib/supabase/queries/discussion';

export function PublicReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const initialRating = searchParams.get('rating');
  const initialSort = (searchParams.get('sort') as ReviewSortOption) || 'relevant';
  const initialSearch = searchParams.get('search') || '';

  const [selectedRating, setSelectedRating] = useState<number | 'all'>(
    initialRating && !isNaN(Number(initialRating)) ? Number(initialRating) : 'all'
  );
  const [sort, setSort] = useState<ReviewSortOption>(initialSort);
  const [search, setSearch] = useState<string>(initialSearch);
  const [hasResponseOnly, setHasResponseOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [accumulatedItems, setAccumulatedItems] = useState<DiscussionReview[]>([]);

  const sessionId = useMemo(() => getAnonymousSessionId(), []);

  // Sync state changes to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedRating !== 'all') params.set('rating', String(selectedRating));
    if (sort !== 'relevant') params.set('sort', sort);
    if (search.trim()) params.set('search', search.trim());
    setSearchParams(params, { replace: true });
  }, [selectedRating, sort, search, setSearchParams]);

  // Fetch summary aggregation
  const { data: summary, isLoading: isSummaryLoading } = usePublicReviewSummary();

  // Fetch paginated reviews
  const queryParams = useMemo(
    () => ({
      search,
      rating: selectedRating,
      hasResponseOnly,
      sort,
      page,
      pageSize: 9,
      sessionId,
    }),
    [search, selectedRating, hasResponseOnly, sort, page, sessionId]
  );

  const { data: reviewsData, isLoading: isListLoading, isFetching } = usePublicReviews(queryParams);
  const toggleHelpfulMutation = useToggleReviewHelpful();

  // Reset pagination when filters or sort change
  const handleFilterChange = (newRating: number | 'all') => {
    setSelectedRating(newRating);
    setPage(1);
    setAccumulatedItems([]);
  };

  const handleSortChange = (newSort: ReviewSortOption) => {
    setSort(newSort);
    setPage(1);
    setAccumulatedItems([]);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
    setAccumulatedItems([]);
  };

  const handleToggleResponseOnly = (val: boolean) => {
    setHasResponseOnly(val);
    setPage(1);
    setAccumulatedItems([]);
  };

  // Display items: on page 1, immediately use reviewsData?.items (no delay or stale state flash)
  const displayItems = useMemo(() => {
    if (page === 1) {
      return reviewsData?.items || [];
    }
    return accumulatedItems.length > 0 ? accumulatedItems : (reviewsData?.items || []);
  }, [page, reviewsData?.items, accumulatedItems]);

  // Accumulate pages when page > 1 (for "Load More" browsing)
  useEffect(() => {
    if (reviewsData?.items) {
      if (page === 1) {
        setAccumulatedItems(reviewsData.items);
      } else {
        setAccumulatedItems((prev) => {
          const base = prev.length > 0 ? prev : (page === 1 ? reviewsData.items : []);
          const existingIds = new Set(base.map((i) => i.id));
          const newUnique = reviewsData.items.filter((i) => !existingIds.has(i.id));
          return [...base, ...newUnique];
        });
      }
    }
  }, [reviewsData?.items, page]);

  const handleLoadMore = () => {
    if (reviewsData?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleToggleHelpful = (reviewId: string) => {
    toggleHelpfulMutation.mutate({ reviewId, sessionId });
  };

  const userVotedSet = useMemo(() => {
    return new Set(reviewsData?.userVotedIds || []);
  }, [reviewsData?.userVotedIds]);

  const totalFiltered = reviewsData?.totalCount ?? 0;
  const isInitialLoading = isListLoading || (isFetching && page === 1 && !reviewsData);

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Editorial Header */}
      <ReviewsHeader
        totalReviews={summary?.total_reviews}
        averageRating={summary?.average_rating}
      />

      {/* Main Reviews Experience */}
      <main id="all-reviews" className="flex-1 py-12 sm:py-16 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* ── Left/Main Column: Toolbar & Review Feed (8 Cols) ── */}
            <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
              {/* Search, Filter Pills & Sort Toolbar */}
              <ReviewToolbar
                search={search}
                onSearchChange={handleSearchChange}
                selectedRating={selectedRating}
                onSelectRating={handleFilterChange}
                hasResponseOnly={hasResponseOnly}
                onToggleResponseOnly={handleToggleResponseOnly}
                sort={sort}
                onSortChange={handleSortChange}
                totalFilteredCount={totalFiltered}
                totalAllCount={summary?.total_reviews}
              />

              {/* Review Feed Content */}
              {isInitialLoading ? (
                <ReviewSkeleton count={6} />
              ) : displayItems.length === 0 ? (
                search || selectedRating !== 'all' || hasResponseOnly ? (
                  <div className="p-12 text-center bg-[#1D100A] rounded-2xl border border-dashed border-[#3E2519] space-y-3">
                    <HugeiconsIcon icon={Comment01Icon} size={32} className="mx-auto text-[#E5A88B]/50" />
                    <h3 className="text-base font-bold text-cream">No reviews match your filter</h3>
                    <p className="text-xs text-[#EAD5C3]/70 max-w-sm mx-auto">
                      Try searching with different terms or reset your active filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSelectedRating('all');
                        setHasResponseOnly(false);
                        setSort('relevant');
                        setPage(1);
                      }}
                      className="mt-2 text-xs font-bold text-[#E5A88B] hover:underline cursor-pointer"
                    >
                      Show All Reviews
                    </button>
                  </div>
                ) : (
                  <ReviewEmptyState />
                )
              ) : (
                <div className="space-y-6">
                  {/* Reviews Grid */}
                  <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                    {displayItems.map((r) => (
                      <ReviewCard
                        key={r.id}
                        id={r.id}
                        customerName={r.customer_name}
                        message={r.message}
                        rating={r.rating || 5}
                        createdAt={r.created_at}
                        adminReply={r.admin_reply}
                        adminRepliedAt={r.admin_replied_at}
                        helpfulCount={r.helpful_count || 0}
                        isUserHelpful={userVotedSet.has(r.id)}
                        onToggleHelpful={handleToggleHelpful}
                      />
                    ))}
                  </div>

                  {/* Load More Button / End of Results */}
                  <div className="pt-6 flex justify-center">
                    {reviewsData?.hasMore ? (
                      <Button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        className="bg-[#1D100A] hover:bg-[#B85C1E] text-cream hover:text-white border border-[#3E2519] px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isFetching ? (
                          <>
                            <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin text-[#E5A88B]" />
                            <span>Loading more reviews...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Reviews</span>
                            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                          </>
                        )}
                      </Button>
                    ) : displayItems.length > 0 ? (
                      <p className="text-[11px] text-cream/40 font-mono italic">
                        You've reached the end of all {totalFiltered} approved reviews.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Sticky Summary & Rating Breakdown (4 Cols) ── */}
            <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24 space-y-6">
              <ReviewSummaryCard
                summary={summary}
                isLoading={isSummaryLoading}
                selectedRating={selectedRating}
                onSelectRating={handleFilterChange}
              />
            </div>
          </div>

          {/* Bottom Share Your Experience CTA Banner */}
          <div className="mt-16 bg-[#1D100A] border border-[#3E2519] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto border border-[#E5A88B]/20">
              <HugeiconsIcon icon={Comment01Icon} size={24} />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-cream">
                Enjoyed Your Time at RadhaCafe?
              </h3>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                We would love to hear from you. Share your coffee & dining experience with our community in Tallur.
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

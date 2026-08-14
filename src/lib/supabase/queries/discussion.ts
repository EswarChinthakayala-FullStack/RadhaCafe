import { supabase } from '../client';

export interface DiscussionReview {
  id: string;
  customer_name: string;
  rating: number;
  message: string;
  is_approved: boolean;
  admin_reply?: string | null;
  admin_replied_at?: string | null;
  helpful_count?: number;
  created_at: string;
}

export interface PublicReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_5_count: number;
  rating_4_count: number;
  rating_3_count: number;
  rating_2_count: number;
  rating_1_count: number;
}

export type ReviewSortOption = 'relevant' | 'newest' | 'highest' | 'lowest' | 'helpful';

export interface PublicReviewQueryParams {
  search?: string;
  rating?: number | 'all';
  hasResponseOnly?: boolean;
  sort?: ReviewSortOption;
  page?: number;
  pageSize?: number;
  sessionId?: string;
}

export interface PublicReviewsResponse {
  items: DiscussionReview[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  userVotedIds: string[];
}

/**
 * Fetch public aggregated review summary (Total count, average rating, 5-to-1 distribution)
 */
export async function fetchPublicReviewSummary(): Promise<PublicReviewSummary> {
  // 1. Try Supabase aggregation RPC first
  try {
    const { data, error } = await supabase.rpc('get_public_review_summary');
    if (!error && data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        total_reviews: Number(parsed.total_reviews) || 0,
        average_rating: Number(parsed.average_rating) || 5.0,
        rating_5_count: Number(parsed.rating_5_count) || 0,
        rating_4_count: Number(parsed.rating_4_count) || 0,
        rating_3_count: Number(parsed.rating_3_count) || 0,
        rating_2_count: Number(parsed.rating_2_count) || 0,
        rating_1_count: Number(parsed.rating_1_count) || 0,
      };
    }
  } catch {
    // Fall back to client calculation if RPC is not yet migrated
  }

  // Fallback: Compute directly from approved reviews
  const { data, error } = await (supabase as any)
    .from('discussions')
    .select('rating')
    .eq('is_approved', true);

  if (error) throw new Error(error.message);

  const reviews = data || [];
  const total_reviews = reviews.length;
  if (total_reviews === 0) {
    return {
      total_reviews: 0,
      average_rating: 5.0,
      rating_5_count: 0,
      rating_4_count: 0,
      rating_3_count: 0,
      rating_2_count: 0,
      rating_1_count: 0,
    };
  }

  let sum = 0;
  let r5 = 0, r4 = 0, r3 = 0, r2 = 0, r1 = 0;

  for (const r of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    sum += rating;
    if (rating === 5) r5++;
    else if (rating === 4) r4++;
    else if (rating === 3) r3++;
    else if (rating === 2) r2++;
    else if (rating === 1) r1++;
  }

  return {
    total_reviews,
    average_rating: Number((sum / total_reviews).toFixed(1)),
    rating_5_count: r5,
    rating_4_count: r4,
    rating_3_count: r3,
    rating_2_count: r2,
    rating_1_count: r1,
  };
}

/**
 * Transparent, sentiment-neutral relevance scoring algorithm:
 * - Helpful score (max 40 pts)
 * - Recency weight (max 30 pts)
 * - Content quality/length completeness (max 20 pts)
 * - Owner response presence (max 10 pts)
 * Strict requirement: NO artificial positive rating bias!
 */
function calculateRelevanceScore(item: DiscussionReview): number {
  const now = Date.now();
  const created = new Date(item.created_at || now).getTime();
  const daysOld = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));

  // 1. Helpful weight (0 to 40)
  const helpfulCount = item.helpful_count || 0;
  const helpfulScore = Math.min(helpfulCount * 8, 40);

  // 2. Recency weight (0 to 30)
  let recencyScore = 5;
  if (daysOld <= 30) recencyScore = 30;
  else if (daysOld <= 90) recencyScore = 20;
  else if (daysOld <= 180) recencyScore = 12;

  // 3. Content completeness / useful length (0 to 20)
  const msgLength = (item.message || '').trim().length;
  let contentScore = 5;
  if (msgLength >= 120) contentScore = 20;
  else if (msgLength >= 60) contentScore = 14;
  else if (msgLength >= 25) contentScore = 8;

  // 4. Owner response presence (0 to 10)
  const responseScore = item.admin_reply ? 10 : 0;

  return helpfulScore + recencyScore + contentScore + responseScore;
}

/**
 * Fetch public reviews list with server-side filtering, sorting, and pagination
 */
export async function fetchPublicReviewsList({
  search = '',
  rating = 'all',
  hasResponseOnly = false,
  sort = 'relevant',
  page = 1,
  pageSize = 12,
  sessionId,
}: PublicReviewQueryParams): Promise<PublicReviewsResponse> {
  let query = (supabase as any)
    .from('discussions')
    .select('*', { count: 'exact' })
    .eq('is_approved', true);

  // Rating filter
  if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
    query = query.eq('rating', rating);
  }

  // Search filter
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    query = query.or(`customer_name.ilike.%${trimmedSearch}%,message.ilike.%${trimmedSearch}%`);
  }

  // Has owner response filter
  if (hasResponseOnly) {
    query = query.not('admin_reply', 'is', null);
  }

  // Sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'highest') {
    query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'lowest') {
    query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
  } else if (sort === 'helpful') {
    query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    // 'relevant': Default database ordering by created_at desc; custom rank evaluated below
    query = query.order('created_at', { ascending: false });
  }

  // If relevant sort, we retrieve up to 100 matching items to rank with the multi-factor relevance algorithm
  if (sort === 'relevant') {
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const allItems: DiscussionReview[] = data || [];
    // Sort by deterministic sentiment-neutral relevance score
    allItems.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a);
      const scoreB = calculateRelevanceScore(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalCount = count || allItems.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = allItems.slice(start, end);
    const hasMore = end < allItems.length;

    // Fetch user voted IDs for the current session
    let userVotedIds: string[] = [];
    if (sessionId && pagedItems.length > 0) {
      userVotedIds = await fetchUserVotedReviewIds(pagedItems.map((p) => p.id), sessionId);
    }

    return {
      items: pagedItems,
      totalCount,
      hasMore,
      page,
      userVotedIds,
    };
  }

  // Standard database offset pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const items: DiscussionReview[] = data || [];
  const totalCount = count || 0;
  const hasMore = start + items.length < totalCount;

  // Fetch user voted IDs for the current session
  let userVotedIds: string[] = [];
  if (sessionId && items.length > 0) {
    userVotedIds = await fetchUserVotedReviewIds(items.map((p) => p.id), sessionId);
  }

  return {
    items,
    totalCount,
    hasMore,
    page,
    userVotedIds,
  };
}

/**
 * Fetch reviews voted helpful by a given anonymous session
 */
export async function fetchUserVotedReviewIds(
  reviewIds: string[],
  sessionId: string
): Promise<string[]> {
  if (!sessionId || reviewIds.length === 0) return [];

  try {
    const { data, error } = await (supabase as any)
      .from('review_helpful_votes')
      .select('review_id')
      .eq('anonymous_session_id', sessionId)
      .in('review_id', reviewIds);

    if (error || !data) return [];
    return data.map((d: any) => d.review_id);
  } catch {
    return [];
  }
}

/**
 * Toggle Helpful Vote (Atomic duplicate-safe action)
 */
export async function toggleReviewHelpfulVote(
  reviewId: string,
  sessionId: string
): Promise<{ review_id: string; helpful_count: number; is_helpful: boolean }> {
  // 1. Try atomic RPC
  try {
    const { data, error } = await (supabase as any).rpc('toggle_review_helpful', {
      p_review_id: reviewId,
      p_session_id: sessionId,
    });

    if (!error && data) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed;
    }
  } catch {
    // Fall back to table mutation if RPC is pending
  }

  // Fallback direct mutation
  const { data: existingVote } = await (supabase as any)
    .from('review_helpful_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('anonymous_session_id', sessionId)
    .maybeSingle();

  if (existingVote) {
    await (supabase as any)
      .from('review_helpful_votes')
      .delete()
      .eq('id', existingVote.id);

    const { data: current } = await (supabase as any)
      .from('discussions')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    const newCount = Math.max(0, (current?.helpful_count || 1) - 1);
    await (supabase as any)
      .from('discussions')
      .update({ helpful_count: newCount })
      .eq('id', reviewId);

    return { review_id: reviewId, helpful_count: newCount, is_helpful: false };
  } else {
    await (supabase as any)
      .from('review_helpful_votes')
      .insert([{ review_id: reviewId, anonymous_session_id: sessionId }]);

    const { data: current } = await (supabase as any)
      .from('discussions')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    const newCount = (current?.helpful_count || 0) + 1;
    await (supabase as any)
      .from('discussions')
      .update({ helpful_count: newCount })
      .eq('id', reviewId);

    return { review_id: reviewId, helpful_count: newCount, is_helpful: true };
  }
}

/**
 * Submit a new public review (Strictly sets is_approved = false)
 */
export async function submitPublicReview(input: {
  customer_name: string;
  rating: number;
  message: string;
}): Promise<void> {
  const { error } = await (supabase as any)
    .from('discussions')
    .insert([
      {
        customer_name: input.customer_name.trim(),
        rating: Math.min(5, Math.max(1, Math.round(input.rating))),
        message: input.message.trim(),
        is_approved: false,
      },
    ]);

  if (error) throw new Error(error.message);
}

/**
 * Admin: Reply to a customer review
 */
export async function adminReplyToReview(
  reviewId: string,
  reply: string
): Promise<void> {
  const trimmed = reply.trim();
  const { error } = await (supabase as any)
    .from('discussions')
    .update({
      admin_reply: trimmed || null,
      admin_replied_at: trimmed ? new Date().toISOString() : null,
    })
    .eq('id', reviewId);

  if (error) throw new Error(error.message);
}

/**
 * Admin: Delete a reply from a review
 */
export async function adminDeleteReviewReply(reviewId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('discussions')
    .update({
      admin_reply: null,
      admin_replied_at: null,
    })
    .eq('id', reviewId);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Compatibility Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPublicReviews(): Promise<DiscussionReview[]> {
  const { data, error } = await (supabase as any)
    .from('discussions')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DiscussionReview[]) || [];
}

export async function fetchAllReviews(): Promise<DiscussionReview[]> {
  const { data, error } = await (supabase as any)
    .from('discussions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DiscussionReview[]) || [];
}

export async function submitReview(input: {
  customer_name: string;
  rating: number;
  message: string;
}): Promise<void> {
  return submitPublicReview(input);
}

export async function approveReview(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('discussions')
    .update({ is_approved: true })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await (supabase as any).from('discussions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

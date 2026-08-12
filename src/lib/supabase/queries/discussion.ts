import { supabase } from '../client';

export interface DiscussionReview {
  id: string;
  customer_name: string;
  rating: number;
  message: string;
  is_approved: boolean;
  created_at: string;
}

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
  // Do NOT chain .select() because unapproved reviews (is_approved = false)
  // are restricted from SELECT for unauthenticated public users by RLS.
  const { error } = await (supabase as any)
    .from('discussions')
    .insert([{ ...input, is_approved: false }]);

  if (error) throw new Error(error.message);
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

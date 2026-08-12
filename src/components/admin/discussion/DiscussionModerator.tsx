import { useState, useEffect } from 'react';
import { useDiscussions, useApproveDiscussion, useDeleteDiscussion } from '../../../hooks/useDiscussions';
import { formatDate } from '../../../lib/utils/formatDate';
import { Loader } from '../../shared/Loader';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { supabase } from '../../../lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Search01Icon,
  Comment01Icon,
  Cancel01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

export function DiscussionModerator() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading, isError } = useDiscussions(true);
  const approveMutation = useApproveDiscussion();
  const deleteMutation = useDeleteDiscussion();

  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [deletingReview, setDeletingReview] = useState<DiscussionReview | null>(null);

  // Single lifecycle-controlled Realtime subscription to refresh discussions queue upon public user submission
  useEffect(() => {
    const channel = supabase
      .channel('discussions-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'discussions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['discussions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) return <Loader label="Loading customer reviews moderation queue..." />;

  if (isError) {
    return (
      <Card className="border-border/80 bg-card p-6 text-center text-xs text-destructive">
        Unable to load customer reviews moderation queue. Please try refreshing.
      </Card>
    );
  }

  const allReviews = reviews || [];
  const pendingCount = allReviews.filter((r) => !r.is_approved).length;
  const approvedCount = allReviews.filter((r) => r.is_approved).length;

  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0';

  const filteredReviews = allReviews.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !r.is_approved) ||
      (statusFilter === 'approved' && r.is_approved);

    const matchesRating =
      ratingFilter === 'all' || r.rating === parseInt(ratingFilter, 10);

    const matchesSearch =
      !search.trim() ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.message.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesRating && matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    await deleteMutation.mutateAsync(deletingReview.id);
    setDeletingReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Moderation Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 font-heading mt-0.5">{pendingCount}</h3>
            </div>
            <Badge variant="outline" className="text-amber-700 border-amber-500/30 bg-amber-500/10 text-[10px] hidden sm:inline-flex">
              Needs Review
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-heading mt-0.5">{approvedCount}</h3>
            </div>
            <Badge variant="outline" className="text-emerald-700 border-emerald-500/30 bg-emerald-500/10 text-[10px] hidden sm:inline-flex">
              Live on Site
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-cinnamon font-heading mt-0.5 flex items-center gap-1">
                <span>{avgRating}</span>
                <HugeiconsIcon icon={StarIcon} size={16} className="fill-amber-500 text-amber-500 inline" />
              </h3>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-border text-[10px] hidden sm:inline-flex">
              Out of 5.0
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs rounded-md">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Reviews</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground font-heading mt-0.5">{allReviews.length}</h3>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-border text-[10px] hidden sm:inline-flex">
              All Time
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="p-4 rounded-md border border-border/80 bg-card space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              className={`h-9 px-3.5 rounded-md text-xs font-semibold shadow-xs ${statusFilter === 'pending' ? 'bg-cinnamon text-white border-cinnamon' : 'border-border/80 bg-background'
                }`}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('approved')}
              className={`h-9 px-3.5 rounded-md text-xs font-semibold shadow-xs ${statusFilter === 'approved' ? 'bg-cinnamon text-white border-cinnamon' : 'border-border/80 bg-background'
                }`}
            >
              Approved ({approvedCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={`h-9 px-3.5 rounded-md text-xs font-semibold shadow-xs ${statusFilter === 'all' ? 'bg-cinnamon text-white border-cinnamon' : 'border-border/80 bg-background'
                }`}
            >
              All Reviews ({allReviews.length})
            </Button>
          </div>

          {/* Rating Filter & Search */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val || 'all')}>
              <SelectTrigger size="default" className="!h-9 w-36 text-xs rounded-md border-border/80 bg-background font-medium px-3 shadow-xs">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
                <HugeiconsIcon icon={Search01Icon} size={14} />
              </div>
              <Input
                placeholder="Search reviewer or text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!h-9 pl-8 text-xs bg-background rounded-md border-border/80 shadow-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Moderation Table (md:block) */}
      <div className="hidden md:block border border-border/80 rounded-md overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase border-b border-border">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Review Message</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center font-bold text-xs shrink-0">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <span>{review.customer_name}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <HugeiconsIcon
                            key={i}
                            icon={StarIcon}
                            size={13}
                            className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <p className="text-foreground leading-relaxed font-normal">{review.message}</p>
                    </td>
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">{formatDate(review.created_at)}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={review.is_approved ? 'default' : 'outline'}
                        className={`text-[10px] font-bold rounded-lg ${review.is_approved
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'text-amber-700 border-amber-500/40 bg-amber-500/10'
                          }`}
                      >
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      {!review.is_approved && (
                        <Button
                          size="xs"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(review.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs rounded-md shadow-xs"
                        >
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                          <span>Approve</span>
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 gap-1 text-xs rounded-md"
                        onClick={() => setDeletingReview(review)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={13} />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground italic">
                    <HugeiconsIcon icon={Comment01Icon} size={32} className="mx-auto mb-2 text-muted-foreground/40" />
                    No customer reviews found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Moderation Stack Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="border-border/80 bg-card rounded-md shadow-xs p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center font-bold text-xs shrink-0">
                    <HugeiconsIcon icon={UserIcon} size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs">{review.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                <Badge
                  variant={review.is_approved ? 'default' : 'outline'}
                  className={`text-[10px] font-bold rounded-lg ${review.is_approved
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'text-amber-700 border-amber-500/40 bg-amber-500/10'
                    }`}
                >
                  {review.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={13}
                    className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
                  />
                ))}
                <span className="text-[11px] font-bold text-foreground ml-1.5">{review.rating}.0</span>
              </div>

              <p className="text-xs text-foreground leading-relaxed bg-secondary/20 p-2.5 rounded-md border border-border/40">
                "{review.message}"
              </p>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                {!review.is_approved && (
                  <Button
                    size="xs"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(review.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs rounded-md shadow-xs flex-1 justify-center"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                    <span>Approve Review</span>
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 text-xs rounded-md"
                  onClick={() => setDeletingReview(review)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-border/80 rounded-md bg-card text-muted-foreground italic text-xs">
            <HugeiconsIcon icon={Comment01Icon} size={28} className="mx-auto mb-2 text-muted-foreground/40" />
            No customer reviews found matching the selected filter.
          </div>
        )}
      </div>

      {/* Delete Review Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent className="bg-card rounded-md p-6">
          <AlertDialogHeader className="p-0 border-b border-border/60 pb-3">
            <AlertDialogTitle className="text-base font-bold font-heading">
              Delete Review from "{deletingReview?.customer_name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action will permanently remove the customer review submission from RadhaCafe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel className="text-xs rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-md">
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { formatDate } from '../../../lib/utils/formatDate';
import { ReviewCard } from '../../reviews/ReviewCard';
import {
  useApproveDiscussion,
  useUnpublishDiscussion,
  useAdminReplyReview,
  useAdminDeleteReply,
} from '../../../hooks/useDiscussions';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Message01Icon,
  ThumbsUpIcon,
  Coffee02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  EyeIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

const replySchema = z.object({
  reply: z
    .string()
    .trim()
    .min(1, 'Please enter a reply text.')
    .max(1000, 'Reply cannot exceed 1000 characters.'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReviewDetailsDialogProps {
  review: DiscussionReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteRequest: (review: DiscussionReview) => void;
  onStatusChange?: (updatedReview: DiscussionReview) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ReviewDetailsDialog({
  review,
  open,
  onOpenChange,
  onDeleteRequest,
  onStatusChange,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
}: ReviewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');
  const [currentReview, setCurrentReview] = useState<DiscussionReview | null>(review);

  const approveMutation = useApproveDiscussion();
  const unpublishMutation = useUnpublishDiscussion();
  const replyMutation = useAdminReplyReview();
  const deleteReplyMutation = useAdminDeleteReply();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply: '',
    },
  });

  const replyText = watch('reply') || '';

  // Synchronize local review state whenever prop changes
  useEffect(() => {
    if (review) {
      setCurrentReview(review);
      reset({
        reply: review.admin_reply || '',
      });
      if (open) {
        setActiveTab('details');
      }
    }
  }, [review, open, reset]);

  if (!currentReview) return null;

  const isApproved = currentReview.is_approved;
  const hasReply = Boolean(currentReview.admin_reply);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(currentReview.id);
      const updated = { ...currentReview, is_approved: true };
      setCurrentReview(updated);
      if (onStatusChange) onStatusChange(updated);

      toast.add({
        title: 'Review Approved',
        description: 'This review is now published and live on the website.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Approval Failed',
        description: err?.message || 'Unable to approve review.',
        type: 'error',
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync(currentReview.id);
      const updated = { ...currentReview, is_approved: false };
      setCurrentReview(updated);
      if (onStatusChange) onStatusChange(updated);

      toast.add({
        title: 'Review Unpublished',
        description: 'This review has been moved back to pending moderation.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unpublish Failed',
        description: err?.message || 'Unable to unpublish review.',
        type: 'error',
      });
    }
  };

  const onSubmitReply = async (data: ReplyFormData) => {
    try {
      const trimmed = data.reply.trim();
      await replyMutation.mutateAsync({
        reviewId: currentReview.id,
        reply: trimmed,
      });

      const updated = {
        ...currentReview,
        admin_reply: trimmed,
        admin_replied_at: new Date().toISOString(),
      };
      setCurrentReview(updated);
      if (onStatusChange) onStatusChange(updated);

      toast.add({
        title: 'Response Saved',
        description: 'Official RadhaCafe response updated successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Save Response',
        description: err?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  const handleDeleteReply = async () => {
    try {
      await deleteReplyMutation.mutateAsync(currentReview.id);
      reset({ reply: '' });
      const updated = {
        ...currentReview,
        admin_reply: null,
        admin_replied_at: null,
      };
      setCurrentReview(updated);
      if (onStatusChange) onStatusChange(updated);

      toast.add({
        title: 'Response Removed',
        description: 'Official response removed from this review.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Remove Response',
        description: err?.message || 'Unable to remove reply.',
        type: 'error',
      });
    }
  };

  const isPending =
    approveMutation.isPending ||
    unpublishMutation.isPending ||
    replyMutation.isPending ||
    deleteReplyMutation.isPending ||
    isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col bg-card border-border/80 p-0 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <DialogHeader className="p-4 sm:p-5 pr-12 border-b border-border/80 bg-secondary/30 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Customer Information */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-border bg-cinnamon/15 text-cinnamon font-bold shadow-2xs shrink-0">
                <AvatarFallback>{currentReview.customer_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground truncate">
                    {currentReview.customer_name}
                  </DialogTitle>

                  <Badge
                    variant={isApproved ? 'default' : 'outline'}
                    className={`text-[10px] font-bold rounded-md px-2 py-0.5 shrink-0 ${
                      isApproved
                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                        : 'text-amber-700 border-amber-500/40 bg-amber-500/10'
                    }`}
                  >
                    {isApproved ? 'Published' : 'Pending Moderation'}
                  </Badge>
                </div>

                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>{formatDate(currentReview.created_at)}</span>
                  {currentReview.helpful_count && currentReview.helpful_count > 0 ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <HugeiconsIcon icon={ThumbsUpIcon} size={11} />
                      <span>{currentReview.helpful_count} found helpful</span>
                    </span>
                  ) : null}
                </DialogDescription>
              </div>
            </div>

            {/* Previous / Next Navigation Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {onNavigatePrev && (
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!hasPrev}
                  onClick={onNavigatePrev}
                  className="h-8 w-8 rounded-lg border-border/80 bg-background"
                  title="Previous review"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                </Button>
              )}
              {onNavigateNext && (
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!hasNext}
                  onClick={onNavigateNext}
                  className="h-8 w-8 rounded-lg border-border/80 bg-background"
                  title="Next review"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Star Rating Display */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={15}
                  className={i < currentReview.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">{currentReview.rating} out of 5 stars</span>
          </div>
        </DialogHeader>

        {/* Tabs for Details vs Public Preview */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-2 bg-secondary/60 h-9 p-1 rounded-lg mb-4">
              <TabsTrigger value="details" className="text-xs font-semibold rounded-md gap-1.5">
                <HugeiconsIcon icon={Message01Icon} size={13} />
                <span>Review & Response</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs font-semibold rounded-md gap-1.5">
                <HugeiconsIcon icon={EyeIcon} size={13} />
                <span>Public Card Preview</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Review & Response Form */}
            <TabsContent value="details" className="space-y-4 outline-none">
              {/* Full Untruncated Customer Message */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Customer Review
                </Label>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 text-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {currentReview.message}
                </div>
              </div>

              {/* Official RadhaCafe Response Form */}
              <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cinnamon font-bold text-xs">
                    <HugeiconsIcon icon={Coffee02Icon} size={14} />
                    <span>Response from RadhaCafe</span>
                  </div>
                  {currentReview.admin_replied_at && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Last updated {formatDate(currentReview.admin_replied_at)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Textarea
                    rows={4}
                    {...register('reply')}
                    placeholder="Write an official response as RadhaCafe..."
                    className="text-xs bg-background border-border/80 text-foreground leading-relaxed resize-none rounded-xl"
                    maxLength={1000}
                  />

                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>Public response visible on website.</span>
                    <span className="font-mono">{replyText.length} / 1000</span>
                  </div>

                  {errors.reply && (
                    <p className="text-destructive text-[11px] font-semibold">
                      {errors.reply.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {hasReply ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteReply}
                      disabled={isPending}
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 rounded-lg h-8"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={13} />
                      <span>Remove Reply</span>
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-lg shadow-2xs gap-1.5 h-8 px-4"
                  >
                    {isPending ? (
                      <>
                        <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                        <span>{hasReply ? 'Update Response' : 'Publish Response'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Tab 2: Public Preview */}
            <TabsContent value="preview" className="space-y-3 outline-none">
              <p className="text-xs text-muted-foreground">
                This is how the review and RadhaCafe response currently appears to website visitors:
              </p>
              <div className="p-3 sm:p-4 rounded-xl bg-[#140A06] border border-[#3E2519]">
                <ReviewCard
                  id={currentReview.id}
                  customerName={currentReview.customer_name}
                  message={currentReview.message}
                  rating={currentReview.rating}
                  createdAt={currentReview.created_at}
                  adminReply={replyText.trim() || currentReview.admin_reply}
                  adminRepliedAt={currentReview.admin_replied_at || new Date().toISOString()}
                  helpfulCount={currentReview.helpful_count || 0}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Moderation Actions Footer (Clean Responsive Layout) */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-secondary/30 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDeleteRequest(currentReview)}
            disabled={isPending}
            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 rounded-lg h-9 w-full sm:w-auto justify-center"
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} />
            <span>Delete Review</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isApproved ? (
              <Button
                type="button"
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg gap-1.5 h-9 px-4 shadow-2xs justify-center"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                <span>{isPending ? 'Approving...' : 'Approve & Publish'}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
                disabled={isPending}
                className="flex-1 sm:flex-initial text-xs font-semibold text-amber-600 border-amber-500/40 hover:bg-amber-500/10 gap-1.5 rounded-lg h-9 px-4 justify-center"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
                <span>Unpublish Review</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-lg h-9 px-3 shrink-0"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

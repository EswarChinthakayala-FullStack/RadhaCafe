import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { useAdminReplyReview, useAdminDeleteReply } from '../../../hooks/useDiscussions';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  StarIcon,
  Delete02Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
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

interface AdminReplyDialogProps {
  review: DiscussionReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminReplyDialog({
  review,
  open,
  onOpenChange,
  onSuccess,
}: AdminReplyDialogProps) {
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

  useEffect(() => {
    if (review && open) {
      reset({
        reply: review.admin_reply || '',
      });
    }
  }, [review, open, reset]);

  if (!review) return null;

  const onSubmit = async (data: ReplyFormData) => {
    try {
      await replyMutation.mutateAsync({
        reviewId: review.id,
        reply: data.reply.trim(),
      });

      toast.add({
        title: 'Response Published',
        description: 'Your official response is now live under the review.',
        type: 'success',
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.add({
        title: 'Failed to Publish Response',
        description: err?.message || 'Please check your connection and try again.',
        type: 'error',
      });
    }
  };

  const handleDeleteReply = async () => {
    try {
      await deleteReplyMutation.mutateAsync(review.id);
      toast.add({
        title: 'Response Removed',
        description: 'The official response has been removed from this review.',
        type: 'success',
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.add({
        title: 'Failed to Remove Response',
        description: err?.message || 'Unable to remove reply.',
        type: 'error',
      });
    }
  };

  const isExistingReply = Boolean(review.admin_reply);
  const isPending = replyMutation.isPending || deleteReplyMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/80 p-5 sm:p-6 space-y-4 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1 text-left border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-cinnamon">
            <HugeiconsIcon icon={Coffee02Icon} size={18} />
            <DialogTitle className="font-heading text-base sm:text-lg font-bold text-foreground">
              {isExistingReply ? 'Edit Official Response' : 'Reply as RadhaCafe'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Respond officially to {review.customer_name}. Your reply will appear directly beneath the public review on RadhaCafe.
          </DialogDescription>
        </DialogHeader>

        {/* Customer Review Summary Excerpt */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 text-[10px] bg-cinnamon/15 text-cinnamon font-bold">
                <AvatarFallback>{review.customer_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-bold text-foreground">{review.customer_name}</span>
            </div>

            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={12}
                  className={i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted/40'}
                />
              ))}
            </div>
          </div>

          <p className="text-muted-foreground italic leading-relaxed text-[11px] sm:text-xs">
            &ldquo;{review.message}&rdquo;
          </p>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="admin-reply-textarea" className="font-semibold text-foreground">
              Response from RadhaCafe *
            </Label>
            <Textarea
              id="admin-reply-textarea"
              rows={4}
              {...register('reply')}
              placeholder="e.g. Thank you so much for visiting RadhaCafe! We're glad you loved our filter coffee and hot snacks. Looking forward to your next visit!"
              className="text-xs bg-background border-border/80 text-foreground leading-relaxed resize-none rounded-xl"
              maxLength={1000}
            />

            <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
              <span>This response will be visible publicly on RadhaCafe.</span>
              <span className="font-mono">{replyText.length} / 1000</span>
            </div>

            {errors.reply && (
              <p className="text-destructive text-[11px] font-semibold">{errors.reply.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between gap-2 border-t border-border/60">
            {isExistingReply ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteReply}
                disabled={isPending}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 rounded-lg h-9"
              >
                <HugeiconsIcon icon={Delete02Icon} size={13} />
                <span>Remove Reply</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-lg h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-lg shadow-xs gap-1.5 h-9 px-4"
              >
                {isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                    <span>{isExistingReply ? 'Save Changes' : 'Publish Response'}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

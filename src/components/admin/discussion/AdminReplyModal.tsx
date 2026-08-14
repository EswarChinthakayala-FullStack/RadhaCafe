import { useState, useEffect } from 'react';
import { useAdminReplyReview, useAdminDeleteReply } from '../../../hooks/useDiscussions';
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
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  StarIcon,
  Delete02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import type { DiscussionReview } from '../../../lib/supabase/queries/discussion';

interface AdminReplyModalProps {
  review: DiscussionReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminReplyModal({ review, open, onOpenChange }: AdminReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const replyMutation = useAdminReplyReview();
  const deleteReplyMutation = useAdminDeleteReply();

  useEffect(() => {
    if (review) {
      setReplyText(review.admin_reply || '');
      setErrorMsg(null);
    }
  }, [review, open]);

  if (!review) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a reply or delete the existing response.');
      return;
    }

    try {
      await replyMutation.mutateAsync({ reviewId: review.id, reply: trimmed });
      onOpenChange(false);
    } catch {
      setErrorMsg('Failed to save owner reply. Please try again.');
    }
  };

  const handleDeleteReply = async () => {
    try {
      await deleteReplyMutation.mutateAsync(review.id);
      onOpenChange(false);
    } catch {
      setErrorMsg('Failed to delete owner reply. Please try again.');
    }
  };

  const isPending = replyMutation.isPending || deleteReplyMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border p-6 space-y-4">
        <DialogHeader className="space-y-1.5 text-left border-b border-border pb-3">
          <div className="flex items-center gap-2 text-cinnamon">
            <HugeiconsIcon icon={Coffee02Icon} size={18} />
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Official RadhaCafe Response
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Respond publicly to {review.customer_name}'s review. This reply will be displayed directly on the review card.
          </DialogDescription>
        </DialogHeader>

        {/* Customer Review Summary Card */}
        <div className="p-3.5 rounded-md bg-secondary/40 border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{review.customer_name}</span>
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
          <p className="text-muted-foreground italic leading-relaxed">
            &ldquo;{review.message}&rdquo;
          </p>
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="admin-reply-input" className="font-semibold text-foreground">
              Your Response Text *
            </Label>
            <Textarea
              id="admin-reply-input"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. Thank you for your kind words! We are delighted you enjoyed our filter coffee and look forward to welcoming you again."
              className="text-xs bg-background border-border text-foreground leading-relaxed resize-none rounded-md"
              maxLength={1000}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Publicly attributed to RadhaCafe Management</span>
              <span>{replyText.length} / 1000</span>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between gap-2">
            {review.admin_reply ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteReply}
                disabled={isPending}
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 rounded-md"
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
                className="text-xs rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-md shadow-xs gap-1.5"
              >
                {isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{review.admin_reply ? 'Update Response' : 'Post Response'}</span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

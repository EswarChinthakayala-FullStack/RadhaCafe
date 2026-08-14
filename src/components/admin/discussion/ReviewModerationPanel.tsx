import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Coffee02Icon,
  Message01Icon,
  Delete02Icon,
  Edit01Icon,
  Loading03Icon,
  Shield01Icon,
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

interface ReviewModerationPanelProps {
  review: DiscussionReview;
  onApprove: () => void;
  onApproveAndReply: () => void;
  onUnpublish: () => void;
  onDeleteRequest: () => void;
  onSaveReply: (replyText: string) => Promise<void>;
  onRemoveReply: () => Promise<void>;
  isApprovePending?: boolean;
  isUnpublishPending?: boolean;
  isReplySaving?: boolean;
  isReplyRemoving?: boolean;
  isInitialReplying?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ReviewModerationPanel({
  review,
  onApprove,
  onApproveAndReply,
  onUnpublish,
  onDeleteRequest,
  onSaveReply,
  onRemoveReply,
  isApprovePending = false,
  isUnpublishPending = false,
  isReplySaving = false,
  isReplyRemoving = false,
  isInitialReplying = false,
  onDirtyChange,
}: ReviewModerationPanelProps) {
  const [isEditingReply, setIsEditingReply] = useState(isInitialReplying);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      reply: review.admin_reply || '',
    },
  });

  const replyText = watch('reply') || '';

  // Inform parent when form has unsaved text
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isEditingReply && isDirty && Boolean(replyText.trim()));
    }
  }, [isEditingReply, isDirty, replyText, onDirtyChange]);

  // Sync with review prop
  useEffect(() => {
    reset({ reply: review.admin_reply || '' });
    setIsEditingReply(isInitialReplying);
  }, [review, isInitialReplying, reset]);

  const isApproved = review.is_approved;
  const hasReply = Boolean(review.admin_reply);

  const onSubmitReplyForm = async (data: ReplyFormData) => {
    await onSaveReply(data.reply.trim());
    setIsEditingReply(false);
  };

  const handleCancelEditing = () => {
    reset({ reply: review.admin_reply || '' });
    setIsEditingReply(false);
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="p-1 rounded-md bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Shield01Icon} size={15} />
            </div>
            <CardTitle className="text-sm font-bold font-heading">Moderation & Actions</CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {isApproved ? 'Live on Site' : 'Pending'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5 text-xs">
        {/* Section 1: Moderation Actions */}
        <div className="space-y-2">
          {!isApproved ? (
            <div className="space-y-2">
              <Button
                type="button"
                size="sm"
                onClick={onApprove}
                disabled={isApprovePending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9.5 shadow-2xs gap-1.5 justify-center"
              >
                {isApprovePending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    <span>Approve & Publish</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onApproveAndReply}
                disabled={isApprovePending}
                className="w-full text-xs font-semibold border-border/80 bg-card hover:bg-secondary text-foreground rounded-xl h-9 gap-1.5 justify-center"
              >
                <HugeiconsIcon icon={Message01Icon} size={14} className="text-cinnamon" />
                <span>Approve & Write Reply</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUnpublish}
              disabled={isUnpublishPending}
              className="w-full text-xs font-semibold text-amber-600 border-amber-500/40 hover:bg-amber-500/10 rounded-xl h-9 gap-1.5 justify-center"
            >
              {isUnpublishPending ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Unpublishing...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  <span>Unpublish Review</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Section 2: RadhaCafe Official Response */}
        <div className="pt-3 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cinnamon font-bold font-heading text-xs">
              <HugeiconsIcon icon={Coffee02Icon} size={14} />
              <span>RadhaCafe Response</span>
            </div>

            {hasReply && !isEditingReply && (
              <Badge variant="outline" className="text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/10 px-1.5 py-0">
                Replied
              </Badge>
            )}
          </div>

          {/* Mode A: Active Reply Editor */}
          {isEditingReply ? (
            <form onSubmit={handleSubmit(onSubmitReplyForm)} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="admin-reply-input" className="text-xs font-semibold text-foreground">
                  Official Reply Message
                </Label>
                <Textarea
                  id="admin-reply-input"
                  rows={4}
                  {...register('reply')}
                  placeholder="Thank you for visiting RadhaCafe! We are delighted you enjoyed your visit..."
                  className="text-xs bg-background border-border/80 text-foreground leading-relaxed resize-none rounded-xl"
                  maxLength={1000}
                  autoFocus
                />

                <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
                  <span>Visible publicly on website.</span>
                  <span className="font-mono font-medium">{replyText.length} / 1000</span>
                </div>

                {errors.reply && (
                  <p className="text-destructive text-[11px] font-semibold">{errors.reply.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEditing}
                  disabled={isReplySaving}
                  className="h-8 text-xs rounded-lg"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isReplySaving || !replyText.trim()}
                  className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl shadow-2xs gap-1.5 h-8.5 px-3.5"
                >
                  {isReplySaving ? (
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
          ) : hasReply ? (
            /* Mode B: Display Existing Response */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-cinnamon/5 border border-cinnamon/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-cinnamon/15 pb-1">
                  <span>Official Reply</span>
                  {review.admin_replied_at && (
                    <span className="font-mono text-[10px]">
                      {formatDate(review.admin_replied_at)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground leading-relaxed italic whitespace-pre-wrap">
                  &ldquo;{review.admin_reply}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemoveReply}
                  disabled={isReplyRemoving}
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 rounded-lg"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                  <span>{isReplyRemoving ? 'Removing...' : 'Remove'}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingReply(true)}
                  className="h-8 text-xs font-semibold rounded-lg gap-1.5 border-border bg-card hover:bg-secondary text-foreground"
                >
                  <HugeiconsIcon icon={Edit01Icon} size={13} />
                  <span>Edit Response</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Mode C: No Response Yet */
            <div className="p-4 rounded-xl bg-secondary/30 border border-dashed border-border/80 text-center space-y-2.5">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">No official response yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Respond officially to this customer review.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditingReply(true)}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-xl shadow-2xs gap-1.5 h-8.5 px-3.5"
              >
                <HugeiconsIcon icon={Message01Icon} size={13} />
                <span>Write Response</span>
              </Button>
            </div>
          )}
        </div>

        {/* Section 3: Destructive Delete Action */}
        <div className="pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDeleteRequest}
            className="w-full h-8 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1.5 justify-center font-medium"
          >
            <HugeiconsIcon icon={Delete02Icon} size={13} />
            <span>Delete Review</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

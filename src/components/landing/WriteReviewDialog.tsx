import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitReview } from '../../lib/supabase/queries/discussion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, CheckmarkCircle02Icon, Edit02Icon } from '@hugeicons/core-free-icons';

const reviewSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface WriteReviewDialogProps {
  buttonVariant?: 'default' | 'outline' | 'secondary';
  buttonSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WriteReviewDialog({
  className,
}: WriteReviewDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
    },
  });

  const selectedRating = watch('rating');

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Unable to submit review. Please try again.');
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setErrorMsg(null);
        reset();
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className={`bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold rounded-full gap-2 shadow-md ${className}`}
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} />
            <span>Write a Review</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-[#1F120C] border-[#3E2519] p-6 space-y-4 text-[#EAD5C3]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="font-heading text-xl font-bold text-[#EAD5C3]">
            Share Your Experience
          </DialogTitle>
          <DialogDescription className="text-xs text-[#EAD5C3]/70">
            Tell us about your visit to RadhaCafe. Reviews are posted after admin moderation.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 px-4 text-center space-y-3">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} className="mx-auto text-success" />
            <h4 className="font-heading font-bold text-lg text-[#EAD5C3]">Review Submitted!</h4>
            <p className="text-xs text-[#EAD5C3]/70 leading-relaxed">
              Thank you for your feedback! Your review has been submitted and is currently awaiting administrator approval.
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="mt-3 bg-[#E5A88B] text-[#140A06] font-bold w-full rounded-full"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="dlg-name" className="font-semibold text-[#EAD5C3]">Your Full Name</Label>
              <Input
                id="dlg-name"
                placeholder="e.g. Ramesh Kumar"
                {...register('customer_name')}
                className="bg-[#140A06] border-[#3E2519] text-[#EAD5C3]"
              />
              {errors.customer_name && (
                <p className="text-destructive font-medium">{errors.customer_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[#EAD5C3]">Rating</Label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setValue('rating', star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={26}
                      className={
                        star <= selectedRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#3E2519]'
                      }
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-destructive font-medium">{errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dlg-msg" className="font-semibold text-[#EAD5C3]">Your Message / Review</Label>
              <Textarea
                id="dlg-msg"
                rows={4}
                placeholder="Tell us about the coffee, food, or service..."
                {...register('message')}
                className="bg-[#140A06] border-[#3E2519] text-[#EAD5C3]"
              />
              {errors.message && (
                <p className="text-destructive font-medium">{errors.message.message}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold rounded-full border-[#3E2519] text-[#EAD5C3] hover:bg-[#25140D]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold text-xs rounded-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

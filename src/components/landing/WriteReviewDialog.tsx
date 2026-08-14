import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitPublicReview } from '../../lib/supabase/queries/discussion';
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
import {
  StarIcon,
  CheckmarkCircle02Icon,
  Edit02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

const reviewSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  rating: z
    .number()
    .int()
    .min(1, 'Please select a rating between 1 and 5 stars')
    .max(5, 'Rating cannot exceed 5 stars'),
  message: z
    .string()
    .trim()
    .min(10, 'Review message must be at least 10 characters')
    .max(2000, 'Review message cannot exceed 2000 characters'),
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
  const [hoverRating, setHoverRating] = useState<number | null>(null);
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
    mutationFn: submitPublicReview,
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: () => {
      setErrorMsg("We couldn't submit your review right now. Please try again.");
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
        setHoverRating(null);
        reset();
      }, 300);
    }
  };

  const activeDisplayRating = hoverRating ?? selectedRating;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className={`bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold rounded-full gap-2 shadow-md cursor-pointer ${className}`}
          >
            <HugeiconsIcon icon={Edit02Icon} size={15} />
            <span>Write a Review</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-[#1F120C] border-[#3E2519] p-6 space-y-4 text-[#EAD5C3] rounded-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-cream">
            Share Your RadhaCafe Experience
          </DialogTitle>
          <DialogDescription className="text-xs text-[#EAD5C3]/70 leading-relaxed">
            Tell us about your coffee, meals, or visit in Tallur. All reviews appear publicly after moderation.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 px-4 text-center space-y-3.5 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
            </div>
            <h4 className="font-heading font-bold text-lg sm:text-xl text-cream">
              Thank You for Your Review!
            </h4>
            <p className="text-xs text-[#EAD5C3]/75 leading-relaxed max-w-sm mx-auto">
              Your feedback has been submitted successfully and will appear publicly once verified by our team.
            </p>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold w-full rounded-full cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Customer Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-name" className="font-semibold text-cream">
                Your Full Name *
              </Label>
              <Input
                id="dlg-name"
                placeholder="e.g. Ramesh Kumar"
                {...register('customer_name')}
                className="h-10 text-xs bg-[#140A06] border-[#3E2519] text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B]"
              />
              {errors.customer_name && (
                <p className="text-red-400 font-medium text-[11px]">
                  {errors.customer_name.message}
                </p>
              )}
            </div>

            {/* Rating Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-cream">
                  Rating *
                </Label>
                <span className="text-[11px] text-[#E5A88B] font-bold">
                  {activeDisplayRating} of 5 Stars
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 pt-1"
                role="radiogroup"
                aria-label="Select a rating from 1 to 5 stars"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    role="radio"
                    aria-checked={selectedRating === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer rounded-md focus:ring-1 focus:ring-[#E5A88B]"
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={28}
                      className={`transition-colors ${
                        star <= activeDisplayRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#3E2519]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-red-400 font-medium text-[11px]">
                  {errors.rating.message}
                </p>
              )}
            </div>

            {/* Review Message */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-msg" className="font-semibold text-cream">
                Your Review *
              </Label>
              <Textarea
                id="dlg-msg"
                rows={4}
                placeholder="Describe your dining, coffee, or service experience..."
                {...register('message')}
                className="text-xs bg-[#140A06] border-[#3E2519] text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B] leading-relaxed resize-none"
              />
              {errors.message && (
                <p className="text-red-400 font-medium text-[11px]">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold rounded-full border-[#3E2519] text-cream hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold text-xs rounded-full gap-1.5 cursor-pointer disabled:opacity-50"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

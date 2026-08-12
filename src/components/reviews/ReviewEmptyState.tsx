import { WriteReviewDialog } from '../landing/WriteReviewDialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon } from '@hugeicons/core-free-icons';

export function ReviewEmptyState() {
  return (
    <div className="p-14 text-center bg-[#1D100A] rounded-md border border-dashed border-[#2C1810] max-w-md mx-auto space-y-4 shadow-lg">
      <div className="w-14 h-14 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
        <HugeiconsIcon icon={Comment01Icon} size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-lg text-cream">
          Be the first to share your RadhaCafe story
        </h3>
        <p className="text-xs text-cream/65 leading-relaxed">
          We appreciate your feedback! Share your experience with our artisanal coffee & hospitality.
        </p>
      </div>
      <div className="pt-2">
        <WriteReviewDialog />
      </div>
    </div>
  );
}

import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';

interface GalleryEmptyStateProps {
  message?: string;
}

export function GalleryEmptyState({
  message = 'New photos showcasing RadhaCafe atmosphere and specialty coffee will be added soon.',
}: GalleryEmptyStateProps) {
  return (
    <div className="p-14 text-center bg-[#1D100A] rounded-md border border-dashed border-[#2C1810] max-w-md mx-auto space-y-3 shadow-lg">
      <div className="w-14 h-14 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
        <HugeiconsIcon icon={Image01Icon} size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-lg text-cream">Gallery is empty</h3>
        <p className="text-xs text-cream/65 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

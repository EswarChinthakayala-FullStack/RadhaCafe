import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon } from '@hugeicons/core-free-icons';

interface GalleryErrorStateProps {
  onRetry: () => void;
}

export function GalleryErrorState({ onRetry }: GalleryErrorStateProps) {
  return (
    <div className="p-12 text-center bg-[#1D100A] rounded-md border border-destructive/30 max-w-md mx-auto space-y-4 shadow-lg">
      <p className="text-sm font-bold text-destructive">
        We couldn&apos;t load the gallery photos right now.
      </p>
      <p className="text-xs text-cream/60">
        Please check your network connection or try again.
      </p>
      <Button
        onClick={onRetry}
        className="bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold text-xs rounded-full gap-2 px-5 py-2"
      >
        <HugeiconsIcon icon={RefreshIcon} size={14} />
        <span>Try Again</span>
      </Button>
    </div>
  );
}

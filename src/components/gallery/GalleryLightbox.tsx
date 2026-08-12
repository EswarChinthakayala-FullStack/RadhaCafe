import { useEffect, useCallback } from 'react';
import type { GalleryItem } from '../../lib/supabase/queries/gallery';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface GalleryLightboxProps {
  items: GalleryItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function GalleryLightbox({
  items,
  selectedIndex,
  onClose,
  onSelectIndex,
}: GalleryLightboxProps) {
  const isOpen = selectedIndex !== null && items.length > 0;
  const currentItem = isOpen ? items[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null || items.length === 0) return;
    const newIdx = (selectedIndex - 1 + items.length) % items.length;
    onSelectIndex(newIdx);
  }, [selectedIndex, items.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null || items.length === 0) return;
    const newIdx = (selectedIndex + 1) % items.length;
    onSelectIndex(newIdx);
  }, [selectedIndex, items.length, onSelectIndex]);

  // Keyboard navigation listener (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${selectedIndex + 1} of ${items.length}`}
    >
      {/* Container Box */}
      <div
        className="relative max-w-5xl w-full max-h-[90vh] bg-[#140A06] rounded-md overflow-hidden shadow-2xl border border-[#2C1810] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar: Image Counter & Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C1810] bg-[#1D100A]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E5A88B] tracking-wider uppercase">
              RadhaCafe Gallery
            </span>
            <span className="text-xs text-cream/40">&middot;</span>
            <span className="text-xs font-semibold text-cream/80" aria-live="polite">
              {selectedIndex + 1} / {items.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-cream/90 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A88B]"
            aria-label="Close lightbox"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Main Display Area */}
        <div className="relative flex-1 min-h-[50vh] max-h-[72vh] w-full bg-[#0C0603] flex items-center justify-center overflow-hidden">
          <img
            src={currentItem.image_url}
            alt={currentItem.caption || 'RadhaCafe Photo'}
            className="max-h-[72vh] w-auto max-w-full object-contain transition-transform duration-300 select-none"
          />

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A88B]"
                aria-label="Previous photo"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A88B]"
                aria-label="Next photo"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Caption Bar */}
        {currentItem.caption && (
          <div className="px-6 py-4 bg-[#1D100A] border-t border-[#2C1810]">
            <p className="text-xs sm:text-sm font-medium text-cream text-center leading-relaxed">
              {currentItem.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

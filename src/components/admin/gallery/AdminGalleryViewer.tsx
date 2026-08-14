import { useEffect, useCallback } from 'react';
import { formatDate } from '../../../lib/utils/formatDate';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Edit02Icon,
  Delete02Icon,
  Copy01Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import type { GalleryItem } from '../../../lib/supabase/queries/gallery';

interface AdminGalleryViewerProps {
  items: GalleryItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onEditPhoto?: (item: GalleryItem) => void;
  onEditCaption: (item: GalleryItem) => void;
  onDeleteImage: (item: GalleryItem) => void;
}

export function AdminGalleryViewer({
  items,
  selectedIndex,
  onClose,
  onSelectIndex,
  onEditPhoto,
  onEditCaption,
  onDeleteImage,
}: AdminGalleryViewerProps) {
  const isOpen = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < items.length;
  const currentItem = isOpen ? items[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1);
    } else {
      onSelectIndex(items.length - 1); // Loop to end
    }
  }, [selectedIndex, items.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex < items.length - 1) {
      onSelectIndex(selectedIndex + 1);
    } else {
      onSelectIndex(0); // Loop to start
    }
  }, [selectedIndex, items.length, onSelectIndex]);

  // Keyboard navigation
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

  const handleCopyLink = () => {
    if (!currentItem) return;
    navigator.clipboard.writeText(currentItem.image_url);
    toast.add({
      title: 'Image Link Copied',
      description: 'Public URL copied to clipboard.',
      type: 'success',
    });
  };

  if (!isOpen || !currentItem) return null;

  const viewsCount = currentItem.views_count ?? (currentItem as any).views ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3 text-white border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            aria-label="Close viewer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </Button>

          <span className="font-mono text-xs font-semibold text-white/90">
            {selectedIndex + 1} of {items.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {onEditPhoto && (
            <Button
              size="sm"
              onClick={() => onEditPhoto(currentItem)}
              className="h-8 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white gap-1.5 rounded-lg px-3 shadow-xs"
              title="Open Photo Editor"
            >
              <HugeiconsIcon icon={Edit02Icon} size={14} />
              <span>Edit Photo</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-lg px-2.5"
            title="Copy Public Link"
          >
            <HugeiconsIcon icon={Copy01Icon} size={14} />
            <span className="hidden sm:inline">Copy Link</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditCaption(currentItem)}
            className="h-8 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-lg px-2.5"
            title="Edit Caption"
          >
            <HugeiconsIcon icon={ViewIcon} size={14} />
            <span className="hidden sm:inline">Caption</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteImage(currentItem)}
            className="h-8 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/40 gap-1.5 rounded-lg px-2.5"
            title="Delete Photo"
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
            aria-label="Previous photo"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
        )}

        {/* Centered Photograph */}
        <div className="w-full h-full flex items-center justify-center">
          <img
            key={currentItem.id}
            src={currentItem.image_url}
            alt={currentItem.caption || 'RadhaCafe photo'}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all"
          />
        </div>

        {/* Next Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
            aria-label="Next photo"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </button>
        )}
      </div>

      {/* Bottom Information & Caption Bar */}
      <div className="p-3 sm:p-4 bg-black/60 border-t border-white/10 text-white text-center space-y-1">
        {currentItem.caption ? (
          <p className="text-sm font-medium text-white/95 max-w-2xl mx-auto drop-shadow-sm">
            {currentItem.caption}
          </p>
        ) : (
          <p className="text-xs text-white/40 italic">No caption provided</p>
        )}

        <div className="flex items-center justify-center gap-3 text-[11px] text-white/60 font-mono flex-wrap">
          <span>Uploaded: {formatDate(currentItem.created_at, 'dd MMM yyyy')}</span>
          {viewsCount > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={ViewIcon} size={12} />
                <span>{viewsCount} public views</span>
              </span>
            </>
          )}
          {currentItem.width && currentItem.height && (
            <>
              <span>•</span>
              <span>
                {currentItem.width}×{currentItem.height}px
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

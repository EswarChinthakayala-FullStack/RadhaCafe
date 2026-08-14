import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GalleryItem } from '../../lib/supabase/queries/gallery';
import { formatDate } from '../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Share01Icon,
  PlusSignIcon,
  MinusSignIcon,
  RefreshIcon,
  Maximize01Icon,
  Minimize01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Image01Icon,
} from '@hugeicons/core-free-icons';

interface GalleryViewerProps {
  items: GalleryItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function GalleryViewer({
  items,
  selectedIndex,
  onClose,
  onSelectIndex,
}: GalleryViewerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < items.length;
  const currentItem = isOpen ? items[selectedIndex] : null;

  // Deep-linking: sync URL ?photo=<id> when viewer opens or changes photo
  useEffect(() => {
    if (isOpen && currentItem) {
      const currentPhotoParam = searchParams.get('photo');
      if (currentPhotoParam !== currentItem.id) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('photo', currentItem.id);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [isOpen, currentItem, searchParams, setSearchParams]);

  // Deep-linking: open viewer if ?photo=<id> is in URL on page load
  useEffect(() => {
    const photoId = searchParams.get('photo');
    if (photoId && items.length > 0) {
      const matchIdx = items.findIndex((it) => it.id === photoId);
      if (matchIdx !== -1 && matchIdx !== selectedIndex) {
        onSelectIndex(matchIdx);
      }
    }
  }, [searchParams, items, onSelectIndex, selectedIndex]);

  // Handle Closing and cleaning URL param
  const handleClose = useCallback(() => {
    if (searchParams.has('photo')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('photo');
      setSearchParams(newParams, { replace: true });
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onClose();
  }, [searchParams, setSearchParams, onClose]);

  // Reset zoom & error whenever image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageError(false);
  }, [selectedIndex]);

  // Preload adjacent images (N - 1 and N + 1)
  useEffect(() => {
    if (!isOpen || items.length <= 1 || selectedIndex === null) return;

    const prevIdx = (selectedIndex - 1 + items.length) % items.length;
    const nextIdx = (selectedIndex + 1) % items.length;

    const img1 = new Image();
    img1.src = items[prevIdx].image_url;

    const img2 = new Image();
    img2.src = items[nextIdx].image_url;
  }, [isOpen, selectedIndex, items]);

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

  // Zoom controls (1x to 4x)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2.2);
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Graceful fallback if Fullscreen API is unavailable
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Web Share API with Clipboard copy fallback
  const handleShare = async () => {
    if (!currentItem) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?photo=${currentItem.id}`;
    const shareTitle = currentItem.title || 'RadhaCafe Gallery';
    const shareText = currentItem.caption || 'Moments and atmosphere from RadhaCafe Tallur.';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2800);
    } catch {
      // Fallback
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handlePrev, handleNext]);

  // Lock body scroll when viewer is active
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

  // Mouse pan handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const maxBound = (zoom - 1) * 350;
    const newX = Math.min(Math.max(e.clientX - dragStart.x, -maxBound), maxBound);
    const newY = Math.min(Math.max(e.clientY - dragStart.y, -maxBound), maxBound);
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom > 1 || touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (diff > 50) {
      handlePrev();
    } else if (diff < -50) {
      handleNext();
    }
    setTouchStartX(null);
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#0A0503]/96 backdrop-blur-xl flex flex-col justify-between select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing photo ${selectedIndex + 1} of ${items.length}`}
    >
      {/* ── Top Toolbar ── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2C1810]/70 bg-[#140A06]/85 backdrop-blur-md">
        {/* Left: Counter and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cream/90 shrink-0">
            <span>{selectedIndex + 1}</span>
            <span className="text-cream/40 mx-1">/</span>
            <span>{items.length}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-heading font-bold text-white truncate drop-shadow-sm">
            {currentItem.title || 'RadhaCafe Moments'}
          </h3>
        </div>

        {/* Right: Controls (Share, Zoom, Fullscreen, Close) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-cream hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
            aria-label="Share photo link and text"
            title="Share photo"
          >
            <HugeiconsIcon icon={Share01Icon} size={18} />
          </button>

          {/* Zoom Controls (Desktop only) */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 rounded text-cream hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Zoom out"
              title="Zoom out (-)"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={15} />
            </button>

            <span className="text-[11px] font-mono text-cream/80 px-1 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded text-cream hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
            </button>

            {zoom > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded text-[#E5A88B] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Reset zoom"
                title="Reset zoom (0)"
              >
                <HugeiconsIcon icon={RefreshIcon} size={14} />
              </button>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden md:flex p-2 rounded-lg bg-white/5 hover:bg-white/15 text-cream hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={18} />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-[#B85C1E] text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
            aria-label="Close photo viewer"
            title="Close (Escape)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>
      </header>

      {/* ── Center Stage ── */}
      <main
        className={`relative flex-1 w-full overflow-hidden flex items-center justify-center p-2 sm:p-6 ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#1C100B]/80 rounded-2xl border border-[#3E2519]">
            <HugeiconsIcon icon={Image01Icon} size={36} className="text-destructive/80" />
            <h4 className="font-bold text-cream text-sm">Unable to load this photo</h4>
            <p className="text-xs text-[#EAD5C3]/60 max-w-xs">
              Please check your network connection or try moving to the next photo.
            </p>
            <button
              type="button"
              onClick={() => setImageError(false)}
              className="px-4 py-2 rounded-full bg-[#B85C1E] text-white text-xs font-bold transition-all hover:scale-105"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-150 ease-out flex items-center justify-center"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            onDoubleClick={handleToggleZoom}
          >
            <img
              src={currentItem.image_url}
              alt={currentItem.alt_text || currentItem.caption || currentItem.title || 'RadhaCafe photo'}
              onError={() => setImageError(true)}
              className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-md shadow-2xl transition-all duration-300 pointer-events-auto select-none"
              draggable={false}
            />
          </div>
        )}

        {/* Previous Navigation Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-[#140A06]/70 hover:bg-[#B85C1E] text-cream hover:text-white border border-white/15 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
            aria-label="Previous photo"
            title="Previous (ArrowLeft)"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
        )}

        {/* Next Navigation Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-[#140A06]/70 hover:bg-[#B85C1E] text-cream hover:text-white border border-white/15 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
            aria-label="Next photo"
            title="Next (ArrowRight)"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </button>
        )}
      </main>

      {/* ── Bottom Caption & Metadata Bar ── */}
      <footer className="relative z-20 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#2C1810]/70 bg-[#140A06]/92 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1 min-w-0 flex-1">
            {currentItem.title && (
              <h4 className="text-sm font-heading font-extrabold text-white truncate">
                {currentItem.title}
              </h4>
            )}
            {currentItem.caption ? (
              <p className="text-xs text-[#EAD5C3]/90 leading-relaxed line-clamp-2">
                {currentItem.caption}
              </p>
            ) : (
              <p className="text-xs text-[#EAD5C3]/50 italic">
                RadhaCafe &middot; Handcrafted coffee, artisanal hospitality & Tallur moments.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentItem.created_at && (
              <span className="text-[10px] text-cream/50 hidden md:inline font-mono">
                {formatDate(currentItem.created_at)}
              </span>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#B85C1E] text-cream hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Copy01Icon} size={13} />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Copied Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#1C100B] border border-[#E5A88B]/60 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-[#E5A88B]" />
          <span>Photo link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

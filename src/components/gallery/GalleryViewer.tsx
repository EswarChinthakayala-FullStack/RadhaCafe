import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GalleryItem } from '../../lib/supabase/queries/gallery';
import { useIncrementGalleryView } from '../../hooks/useGallery';
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
  ViewIcon,
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
  const incrementViewMutation = useIncrementGalleryView();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smooth sliding carousel state
  const [slideOffsetPercent, setSlideOffsetPercent] = useState<number>(-100);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [dragDistanceX, setDragDistanceX] = useState<number>(0);
  const [isDraggingTrack, setIsDraggingTrack] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [localViews, setLocalViews] = useState<Record<string, number>>({});

  const viewedInSession = useRef<Set<string>>(new Set());
  const isClosingRef = useRef<boolean>(false);
  const isAnimatingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < items.length;
  const currentItem = isOpen ? items[selectedIndex] : null;

  const prevIndex = isOpen && items.length > 1 ? (selectedIndex - 1 + items.length) % items.length : null;
  const nextIndex = isOpen && items.length > 1 ? (selectedIndex + 1) % items.length : null;

  const prevItem = prevIndex !== null ? items[prevIndex] : null;
  const nextItem = nextIndex !== null ? items[nextIndex] : null;

  // View count increment logic
  useEffect(() => {
    if (!isOpen || !currentItem) return;

    const id = currentItem.id;
    if (!viewedInSession.current.has(id)) {
      viewedInSession.current.add(id);

      // Instant 0ms local state update
      setLocalViews((prev) => ({
        ...prev,
        [id]: (prev[id] ?? currentItem.views_count ?? 0) + 1,
      }));

      incrementViewMutation.mutate(id);
    }
  }, [isOpen, currentItem]);

  const activeViews = currentItem
    ? (localViews[currentItem.id] ?? currentItem.views_count ?? 0)
    : 0;

  // Deep-linking: sync URL ?photo=<id>
  useEffect(() => {
    if (isClosingRef.current) return;

    if (isOpen && currentItem) {
      const currentPhotoParam = searchParams.get('photo');
      if (currentPhotoParam !== currentItem.id) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('photo', currentItem.id);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [isOpen, currentItem, searchParams, setSearchParams]);

  // Deep-linking: open viewer on load
  useEffect(() => {
    if (isClosingRef.current) return;

    const photoId = searchParams.get('photo');
    if (photoId && items.length > 0 && selectedIndex === null) {
      const matchIdx = items.findIndex((it) => it.id === photoId);
      if (matchIdx !== -1) {
        onSelectIndex(matchIdx);
      }
    }
  }, [searchParams, items, onSelectIndex, selectedIndex]);

  // Handle Closing
  const handleClose = useCallback(() => {
    isClosingRef.current = true;

    if (searchParams.has('photo')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('photo');
      setSearchParams(newParams, { replace: true });
    }

    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragDistanceX(0);
    setSlideOffsetPercent(-100);
    setIsTransitioning(false);
    onClose();

    setTimeout(() => {
      isClosingRef.current = false;
    }, 200);
  }, [searchParams, setSearchParams, onClose]);

  // Reset zoom & pan on slide change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDragDistanceX(0);
    setImageError(false);
  }, [selectedIndex]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || items.length <= 1 || selectedIndex === null) return;

    if (prevItem?.image_url) {
      const img1 = new Image();
      img1.src = prevItem.image_url;
    }

    if (nextItem?.image_url) {
      const img2 = new Image();
      img2.src = nextItem.image_url;
    }
  }, [isOpen, selectedIndex, items, prevItem, nextItem]);

  // Silky smooth sliding to Next
  const handleNext = useCallback(() => {
    if (selectedIndex === null || items.length <= 1 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setSlideOffsetPercent(-200); // Slide track to the left

    setTimeout(() => {
      const newIdx = (selectedIndex + 1) % items.length;
      onSelectIndex(newIdx);
      setIsTransitioning(false);
      setSlideOffsetPercent(-100); // Reset track position seamlessly
      setDragDistanceX(0);
      isAnimatingRef.current = false;
    }, 300);
  }, [selectedIndex, items.length, onSelectIndex]);

  // Silky smooth sliding to Previous
  const handlePrev = useCallback(() => {
    if (selectedIndex === null || items.length <= 1 || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setSlideOffsetPercent(0); // Slide track to the right

    setTimeout(() => {
      const newIdx = (selectedIndex - 1 + items.length) % items.length;
      onSelectIndex(newIdx);
      setIsTransitioning(false);
      setSlideOffsetPercent(-100); // Reset track position seamlessly
      setDragDistanceX(0);
      isAnimatingRef.current = false;
    }, 300);
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
      // Fallback
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Web Share API
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

  // Lock body scroll
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
    if (zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (items.length > 1) {
      setIsDraggingTrack(true);
      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoom > 1 && isPanning) {
      const maxBound = (zoom - 1) * 350;
      const newX = Math.min(Math.max(e.clientX - panStart.x, -maxBound), maxBound);
      const newY = Math.min(Math.max(e.clientY - panStart.y, -maxBound), maxBound);
      setPan({ x: newX, y: newY });
    } else if (zoom === 1 && isDraggingTrack) {
      const deltaX = e.clientX - dragStartXRef.current;
      setDragDistanceX(deltaX);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (isDraggingTrack) {
      setIsDraggingTrack(false);
      if (dragDistanceX < -70) {
        handleNext();
      } else if (dragDistanceX > 70) {
        handlePrev();
      } else {
        // Spring back smoothly
        setIsTransitioning(true);
        setDragDistanceX(0);
        setTimeout(() => setIsTransitioning(false), 200);
      }
    }
  };

  // Touch Swipe handlers with continuous tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return;
    const touch = e.touches[0];
    dragStartXRef.current = touch.clientX;
    dragStartYRef.current = touch.clientY;
    setIsDraggingTrack(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoom > 1 || !isDraggingTrack) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - dragStartXRef.current;
    const diffY = touch.clientY - dragStartYRef.current;

    // Only drag horizontally if motion is primary horizontal
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDragDistanceX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (zoom > 1) return;
    setIsDraggingTrack(false);

    if (dragDistanceX < -50) {
      handleNext();
    } else if (dragDistanceX > 50) {
      handlePrev();
    } else {
      // Spring back smoothly
      setIsTransitioning(true);
      setDragDistanceX(0);
      setTimeout(() => setIsTransitioning(false), 200);
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#0A0503]/96 backdrop-blur-xl flex flex-col justify-between select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing photo ${selectedIndex + 1} of ${items.length}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Top Toolbar ── */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2C1810]/70 bg-[#140A06]/90 backdrop-blur-md">
        {/* Left: Counter, Title, Views */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cream/90 shrink-0">
            <span>{selectedIndex + 1}</span>
            <span className="text-cream/40 mx-1">/</span>
            <span>{items.length}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-heading font-bold text-white truncate drop-shadow-sm">
            {currentItem.title || 'RadhaCafe Moments'}
          </h3>

          {/* Views Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[11px] font-semibold text-[#E5A88B] shrink-0">
            <HugeiconsIcon icon={ViewIcon} size={13} />
            <span>{activeViews} views</span>
          </div>
        </div>

        {/* Right: Controls (Share, Zoom, Fullscreen, Close) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            onMouseDown={(e) => e.stopPropagation()}
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
              onMouseDown={(e) => e.stopPropagation()}
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
              onMouseDown={(e) => e.stopPropagation()}
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
                onMouseDown={(e) => e.stopPropagation()}
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
            onMouseDown={(e) => e.stopPropagation()}
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
            onMouseDown={(e) => e.stopPropagation()}
            className="p-2 rounded-lg bg-white/10 hover:bg-[#B85C1E] text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B] z-30"
            aria-label="Close photo viewer"
            title="Close (Escape)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>
      </header>

      {/* ── Center Stage with Smooth 3-Slide Sliding Carousel ── */}
      <main
        className={`relative flex-1 w-full overflow-hidden flex items-center justify-center p-0 ${
          zoom > 1
            ? isPanning
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : isDraggingTrack
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
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
          /* Multi-Slide Horizontal Track */
          <div
            className={`flex h-full w-full will-change-transform ${
              isTransitioning
                ? 'transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]'
                : 'transition-none'
            }`}
            style={{
              transform: `translate3d(calc(${slideOffsetPercent}% + ${dragDistanceX}px), 0, 0)`,
            }}
          >
            {/* Slide -1: Previous Image */}
            <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-6 opacity-60 scale-95 transition-opacity">
              {prevItem && (
                <img
                  src={prevItem.image_url}
                  alt={prevItem.alt_text || 'Previous photo'}
                  className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-md shadow-2xl pointer-events-none select-none"
                  draggable={false}
                />
              )}
            </div>

            {/* Slide 0: Current Active Image */}
            <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-6">
              <div
                className="relative flex items-center justify-center transition-transform duration-150 ease-out"
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
                  className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-md shadow-2xl pointer-events-auto select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* Slide +1: Next Image */}
            <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-6 opacity-60 scale-95 transition-opacity">
              {nextItem && (
                <img
                  src={nextItem.image_url}
                  alt={nextItem.alt_text || 'Next photo'}
                  className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-md shadow-2xl pointer-events-none select-none"
                  draggable={false}
                />
              )}
            </div>
          </div>
        )}

        {/* Previous Navigation Button */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-[#140A06]/80 hover:bg-[#B85C1E] text-cream hover:text-white border border-white/15 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B] z-20"
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
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-[#140A06]/80 hover:bg-[#B85C1E] text-cream hover:text-white border border-white/15 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5A88B] z-20"
            aria-label="Next photo"
            title="Next (ArrowRight)"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </button>
        )}
      </main>

      {/* ── Bottom Caption & Metadata Bar ── */}
      <footer className="relative z-30 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#2C1810]/70 bg-[#140A06]/92 backdrop-blur-md">
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
            {/* Mobile views badge */}
            <div className="sm:hidden inline-flex items-center gap-1 text-[11px] text-[#E5A88B] font-semibold">
              <HugeiconsIcon icon={ViewIcon} size={12} />
              <span>{activeViews} views</span>
            </div>

            {currentItem.created_at && (
              <span className="text-[10px] text-cream/50 hidden md:inline font-mono">
                {formatDate(currentItem.created_at)}
              </span>
            )}

            <button
              type="button"
              onClick={handleShare}
              onMouseDown={(e) => e.stopPropagation()}
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

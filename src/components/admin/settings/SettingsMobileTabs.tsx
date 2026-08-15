import { useEffect, useRef, useState, useCallback } from 'react';
import { SETTINGS_CATEGORIES, type SettingsSectionKey } from './SettingsSidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface SettingsMobileTabsProps {
  activeKey: SettingsSectionKey;
  onSelectKey: (key: SettingsSectionKey) => void;
  printerConnected?: boolean;
}

export function SettingsMobileTabs({
  activeKey,
  onSelectKey,
  printerConnected,
}: SettingsMobileTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons]);

  // Auto-scroll active tab into view smoothly
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    updateScrollButtons();
  }, [activeKey, updateScrollButtons]);

  const scrollByAmount = (distance: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll for mouse and touch interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Convert vertical mouse wheel to horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  return (
    <div className="relative w-full min-w-0 bg-secondary/40 border-b border-border/80 p-2">
      {/* Left Slider Arrow Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-card/95 backdrop-blur-md border border-border/90 text-foreground shadow-md hover:bg-secondary active:scale-95 transition-all"
          aria-label="Scroll tabs left"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
        </button>
      )}

      {/* Right Slider Arrow Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-card/95 backdrop-blur-md border border-border/90 text-foreground shadow-md hover:bg-secondary active:scale-95 transition-all"
          aria-label="Scroll tabs right"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      )}

      {/* Horizontal Scrollable Tabs Container */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        className="w-full overflow-x-auto touch-pan-x overscroll-x-contain scrollbar-none snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none px-5 py-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center gap-1.5 min-w-max">
          {SETTINGS_CATEGORIES.map((cat) => {
            const isActive = activeKey === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => onSelectKey(cat.key)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shadow-2xs active:scale-95 ${
                  isActive
                    ? 'bg-cinnamon text-white border-cinnamon shadow-sm font-bold'
                    : 'bg-card text-muted-foreground border-border/70 hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <HugeiconsIcon
                  icon={cat.icon}
                  size={14}
                  className={isActive ? 'text-white' : 'text-muted-foreground'}
                />
                <span>{cat.label}</span>

                {cat.key === 'printer' && printerConnected !== undefined && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      printerConnected
                        ? isActive
                          ? 'bg-white'
                          : 'bg-emerald-500'
                        : isActive
                        ? 'bg-white/60'
                        : 'bg-muted-foreground/40'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

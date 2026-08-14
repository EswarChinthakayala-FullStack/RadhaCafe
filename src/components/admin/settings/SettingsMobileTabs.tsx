import { useEffect, useRef, useState } from 'react';
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

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    updateScrollButtons();
  }, [activeKey]);

  const scrollByAmount = (distance: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll for touch/mouse
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

  return (
    <div className="relative w-full min-w-0 bg-secondary/30 border-b border-border/80 px-2 py-2">
      {/* Left Slider Arrow Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-card/95 backdrop-blur-md border border-border text-foreground shadow-md hover:bg-secondary active:scale-95 transition-all"
          aria-label="Scroll Tabs Left"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
        </button>
      )}

      {/* Right Slider Arrow Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-card/95 backdrop-blur-md border border-border text-foreground shadow-md hover:bg-secondary active:scale-95 transition-all"
          aria-label="Scroll Tabs Right"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
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
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-6 select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {SETTINGS_CATEGORIES.map((cat) => {
          const isActive = activeKey === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              data-active={isActive}
              onClick={() => onSelectKey(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-cinnamon text-white font-bold shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/60'
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
                  className={`w-1.5 h-1.5 rounded-full ${
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
  );
}

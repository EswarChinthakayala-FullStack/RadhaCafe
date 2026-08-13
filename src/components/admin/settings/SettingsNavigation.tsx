import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Store01Icon,
  Image01Icon,
  InvoiceIcon,
  PrinterIcon,
  Settings01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export type SettingsCategory = 'profile' | 'branding' | 'tax' | 'printer' | 'preferences';

interface NavItem {
  id: SettingsCategory;
  label: string;
  description: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'profile',
    label: 'Cafe Profile',
    description: 'Name, contact info & operating hours',
    icon: Store01Icon,
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo asset, preview & storage',
    icon: Image01Icon,
  },
  {
    id: 'tax',
    label: 'Tax & Currency',
    description: 'Billing tax rates & currency unit',
    icon: InvoiceIcon,
  },
  {
    id: 'printer',
    label: 'Thermal Printer',
    description: 'Bluetooth pairing & paper width',
    icon: PrinterIcon,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'General system preferences',
    icon: Settings01Icon,
  },
];

interface SettingsNavigationProps {
  activeCategory: SettingsCategory;
  onSelectCategory: (category: SettingsCategory) => void;
}

export function SettingsNavigation({ activeCategory, onSelectCategory }: SettingsNavigationProps) {
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
  }, [activeCategory]);

  const scrollByAmount = (distance: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll for mouse users
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
    <>
      {/* Mobile & Tablet Horizontal Scroll Navigation with Drag & Buttons */}
      <div className="lg:hidden relative w-full min-w-0">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-180)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-card border border-border/80 text-foreground shadow-md hover:bg-secondary active:scale-95"
            aria-label="Scroll Left"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(180)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-card border border-border/80 text-foreground shadow-md hover:bg-secondary active:scale-95"
            aria-label="Scroll Right"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className="w-full overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2 min-w-max px-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-active={isActive ? "true" : "false"}
                  onClick={() => onSelectCategory(item.id)}
                  className={`snap-start shrink-0 min-w-max flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs active:scale-95 ${isActive
                    ? 'bg-cinnamon text-white border-cinnamon shadow-sm font-bold'
                    : 'bg-card text-muted-foreground border-border/80 hover:text-foreground hover:bg-secondary/50'
                    }`}
                >
                  <HugeiconsIcon icon={item.icon} size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Vertical Card Navigation */}
      <div className="hidden lg:block space-y-1 bg-card border border-border/80 p-2 rounded-md shadow-xs">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-2">
          Settings Categories
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-active={isActive ? "true" : "false"}
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-all ${isActive
                ? 'bg-cinnamon text-white font-semibold shadow-xs'
                : 'text-foreground hover:bg-secondary/50 font-medium'
                }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-secondary/60 text-cinnamon'
                  }`}
              >
                <HugeiconsIcon icon={item.icon} size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-none">{item.label}</p>
                <p
                  className={`text-[10px] mt-1 line-clamp-1 ${isActive ? 'text-white/80' : 'text-muted-foreground'
                    }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

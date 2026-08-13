import { useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Store01Icon,
  Image01Icon,
  InvoiceIcon,
  PrinterIcon,
  Settings01Icon,
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

  // Auto-scroll selected tab into view on mobile/tablet
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <>
      {/* Mobile & Tablet Horizontal Scroll Navigation */}
      <div 
        ref={scrollContainerRef}
        className="lg:hidden w-full overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex items-center gap-2 min-w-max px-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-active={isActive ? "true" : "false"}
                onClick={() => onSelectCategory(item.id)}
                className={`snap-start shrink-0 min-w-max flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-xs active:scale-95 ${isActive
                  ? 'bg-cinnamon text-white border-cinnamon shadow-sm'
                  : 'bg-card text-muted-foreground border-border/80 hover:text-foreground hover:bg-secondary/40'
                  }`}
              >
                <HugeiconsIcon icon={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
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

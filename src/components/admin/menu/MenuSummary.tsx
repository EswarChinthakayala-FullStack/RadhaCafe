import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../../types';

interface MenuSummaryProps {
  items: MenuItem[];
  onSelectFilter?: (type: 'all' | 'available' | 'unavailable' | 'specials') => void;
  activeFilter?: string;
}

export function MenuSummary({ items, onSelectFilter, activeFilter }: MenuSummaryProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.is_available).length;
  const unavailableItems = items.filter((i) => !i.is_available).length;
  const specialsItems = items.filter((i) => i.daily_special_date === todayStr).length;

  const cards = [
    {
      id: 'all',
      title: 'Total Items',
      value: totalItems,
      subtitle: 'Cafe menu catalog',
      icon: Coffee02Icon,
      accent: 'text-cinnamon bg-cinnamon/10 border-cinnamon/20',
      isActive: activeFilter === 'all' || !activeFilter,
    },
    {
      id: 'available',
      title: 'Available',
      value: availableItems,
      subtitle: 'Orderable on POS',
      icon: CheckmarkCircle02Icon,
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      isActive: activeFilter === 'available',
    },
    {
      id: 'unavailable',
      title: 'Unavailable',
      value: unavailableItems,
      subtitle: 'Hidden from POS/menu',
      icon: CancelCircleIcon,
      accent: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      isActive: activeFilter === 'unavailable',
    },
    {
      id: 'specials',
      title: "Today's Specials",
      value: specialsItems,
      subtitle: 'Featured daily items',
      icon: StarIcon,
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      isActive: activeFilter === 'specials',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((card) => {
        const isClickable = Boolean(onSelectFilter);

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id as any)}
            className={`p-3 sm:p-4 rounded-xl border bg-card shadow-2xs transition-all flex justify-between items-start overflow-hidden min-w-0 ${
              isClickable ? 'cursor-pointer hover:border-cinnamon/40 active:scale-[0.99]' : ''
            } ${
              card.isActive && card.id !== 'all'
                ? 'border-cinnamon ring-1 ring-cinnamon/30'
                : 'border-border/80'
            }`}
          >
            <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1">
              <p className="text-[11px] font-semibold text-muted-foreground truncate">{card.title}</p>
              <p className="text-sm sm:text-lg lg:text-xl font-bold font-mono text-foreground tracking-tight truncate">
                {card.value}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{card.subtitle}</p>
            </div>

            <div className={`p-1.5 sm:p-2 rounded-lg border ${card.accent} shrink-0`}>
              <HugeiconsIcon icon={card.icon} size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

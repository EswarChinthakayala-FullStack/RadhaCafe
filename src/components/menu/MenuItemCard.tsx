import type { MenuItem } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, ViewIcon, SparklesIcon, StarIcon } from '@hugeicons/core-free-icons';
import { LazyImage } from '../ui/lazy-image';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
  className?: string;
}

export function MenuItemCard({ item, onSelect, className = '' }: MenuItemCardProps) {
  const isSpecial = item.is_today_special || (item.daily_special_date && new Date(item.daily_special_date).toDateString() === new Date().toDateString());
  const isBestSeller = item.is_best_seller || item.tags?.includes('bestseller') || item.tags?.includes('popular');

  return (
    <Card
      onClick={() => onSelect?.(item)}
      className={`overflow-hidden border border-[#2C1810] bg-[#1D100A] rounded-xl hover:border-[#E5A88B]/50 transition-colors duration-300 group flex flex-col justify-between shadow-md hover:shadow-xl cursor-pointer ${className}`}
    >
      <div>
        {/* Outer Container with Cafe dark background bg-[#180C07] */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-[#160B07] relative flex items-center justify-center p-2.5">
          {item.image_url ? (
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
              <LazyImage
                src={item.image_url}
                alt={item.name}
                containerClassName="bg-white"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#E5A88B]/30 gap-2 bg-[#1C100B] rounded-lg">
              <HugeiconsIcon icon={Coffee02Icon} size={40} />
              <span className="text-[10px] font-semibold text-cream/40">RadhaCafe Artisanal</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {isSpecial && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[#140A06] text-[10px] font-extrabold tracking-wider uppercase shadow-lg">
                <HugeiconsIcon icon={SparklesIcon} size={11} />
                <span>Today's Special</span>
              </span>
            )}
            {isBestSeller && !isSpecial && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#E5A88B] text-[#140A06] text-[10px] font-extrabold tracking-wider uppercase shadow-lg">
                <HugeiconsIcon icon={StarIcon} size={11} className="fill-current" />
                <span>Best Seller</span>
              </span>
            )}
          </div>

          {/* Hover View Details Action Overlay */}
          <div className="absolute inset-0 bg-[#140A06]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E5A88B] text-[#140A06] text-xs font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>View Details</span>
              <HugeiconsIcon icon={ViewIcon} size={14} />
            </span>
          </div>

          {/* Unavailable Badge */}
          {!item.is_available && (
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
                Unavailable
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <CardContent className="p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="font-heading font-bold text-sm text-[#E5A88B] shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.category?.name && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold text-[#E5A88B] border-[#E5A88B]/30 bg-[#E5A88B]/10 rounded-full px-2.5 py-0.5"
              >
                {item.category.name}
              </Badge>
            </div>
          )}

          {item.description && (
            <p className="text-xs text-cream/70 leading-relaxed line-clamp-2 font-normal">
              {item.description}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

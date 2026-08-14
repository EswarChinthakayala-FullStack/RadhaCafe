import type { MenuItem } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { LazyImage } from '../ui/lazy-image';

interface MenuItemDetailDialogProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function MenuItemDetailDialog({ item, onClose }: MenuItemDetailDialogProps) {
  if (!item) return null;

  const isSpecial =
    item.is_today_special ||
    (item.daily_special_date &&
      new Date(item.daily_special_date).toDateString() === new Date().toDateString());
  const isBestSeller =
    item.is_best_seller ||
    item.tags?.includes('bestseller') ||
    item.tags?.includes('popular');

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2.5rem)] max-w-sm sm:max-w-lg bg-[#1D100A] text-cream border border-[#2C1810] rounded-2xl overflow-hidden p-0 gap-0 shadow-2xl mx-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>Menu item details for {item.name}</DialogDescription>
        </DialogHeader>

        {/* Top Image Area (bounded height, centered object-contain on white background without forced full-bleed cropping on mobile) */}
        <div className="relative w-full h-52 sm:h-72 bg-white flex items-center justify-center overflow-hidden p-3 sm:p-4">
          {item.image_url ? (
            <div className="w-full h-full bg-white relative flex items-center justify-center">
              <LazyImage
                src={item.image_url}
                alt={item.name}
                containerClassName="bg-white w-full h-full flex items-center justify-center"
                className="max-h-full max-w-full w-auto h-auto object-contain"
                loading="eager"
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[180px] flex flex-col items-center justify-center text-[#E5A88B]/40 gap-2 bg-[#1C100B]">
              <HugeiconsIcon icon={Coffee02Icon} size={44} />
              <span className="text-xs font-semibold text-cream/40">Artisanal RadhaCafe Offering</span>
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
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {item.category?.name && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold text-[#E5A88B] border-[#E5A88B]/30 bg-[#E5A88B]/10 rounded-full px-2.5 py-0.5"
                >
                  {item.category.name}
                </Badge>
              )}
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-cream leading-tight">
                {item.name}
              </h3>
            </div>

            <span className="font-bold text-xl sm:text-2xl text-[#E5A88B] shrink-0 font-heading">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.description && (
            <p className="text-xs sm:text-sm text-cream/75 leading-relaxed font-normal">
              {item.description}
            </p>
          )}

          {/* Availability Status */}
          <div className="pt-3 border-t border-[#2C1810] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {item.is_available ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-400" />
                  <span className="font-bold text-emerald-400 text-xs">Available Today</span>
                </>
              ) : (
                <span className="font-bold text-amber-400/80 text-xs">Currently Unavailable</span>
              )}
            </div>

            <span className="text-[11px] text-cream/40 font-medium">Freshly prepared at Tallur</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

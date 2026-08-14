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
      <DialogContent className="max-w-lg bg-[#1D100A] text-cream border border-[#2C1810] rounded-2xl overflow-hidden p-0 gap-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>Menu item details for {item.name}</DialogDescription>
        </DialogHeader>

        {/* Top Full-Bleed Image Banner */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 max-h-[380px] bg-white overflow-hidden flex items-center justify-center">
          {item.image_url ? (
            <div className="w-full h-full bg-white relative flex items-center justify-center">
              <LazyImage
                src={item.image_url}
                alt={item.name}
                containerClassName="bg-white w-full h-full"
                className="w-full h-full object-cover sm:object-contain"
                loading="eager"
              />
              {/* Subtle bottom gradient blending into card body */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1D100A] via-[#1D100A]/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-[#E5A88B]/40 gap-2 bg-[#1C100B]">
              <HugeiconsIcon icon={Coffee02Icon} size={48} />
              <span className="text-xs font-semibold text-cream/40">Artisanal RadhaCafe Offering</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
            {isSpecial && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[#140A06] text-[11px] font-extrabold tracking-wider uppercase shadow-lg">
                <HugeiconsIcon icon={SparklesIcon} size={12} />
                <span>Today's Special</span>
              </span>
            )}
            {isBestSeller && !isSpecial && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#E5A88B] text-[#140A06] text-[11px] font-extrabold tracking-wider uppercase shadow-lg">
                <HugeiconsIcon icon={StarIcon} size={12} className="fill-current" />
                <span>Best Seller</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              {item.category?.name && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold text-[#E5A88B] border-[#E5A88B]/30 bg-[#E5A88B]/10 rounded-full px-2.5 py-0.5"
                >
                  {item.category.name}
                </Badge>
              )}
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-cream leading-tight">
                {item.name}
              </h3>
            </div>

            <span className="font-bold text-2xl text-[#E5A88B] shrink-0 font-heading">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.description && (
            <p className="text-xs sm:text-sm text-cream/75 leading-relaxed font-normal">
              {item.description}
            </p>
          )}

          {/* Availability Status */}
          <div className="pt-3.5 border-t border-[#2C1810] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {item.is_available ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400" />
                  <span className="font-bold text-emerald-400">Available Today</span>
                </>
              ) : (
                <span className="font-bold text-amber-400/80">Currently Unavailable</span>
              )}
            </div>

            <span className="text-[11px] text-cream/40 font-medium">Freshly prepared at Tallur</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

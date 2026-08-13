import type { MenuItem } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

import { LazyImage } from '../ui/lazy-image';

interface MenuItemDetailDialogProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function MenuItemDetailDialog({ item, onClose }: MenuItemDetailDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-[#1D100A] text-cream border border-[#2C1810] rounded-md overflow-hidden p-0 gap-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>Menu item details for {item.name}</DialogDescription>
        </DialogHeader>

        {/* Top Image Banner */}
        <div className="relative w-full bg-[#140A06] flex items-center justify-center p-3 min-h-[220px] max-h-[380px] overflow-hidden">
          {item.image_url ? (
            <LazyImage
              src={item.image_url}
              alt={item.name}
              className="max-h-[350px] w-auto max-w-full object-contain rounded-md shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 flex flex-col items-center justify-center text-[#E5A88B]/40 gap-2">
              <HugeiconsIcon icon={Coffee02Icon} size={48} />
              <span className="text-xs font-semibold">Artisanal RadhaCafe Offering</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {item.category?.name && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold text-[#E5A88B] border-[#E5A88B]/30 bg-[#E5A88B]/10"
                >
                  {item.category.name}
                </Badge>
              )}
              <h3 className="font-heading font-bold text-2xl text-cream">{item.name}</h3>
            </div>

            <span className="font-bold text-xl text-[#E5A88B] shrink-0 font-heading">
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
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400" />
                  <span className="font-bold text-emerald-400">Available Today</span>
                </>
              ) : (
                <span className="font-bold text-amber-400/80">Currently Unavailable</span>
              )}
            </div>

            <span className="text-[11px] text-cream/40">Freshly prepared at Tallur</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

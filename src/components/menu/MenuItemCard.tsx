import { useState } from 'react';
import type { MenuItem } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, ViewIcon } from '@hugeicons/core-free-icons';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Card
      onClick={() => onSelect?.(item)}
      className="overflow-hidden border border-[#2C1810] bg-[#1D100A] rounded-md hover:border-[#E5A88B]/40 transition-all duration-300 group flex flex-col justify-between shadow-md hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      <div>
        {/* Image Container with Fixed Aspect Ratio */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-[#140A06] relative">
          {item.image_url && !imageFailed ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#E5A88B]/30 gap-2 bg-[#1C100B]">
              <HugeiconsIcon icon={Coffee02Icon} size={40} />
              <span className="text-[10px] font-semibold text-cream/40">RadhaCafe Offering</span>
            </div>
          )}

          {/* Hover View Badge */}
          <div className="absolute inset-0 bg-[#140A06]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5A88B] text-[#140A06] text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <span>View Details</span>
              <HugeiconsIcon icon={ViewIcon} size={14} />
            </span>
          </div>

          {/* Unavailable Badge */}
          {!item.is_available && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
                Currently Unavailable
              </Badge>
            </div>
          )}
        </div>

        {/* Card Body */}
        <CardContent className="p-5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-cream font-heading group-hover:text-[#E5A88B] transition-colors">
              {item.name}
            </h3>
            <span className="font-bold text-sm text-[#E5A88B] shrink-0 font-heading">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.category?.name && (
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold text-[#E5A88B] border-[#E5A88B]/30 bg-[#E5A88B]/10"
            >
              {item.category.name}
            </Badge>
          )}

          {item.description && (
            <p className="text-xs text-cream/65 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon, PlusSignIcon, MinusSignIcon, Coffee02Icon } from '@hugeicons/core-free-icons';

interface BestSellersSectionProps {
  bestSellers: MenuItem[];
  isLoading?: boolean;
}

export function BestSellersSection({ bestSellers, isLoading }: BestSellersSectionProps) {
  const { items, addItem, updateQuantity } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 animate-pulse">
            <HugeiconsIcon icon={FireIcon} size={15} />
          </div>
          <div className="h-4 w-28 bg-secondary animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-lg bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!bestSellers || bestSellers.length === 0) {
    return null;
  }

  const getItemQuantityInCart = (itemId: string): number => {
    const existing = items.find((i) => i.menuItem.id === itemId);
    return existing ? existing.quantity : 0;
  };

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0">
          <HugeiconsIcon icon={FireIcon} size={15} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm font-heading text-foreground flex items-center gap-2">
            <span>Best Sellers</span>
            <Badge variant="outline" className="text-[10px] border-orange-500/40 text-orange-600 font-bold px-1.5 py-0 shrink-0">
              Popular
            </Badge>
          </h3>
          <p className="text-[11px] text-muted-foreground truncate">Most ordered by customers</p>
        </div>
      </div>

      {/* Responsive Product Grid — 8 cols laptop, 6 cols tablet, 4 cols mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 lg:gap-2">
        {bestSellers.slice(0, 8).map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const hasImage = Boolean(item.image_url);

          return (
            <div
              key={item.id}
              onClick={() => addItem(item)}
              className={`group/card rounded-lg border bg-card p-1 sm:p-1.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99] select-none ${
                qtyInCart > 0 ? 'border-cinnamon/60 ring-1 ring-cinnamon/20 bg-cinnamon/[0.02]' : 'border-border/80 hover:border-cinnamon/40'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-white border border-border/40 flex items-center justify-center">
                  {hasImage ? (
                    <LazyImage
                      src={item.image_url!}
                      alt={item.name}
                      containerClassName="bg-white"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/40 text-muted-foreground/40 gap-0.5">
                      <HugeiconsIcon icon={Coffee02Icon} size={18} />
                      <span className="text-[7.5px] font-bold uppercase tracking-wider">RadhaCafe</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1 max-w-[85%]">
                    <Badge className="bg-orange-600/95 backdrop-blur-xs text-white text-[7.5px] sm:text-[8.5px] px-1 py-0 font-bold shadow-xs flex items-center gap-0.5 rounded leading-tight">
                      <HugeiconsIcon icon={FireIcon} size={8} />
                      <span className="truncate">Best Seller</span>
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1 right-1 bg-cinnamon text-white text-[9px] font-mono font-bold h-4.5 min-w-[18px] px-0.5 rounded-full flex items-center justify-center shadow-md border border-white/30">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-0.5 pt-1">
                  <span className="text-[8px] sm:text-[9px] font-semibold text-muted-foreground uppercase tracking-wider truncate block">
                    {item.category?.name || 'Best Seller'}
                  </span>
                  <h4 className="font-bold text-[11px] sm:text-xs text-foreground line-clamp-1 leading-tight group-hover/card:text-cinnamon transition-colors" title={item.name}>
                    {item.name}
                  </h4>
                  <div>
                    <span className="font-extrabold text-[11px] sm:text-xs text-cinnamon font-heading">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dedicated Compact Action Row */}
              <div className="pt-1 mt-1 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                {qtyInCart > 0 ? (
                  <div className="w-full h-6 sm:h-6.5 bg-cinnamon text-white rounded-md flex items-center justify-between px-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart - 1);
                      }}
                      className="h-5 w-5 sm:w-6 rounded flex items-center justify-center text-white hover:bg-black/20 active:scale-90 transition-all"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={11} />
                    </button>
                    <span className="text-[11px] sm:text-xs font-bold font-mono text-white select-none leading-none">
                      {qtyInCart}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart + 1);
                      }}
                      className="h-5 w-5 sm:w-6 rounded flex items-center justify-center text-white hover:bg-black/20 active:scale-90 transition-all"
                      aria-label={`Increase ${item.name}`}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item);
                    }}
                    className="w-full h-6 sm:h-6.5 bg-cinnamon/10 hover:bg-cinnamon text-cinnamon hover:text-white font-bold text-[10px] sm:text-[11px] rounded-md transition-all flex items-center justify-center gap-0.5 active:scale-[0.98] border border-cinnamon/20 hover:border-cinnamon"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={11} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

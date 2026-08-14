import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
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

      {/* Responsive Product Grid — matches main grid proportions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
        {bestSellers.slice(0, 6).map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const hasImage = Boolean(item.image_url);

          return (
            <div
              key={item.id}
              className={`rounded-lg border bg-card p-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                qtyInCart > 0 ? 'border-cinnamon/50 ring-1 ring-cinnamon/15' : 'border-border/70 hover:border-orange-400/50'
              }`}
            >
              <div className="space-y-1.5">
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-secondary/30">
                  {hasImage ? (
                    <LazyImage
                      src={item.image_url!}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/50 text-muted-foreground/40 gap-0.5">
                      <HugeiconsIcon icon={Coffee02Icon} size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">RadhaCafe</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <Badge className="bg-orange-600/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0 font-bold shadow-2xs flex items-center gap-0.5">
                      <HugeiconsIcon icon={FireIcon} size={8} />
                      <span>Best Seller</span>
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1 right-1 bg-cinnamon text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white/20">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Info */}
                <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-tight">{item.name}</h4>
              </div>

              {/* Footer Price & Add */}
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border/40 gap-1">
                <span className="font-extrabold text-xs text-cinnamon font-heading">{formatCurrency(item.price)}</span>

                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-0.5 bg-secondary/80 rounded-md p-0.5 border border-border/50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                      className="h-6 w-6 rounded flex items-center justify-center bg-card text-foreground text-xs font-bold active:scale-95 transition-all"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={11} />
                    </button>
                    <span className="text-[11px] font-bold font-mono px-1 min-w-[16px] text-center">{qtyInCart}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                      className="h-6 w-6 rounded flex items-center justify-center bg-cinnamon text-white text-xs font-bold active:scale-95 transition-all"
                      aria-label={`Increase ${item.name}`}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={11} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => addItem(item)}
                    className="h-6 px-2 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-[11px] rounded shadow-2xs gap-0.5 active:scale-95 transition-all"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={12} />
                    <span>Add</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

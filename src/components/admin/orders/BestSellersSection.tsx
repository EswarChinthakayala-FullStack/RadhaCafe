import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon, PlusSignIcon, MinusSignIcon } from '@hugeicons/core-free-icons';

interface BestSellersSectionProps {
  bestSellers: MenuItem[];
  isLoading?: boolean;
}

export function BestSellersSection({ bestSellers, isLoading }: BestSellersSectionProps) {
  const { items, addItem, updateQuantity } = useCart();

  if (isLoading) {
    return (
      <div className="p-4 rounded-md bg-card border border-border/80 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 animate-pulse">
            <HugeiconsIcon icon={FireIcon} size={16} />
          </div>
          <div className="h-4 w-32 bg-secondary animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-36 rounded-lg bg-secondary/50 animate-pulse" />
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
    <div className="p-4 rounded-md bg-card border border-border/80 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <HugeiconsIcon icon={FireIcon} size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm font-heading text-foreground flex items-center gap-2">
              <span>Best Sellers</span>
              <Badge variant="outline" className="text-[10px] border-orange-500/40 text-orange-600 font-bold px-1.5 py-0.2">
                Top Rated
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground">Most popular choices based on recent customer orders</p>
          </div>
        </div>
      </div>

      {/* Grid of Top Best Sellers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {bestSellers.slice(0, 6).map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const tags = item.tags || [];

          return (
            <div
              key={item.id}
              className="rounded-lg border border-border/70 bg-background p-2.5 shadow-2xs hover:border-cinnamon/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                {/* Image */}
                <div className="relative h-24 w-full overflow-hidden rounded-md bg-secondary/30">
                  <LazyImage
                    src={item.image_url || undefined}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <Badge className="bg-orange-600/90 text-white text-[9px] px-1 py-0.2 font-bold shadow-2xs">
                      Best Seller
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1.5 right-1.5 bg-cinnamon text-white text-[10px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-xs">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{item.name}</h4>

                  {/* Tag Pills */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {tags.slice(0, 1).map((t) => (
                        <span key={t} className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1 py-0.2 rounded">
                          {t}
                        </span>
                      ))}
                      {tags.length > 1 && (
                        <span className="text-[9px] font-semibold text-muted-foreground">+{tags.length - 1}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Price & Add */}
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-border/40">
                <span className="font-bold text-xs text-cinnamon">{formatCurrency(item.price)}</span>

                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-1 bg-secondary/80 rounded p-0.5 border border-border/50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                      className="h-5 w-5 rounded flex items-center justify-center bg-background text-foreground text-xs font-bold"
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={10} />
                    </button>
                    <span className="text-[11px] font-bold px-1 min-w-[14px] text-center">{qtyInCart}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                      className="h-5 w-5 rounded flex items-center justify-center bg-cinnamon text-white text-xs font-bold"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={10} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => addItem(item)}
                    className="h-6 px-2 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-[11px] rounded shadow-2xs gap-0.5"
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

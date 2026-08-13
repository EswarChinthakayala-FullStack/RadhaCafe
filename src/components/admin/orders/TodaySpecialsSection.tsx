import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PlusSignIcon, MinusSignIcon } from '@hugeicons/core-free-icons';

interface TodaySpecialsSectionProps {
  specials: MenuItem[];
}

export function TodaySpecialsSection({ specials }: TodaySpecialsSectionProps) {
  const { items, addItem, updateQuantity } = useCart();

  if (!specials || specials.length === 0) {
    return null;
  }

  const getItemQuantityInCart = (itemId: string): number => {
    const existing = items.find((i) => i.menuItem.id === itemId);
    return existing ? existing.quantity : 0;
  };

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <HugeiconsIcon icon={StarIcon} size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm font-heading text-foreground flex items-center gap-2">
              <span>Today's Specials</span>
              <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Chef Recommended
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground">Handpicked special featured items for today</p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable / Responsive Cards Row */}
      <div className="flex gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
        {specials.map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);

          return (
            <div
              key={item.id}
              className="min-w-[210px] sm:min-w-[240px] max-w-[240px] shrink-0 rounded-lg border border-amber-500/30 bg-card p-3 shadow-xs hover:border-amber-500/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Item Image Container */}
                <div className="relative h-28 w-full overflow-hidden rounded-md bg-secondary/30">
                  <LazyImage
                    src={item.image_url || undefined}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 font-bold shadow-xs">
                      Today's Special
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-2 right-2 bg-cinnamon text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-xs">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Category & Name */}
                <div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    {item.category?.name || 'Special'}
                  </span>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{item.name}</h4>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                <span className="font-bold text-xs text-cinnamon">{formatCurrency(item.price)}</span>

                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-1.5 bg-secondary/80 rounded-md p-0.5 border border-border/60">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                      className="h-6 w-6 rounded flex items-center justify-center bg-background text-foreground hover:bg-secondary transition-colors text-xs font-bold"
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={12} />
                    </button>
                    <span className="text-xs font-bold px-1 min-w-[16px] text-center">{qtyInCart}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                      className="h-6 w-6 rounded flex items-center justify-center bg-cinnamon text-white hover:bg-cinnamon/90 transition-colors text-xs font-bold"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={12} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => addItem(item)}
                    className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-md shadow-2xs gap-1"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={13} />
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

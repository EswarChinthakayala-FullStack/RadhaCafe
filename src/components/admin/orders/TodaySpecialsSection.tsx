import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PlusSignIcon, MinusSignIcon, Coffee02Icon } from '@hugeicons/core-free-icons';

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
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <HugeiconsIcon icon={StarIcon} size={15} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm font-heading text-foreground flex items-center gap-2">
            <span>Today's Specials</span>
            <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-1.5 py-0 rounded font-bold shrink-0">
              Featured
            </Badge>
          </h3>
          <p className="text-[11px] text-muted-foreground truncate">Handpicked for today</p>
        </div>
      </div>

      {/* Responsive Grid -- scrollable on mobile if many specials, grid on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
        {specials.map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const hasImage = Boolean(item.image_url);

          return (
            <div
              key={item.id}
              className={`rounded-lg border bg-card p-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                qtyInCart > 0 ? 'border-amber-500/50 ring-1 ring-amber-400/20' : 'border-amber-500/25 hover:border-amber-500/50'
              }`}
            >
              <div className="space-y-1.5">
                {/* Item Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-secondary/30">
                  {hasImage ? (
                    <LazyImage
                      src={item.image_url!}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-950/20 text-amber-400/50 gap-0.5">
                      <HugeiconsIcon icon={Coffee02Icon} size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">Special</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <Badge className="bg-amber-600/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0 font-bold shadow-xs flex items-center gap-0.5">
                      <HugeiconsIcon icon={StarIcon} size={8} />
                      <span>Today's Special</span>
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1 right-1 bg-cinnamon text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white/20">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Category & Name */}
                <div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    {item.category?.name || 'Special'}
                  </span>
                  <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-tight">{item.name}</h4>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border/50 gap-1 min-w-0">
                <span className="font-extrabold text-xs text-cinnamon font-heading shrink-0">{formatCurrency(item.price)}</span>

                {qtyInCart > 0 ? (
                  <div className="flex items-center gap-0.5 bg-secondary/80 rounded-md p-0.5 border border-border/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart - 1)}
                      className="h-5.5 w-5.5 rounded flex items-center justify-center bg-card text-foreground hover:bg-secondary transition-colors text-xs font-bold active:scale-95"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={10} />
                    </button>
                    <span className="text-[10px] font-bold font-mono px-0.5 min-w-[14px] text-center">{qtyInCart}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, qtyInCart + 1)}
                      className="h-5.5 w-5.5 rounded flex items-center justify-center bg-cinnamon text-white hover:bg-cinnamon/90 transition-colors text-xs font-bold active:scale-95"
                      aria-label={`Increase ${item.name}`}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={10} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => addItem(item)}
                    className="h-6 px-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-md shadow-2xs gap-0.5 shrink-0 active:scale-95 transition-all"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={11} />
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

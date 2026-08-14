import type { MenuItem } from '../../../types';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { LazyImage } from '../../ui/lazy-image';
import { Badge } from '../../ui/badge';
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
              onClick={() => addItem(item)}
              className={`rounded-lg border bg-card p-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99] select-none ${
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
                    <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/50 text-muted-foreground/40 gap-0.5">
                      <HugeiconsIcon icon={Coffee02Icon} size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-wider">RadhaCafe</span>
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <Badge className="bg-amber-600/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0 font-bold shadow-2xs flex items-center gap-0.5">
                      <HugeiconsIcon icon={StarIcon} size={8} />
                      <span>Special</span>
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white/20">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Category & Name */}
                <div className="space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    {item.category?.name || 'Special'}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-tight min-h-[1.75rem] sm:min-h-[2rem]">
                    {item.name}
                  </h4>
                  <div className="pt-0.5">
                    <span className="font-extrabold text-xs sm:text-sm text-cinnamon font-heading">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Dedicated Full-Width Action Row */}
              <div className="pt-2 mt-1.5 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                {qtyInCart > 0 ? (
                  <div className="w-full h-7 bg-cinnamon text-white rounded-lg flex items-center justify-between px-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart - 1);
                      }}
                      className="h-6 w-7 rounded flex items-center justify-center text-white hover:bg-black/15 active:scale-90 transition-all"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={12} />
                    </button>
                    <span className="text-xs font-bold font-mono text-white select-none leading-none">
                      {qtyInCart}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart + 1);
                      }}
                      className="h-6 w-7 rounded flex items-center justify-center text-white hover:bg-black/15 active:scale-90 transition-all"
                      aria-label={`Increase ${item.name}`}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item);
                    }}
                    className="w-full h-7 bg-amber-600/15 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-[0.98] border border-amber-600/30 hover:border-amber-600"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={13} />
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

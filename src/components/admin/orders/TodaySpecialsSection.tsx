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

      {/* Responsive Grid — 8 cols laptop, 6 cols tablet, 4 cols mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 lg:gap-2">
        {specials.map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const hasImage = Boolean(item.image_url);

          return (
            <div
              key={item.id}
              onClick={() => addItem(item)}
              className={`group/card rounded-lg border bg-card p-1 sm:p-1.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99] select-none ${
                qtyInCart > 0 ? 'border-amber-500/60 ring-1 ring-amber-400/20 bg-amber-500/[0.02]' : 'border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <div>
                {/* Item Image Container */}
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
                    <Badge className="bg-amber-600/95 backdrop-blur-xs text-white text-[7.5px] sm:text-[8.5px] px-1 py-0 font-bold shadow-xs flex items-center gap-0.5 rounded leading-tight">
                      <HugeiconsIcon icon={StarIcon} size={8} />
                      <span className="truncate">Special</span>
                    </Badge>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-1 right-1 bg-amber-600 text-white text-[9px] font-mono font-bold h-4.5 min-w-[18px] px-0.5 rounded-full flex items-center justify-center shadow-md border border-white/30">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Category & Name */}
                <div className="space-y-0.5 pt-1">
                  <span className="text-[8px] sm:text-[9px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider truncate block">
                    {item.category?.name || 'Special'}
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
                  <div className="w-full h-6 sm:h-6.5 bg-amber-600 text-white rounded-md flex items-center justify-between px-0.5 shadow-2xs">
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
                    className="w-full h-6 sm:h-6.5 bg-amber-600/10 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white font-bold text-[10px] sm:text-[11px] rounded-md transition-all flex items-center justify-center gap-0.5 active:scale-[0.98] border border-amber-600/20 hover:border-amber-600"
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

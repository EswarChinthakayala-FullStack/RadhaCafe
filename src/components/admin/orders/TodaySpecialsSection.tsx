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

      {/* Responsive Grid — 7 cols desktop, 6 cols tablet, 4 cols tablet-sm, 3 cols mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7 gap-1.5 sm:gap-2">
        {specials.map((item) => {
          const qtyInCart = getItemQuantityInCart(item.id);
          const hasImage = Boolean(item.image_url);

          return (
            <div
              key={item.id}
              onClick={() => addItem(item)}
              className={`group/card rounded-lg border bg-card p-1 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99] select-none ${
                qtyInCart > 0 ? 'border-amber-500/60 ring-1 ring-amber-400/20 bg-amber-500/[0.02]' : 'border-amber-500/30 hover:border-amber-500/60'
              }`}
            >
              <div>
                {/* Item Image — compact 4:3 ratio */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-white border border-border/40 flex items-center justify-center">
                  {hasImage ? (
                    <LazyImage
                      src={item.image_url!}
                      alt={item.name}
                      containerClassName="bg-white"
                      className="h-full w-full object-contain p-0.5"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/40 text-muted-foreground/40 gap-0.5">
                      <HugeiconsIcon icon={Coffee02Icon} size={16} />
                      <span className="text-[7px] font-bold uppercase tracking-wider">RadhaCafe</span>
                    </div>
                  )}
                  {/* System Priority Badges — Icon only */}
                  <div className="absolute top-0.5 left-0.5 z-10 pointer-events-none">
                    <div
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-amber-600/95 text-white flex items-center justify-center shadow-xs border border-white/20"
                      title="Today's Special"
                    >
                      <HugeiconsIcon icon={StarIcon} size={9} className="shrink-0" />
                    </div>
                  </div>
                  {qtyInCart > 0 && (
                    <div className="absolute top-0.5 right-0.5 bg-amber-600 text-white text-[8px] font-mono font-bold h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center shadow-md border border-white/30">
                      {qtyInCart}
                    </div>
                  )}
                </div>

                {/* Category & Name — compact with 2-line name */}
                <div className="pt-0.5 px-0.5">
                  <span className="text-[7px] sm:text-[8px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider truncate block leading-tight">
                    {item.category?.name || 'Special'}
                  </span>
                  <h4 className="font-bold text-[10px] sm:text-[11px] text-foreground line-clamp-2 leading-snug group-hover/card:text-cinnamon transition-colors min-h-[2lh]" title={item.name}>
                    {item.name}
                  </h4>
                  <span className="font-extrabold text-[10px] sm:text-[11px] text-cinnamon font-heading leading-none">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </div>

              {/* Compact Action Row */}
              <div className="pt-0.5 mt-0.5 border-t border-border/40 px-0.5 pb-0.5" onClick={(e) => e.stopPropagation()}>
                {qtyInCart > 0 ? (
                  <div className="w-full h-5.5 sm:h-6 bg-amber-600 text-white rounded flex items-center justify-between px-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart - 1);
                      }}
                      className="h-4.5 w-4.5 sm:w-5 rounded flex items-center justify-center text-white hover:bg-black/20 active:scale-90 transition-all"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={10} />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-bold font-mono text-white select-none leading-none">
                      {qtyInCart}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, qtyInCart + 1);
                      }}
                      className="h-4.5 w-4.5 sm:w-5 rounded flex items-center justify-center text-white hover:bg-black/20 active:scale-90 transition-all"
                      aria-label={`Increase ${item.name}`}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item);
                    }}
                    className="w-full h-5.5 sm:h-6 bg-amber-600/10 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white font-bold text-[9px] sm:text-[10px] rounded transition-all flex items-center justify-center gap-0.5 active:scale-[0.98] border border-amber-600/20 hover:border-amber-600"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={10} />
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

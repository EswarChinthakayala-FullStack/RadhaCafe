import { useState, useRef, useEffect } from 'react';
import { useMenuItems } from '../../../hooks/useMenuItems';
import { useCategories } from '../../../hooks/useCategories';
import { useCart } from '../../../hooks/useCart';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Loader } from '../../shared/Loader';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  Coffee02Icon,
  PlusSignIcon,
  MinusSignIcon,
  Image01Icon,
  Tag01Icon,
  CakeIcon,
  PackageIcon,
  GridIcon,
  BubbleTeaIcon,
  DrinkIcon,
  GlassWaterIcon,
  CupSodaIcon,
  CookieIcon,
  Bread01Icon,
  Dish01Icon,
  RiceBowl01Icon,
  Pizza01Icon,
  Hamburger01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

const ICON_MAP: Record<string, any> = {
  Coffee02Icon,
  BubbleTeaIcon,
  DrinkIcon,
  GlassWaterIcon,
  CupSodaIcon,
  CakeIcon,
  CookieIcon,
  Bread01Icon,
  Dish01Icon,
  RiceBowl01Icon,
  Pizza01Icon,
  Hamburger01Icon,
  Tag01Icon,
  PackageIcon,
  GridIcon,
};

export function OrderItemSelector() {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data: menuItems, isLoading: isMenuItemsLoading } = useMenuItems(true);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { addItem, updateQuantity, items: cartItems } = useCart();

  const categoryMap = new Map(categories?.map((c) => [c.id, c]));

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [categories]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const filteredItems = menuItems?.filter((item) => {
    const matchesCategory = !selectedCategoryId || item.category_id === selectedCategoryId;
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (menuItemId: string) => {
    const cartItem = cartItems.find((i) => i.menuItem.id === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  if (isMenuItemsLoading || isCategoriesLoading) {
    return <Loader label="Loading POS menu catalog..." />;
  }

  return (
    <div className="space-y-4 min-w-0 max-w-full overflow-x-hidden">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={15} />
        </div>
        <Input
          placeholder="Search menu items by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card pl-9 pr-9 text-xs h-10 rounded-md"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        )}
      </div>

      {/* Category Tabs Navigation — Scrollable with Drag & Arrows */}
      <div className="relative group/tabs w-full min-w-0 max-w-full overflow-hidden">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-4 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-card border border-border/80 shadow-md flex items-center justify-center p-0 text-foreground hover:bg-secondary active:scale-95 transition-all shrink-0"
            aria-label="Scroll Left"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="shrink-0" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className="w-full min-w-0 max-w-full overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-2 min-w-max px-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`snap-start shrink-0 min-w-max px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${selectedCategoryId === null
                ? 'bg-cinnamon text-white shadow-xs'
                : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
            >
              <HugeiconsIcon icon={GridIcon} size={13} />
              <span>All Items ({menuItems?.length || 0})</span>
            </button>
            {categories?.map((cat) => {
              const IconComp = ICON_MAP[(cat as any).icon_name || ''] || Tag01Icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`snap-start shrink-0 min-w-max px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${selectedCategoryId === cat.id
                    ? 'bg-cinnamon text-white shadow-xs'
                    : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50'
                    }`}
                >
                  <HugeiconsIcon icon={IconComp} size={13} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-4 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-card border border-border/80 shadow-md flex items-center justify-center p-0 text-foreground hover:bg-secondary active:scale-95 transition-all shrink-0"
            aria-label="Scroll Right"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="shrink-0" />
          </button>
        )}
      </div>

      {/* Menu Item Grid — 2, 3, 4 responsive grid */}
      {!filteredItems || filteredItems.length === 0 ? (
        <div className="p-10 text-center bg-card rounded-md border border-dashed border-border/80 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
            <HugeiconsIcon icon={Coffee02Icon} size={20} />
          </div>
          <p className="text-xs font-bold text-foreground">No available menu items found</p>
          <p className="text-[11px] text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            const hasImage = item.image_url && !failedImages[item.id];
            const category = categoryMap.get(item.category_id);
            const categoryName = category?.name;
            const CategoryIconComp = ICON_MAP[(category as any)?.icon_name || ''] || Tag01Icon;

            return (
              <div
                key={item.id}
                onClick={() => addItem(item)}
                className={`group relative p-2.5 sm:p-3 rounded-md border bg-card cursor-pointer transition-all duration-200 flex flex-col justify-between select-none shadow-xs ${qty > 0
                  ? 'border-cinnamon ring-1 ring-cinnamon/30 bg-cinnamon/5'
                  : 'border-border/80 hover:border-cinnamon/60 hover:shadow-md'
                  }`}
              >
                {qty > 0 && (
                  <Badge className="absolute top-2 right-2 bg-cinnamon text-white font-bold font-mono text-[11px] h-6 w-6 rounded-full p-0 flex items-center justify-center shadow-md z-20">
                    {qty}
                  </Badge>
                )}

                <div className="space-y-2">
                  {/* Thumbnail */}
                  <div className="w-full h-20 sm:h-24 rounded-md overflow-hidden bg-secondary/40 border border-border/60 flex items-center justify-center relative p-1.5">
                    {hasImage ? (
                      <div className="w-full h-full bg-white rounded-md flex items-center justify-center p-0.5 overflow-hidden shadow-2xs">
                        <img
                          src={item.image_url!}
                          alt={item.name}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                        <HugeiconsIcon icon={Image01Icon} size={22} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {categoryName && (
                      <div className="inline-flex items-center gap-1 text-[9px] font-bold text-cinnamon bg-cinnamon/10 px-1.5 py-0.5 rounded-md border border-cinnamon/20 max-w-full">
                        <HugeiconsIcon icon={CategoryIconComp} size={10} className="shrink-0" />
                        <span className="truncate max-w-[90px] sm:max-w-[110px]">{categoryName}</span>
                      </div>
                    )}
                    <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-cinnamon transition-colors">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 leading-tight">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/40 flex justify-between items-center">
                  <span className="font-bold text-primary text-xs sm:text-sm">
                    {formatCurrency(item.price)}
                  </span>

                  {qty > 0 ? (
                    <div className="flex items-center gap-1 bg-cinnamon/10 p-0.5 rounded-lg border border-cinnamon/30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, qty - 1);
                        }}
                        className="w-6 h-6 rounded-md bg-cinnamon text-white flex items-center justify-center hover:bg-cinnamon/90 transition-colors"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={12} />
                      </button>

                      <span className="w-5 text-center font-bold font-mono text-xs text-cinnamon">
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                        }}
                        className="w-6 h-6 rounded-md bg-cinnamon text-white flex items-center justify-center hover:bg-cinnamon/90 transition-colors"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <HugeiconsIcon icon={PlusSignIcon} size={12} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="xs"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(item);
                      }}
                      className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-[10px] h-7 px-2.5 gap-1 rounded-lg"
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
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useMenuItems } from '../../../hooks/useMenuItems';
import { useCategories } from '../../../hooks/useCategories';
import { useTodaysSpecials, useBestSellingItems } from '../../../hooks/useMenuRecommendations';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Loader } from '../../shared/Loader';
import { LazyImage } from '../../ui/lazy-image';
import { TodaySpecialsSection } from './TodaySpecialsSection';
import { BestSellersSection } from './BestSellersSection';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  Coffee02Icon,
  PlusSignIcon,
  MinusSignIcon,
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
  FireIcon,
  StarIcon,
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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const { data: menuItems, isLoading: isMenuItemsLoading } = useMenuItems(true);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: todaysSpecials } = useTodaysSpecials();
  const { data: bestSellers, isLoading: isBestSellersLoading } = useBestSellingItems(6);
  const { addItem, updateQuantity, items: cartItems } = useCart();

  const categoryMap = new Map(categories?.map((c) => [c.id, c]));
  const bestSellerIdSet = new Set(bestSellers?.map((b) => b.id));
  const todayStr = new Date().toISOString().split('T')[0];

  // Global keyboard shortcut: Press '/' to focus search input, 'Escape' to blur/clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearch('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Multi-field search across Name, Description, Category Name, and Item Tags
  const filteredItems = menuItems
    ?.filter((item) => {
      const matchesCategory = !selectedCategoryId || item.category_id === selectedCategoryId;
      const category = categoryMap.get(item.category_id);
      const categoryName = category?.name || '';
      const tagsStr = (item.tags || []).join(' ');

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        categoryName.toLowerCase().includes(query) ||
        tagsStr.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    })
    ?.sort((a, b) => {
      // Prioritize Today's Special -> Best Seller -> Alphabetical
      const aIsSpecial = a.daily_special_date === todayStr;
      const bIsSpecial = b.daily_special_date === todayStr;
      if (aIsSpecial && !bIsSpecial) return -1;
      if (!aIsSpecial && bIsSpecial) return 1;

      const aIsBest = bestSellerIdSet.has(a.id);
      const bIsBest = bestSellerIdSet.has(b.id);
      if (aIsBest && !bIsBest) return -1;
      if (!aIsBest && bIsBest) return 1;

      return a.name.localeCompare(b.name);
    });

  const getCartQuantity = (menuItemId: string) => {
    const cartItem = cartItems.find((i) => i.menuItem.id === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const isSearching = Boolean(search.trim());

  if (isMenuItemsLoading || isCategoriesLoading) {
    return <Loader label="Loading POS menu catalog..." />;
  }

  // Calculate available item counts per category for the chips
  const categoryCounts = new Map<string, number>();
  (menuItems || []).forEach((item) => {
    if (item.category_id) {
      categoryCounts.set(item.category_id, (categoryCounts.get(item.category_id) || 0) + 1);
    }
  });

  return (
    <div className="space-y-0 min-w-0 max-w-full">
      {/* ── Sticky Search + Category Area ── */}
      <div className="sticky top-0 z-20 bg-background pb-2.5 pt-0.5 space-y-2.5">
        {/* Search Input with [/] Shortcut */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <Input
            ref={searchInputRef}
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card pl-9 pr-12 sm:pr-14 text-xs sm:text-sm h-10 sm:h-11 rounded-xl shadow-2xs border-border/80 focus-visible:ring-cinnamon/30"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-secondary/80 border border-border/60 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Category Chips Navigation — Scrollable with Drag & Arrows */}
        <div className="relative group/tabs w-full min-w-0 max-w-full overflow-hidden">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-card border border-border/80 shadow-md flex items-center justify-center p-0 text-foreground hover:bg-secondary active:scale-95 transition-all shrink-0"
              aria-label="Scroll categories left"
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
            className="w-full min-w-0 max-w-full overflow-x-auto touch-pan-x overscroll-x-contain py-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-1.5 min-w-max px-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`snap-start shrink-0 min-w-max px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
                  selectedCategoryId === null
                    ? 'bg-cinnamon text-white shadow-xs'
                    : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50'
                }`}
              >
                <HugeiconsIcon icon={GridIcon} size={13} />
                <span>All Items</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    selectedCategoryId === null ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {menuItems?.length || 0}
                </span>
              </button>

              {categories?.map((cat) => {
                const IconComp = ICON_MAP[(cat as any).icon_name || ''] || Tag01Icon;
                const count = categoryCounts.get(cat.id) || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`snap-start shrink-0 min-w-max px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
                      selectedCategoryId === cat.id
                        ? 'bg-cinnamon text-white shadow-xs'
                        : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50'
                    }`}
                  >
                    <HugeiconsIcon icon={IconComp} size={13} />
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                          selectedCategoryId === cat.id ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-card border border-border/80 shadow-md flex items-center justify-center p-0 text-foreground hover:bg-secondary active:scale-95 transition-all shrink-0"
              aria-label="Scroll categories right"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* ── Smart Discovery: Today's Specials & Best Sellers (Visible when All Items selected & no active search) ── */}
      {!isSearching && selectedCategoryId === null && (
        <div className="space-y-3 pb-3">
          {/* Today's Specials Priority Section */}
          {todaysSpecials && todaysSpecials.length > 0 && (
            <TodaySpecialsSection specials={todaysSpecials} />
          )}

          {/* Best Sellers Section */}
          <BestSellersSection bestSellers={bestSellers || []} isLoading={isBestSellersLoading} />
        </div>
      )}

      {/* ── Search Results Label ── */}
      {isSearching && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Search results for "<span className="text-foreground">{search.trim()}</span>"
            {filteredItems && <span className="ml-1 text-muted-foreground/70">({filteredItems.length} found)</span>}
          </p>
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-[11px] font-bold text-cinnamon hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ── Main Menu Item Grid — Responsive across all device breakpoints ── */}
      {!filteredItems || filteredItems.length === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-card rounded-xl border border-dashed border-border/80 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
            <HugeiconsIcon icon={Coffee02Icon} size={20} />
          </div>
          <p className="text-xs font-bold text-foreground">No available menu items found</p>
          <p className="text-[11px] text-muted-foreground">Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            const hasImage = item.image_url && !failedImages[item.id];
            const category = categoryMap.get(item.category_id);
            const categoryName = category?.name;

            const isTodaySpec = item.daily_special_date === todayStr;
            const isBestSell = bestSellerIdSet.has(item.id);
            const tags = item.tags || [];

            return (
              <div
                key={item.id}
                onClick={() => addItem(item)}
                className={`group/card rounded-xl border bg-card p-2 sm:p-2.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative cursor-pointer active:scale-[0.99] select-none ${
                  qty > 0 ? 'border-cinnamon/60 ring-1 ring-cinnamon/20 bg-cinnamon/[0.02]' : 'border-border/80 hover:border-cinnamon/40'
                }`}
              >
                <div className="space-y-1 sm:space-y-1.5">
                  {/* Item Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/40">
                    {hasImage ? (
                      <LazyImage
                        src={item.image_url!}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover/card:scale-[1.03] transition-transform duration-300"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/50 text-muted-foreground/40 gap-1">
                        <HugeiconsIcon icon={Coffee02Icon} size={22} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">RadhaCafe</span>
                      </div>
                    )}

                    {/* System Priority Badges */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                      {isTodaySpec && (
                        <Badge className="bg-amber-600/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 font-bold shadow-xs flex items-center gap-0.5">
                          <HugeiconsIcon icon={StarIcon} size={9} />
                          <span>Special</span>
                        </Badge>
                      )}
                      {isBestSell && !isTodaySpec && (
                        <Badge className="bg-cinnamon/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 font-bold shadow-xs flex items-center gap-0.5">
                          <HugeiconsIcon icon={FireIcon} size={9} />
                          <span>Popular</span>
                        </Badge>
                      )}
                    </div>

                    {/* Cart Quantity Overlay Badge */}
                    {qty > 0 && (
                      <div className="absolute top-1.5 right-1.5 bg-cinnamon text-white text-[10px] font-mono font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-md border border-white/20">
                        {qty}
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                        {categoryName || 'Menu Item'}
                      </span>

                      {/* Manual Tags */}
                      {tags.length > 0 && (
                        <span className="text-[8px] sm:text-[9px] font-semibold text-cinnamon/80 truncate">
                          {tags[0]}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-tight min-h-[1.75rem] sm:min-h-[2rem]">
                      {item.name}
                    </h4>

                    {/* Price Tag */}
                    <div className="pt-0.5">
                      <span className="font-extrabold text-xs sm:text-sm text-cinnamon font-heading">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dedicated Full-Width Action Row — 100% overflow-proof and touch-friendly */}
                <div className="pt-2 mt-1.5 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  {qty > 0 ? (
                    <div className="w-full h-7 bg-cinnamon text-white rounded-lg flex items-center justify-between px-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, qty - 1);
                        }}
                        className="h-6 w-7 rounded flex items-center justify-center text-white hover:bg-black/15 active:scale-90 transition-all"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={12} />
                      </button>
                      <span className="text-xs font-bold font-mono text-white select-none leading-none">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, qty + 1);
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
                      className="w-full h-7 bg-cinnamon/10 hover:bg-cinnamon text-cinnamon hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-[0.98] border border-cinnamon/20 hover:border-cinnamon"
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
      )}
    </div>
  );
}

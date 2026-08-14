import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { useTodaysSpecials, useBestSellingItems } from '../../hooks/useMenuRecommendations';
import { ROUTES } from '../../constants/routes';
import { ScrollReveal } from '../shared/ScrollReveal';
import { MenuItemCard } from '../menu/MenuItemCard';
import { MenuItemDetailDialog } from '../menu/MenuItemDetailDialog';
import { MenuSkeleton } from '../menu/MenuSkeleton';
import { MenuErrorState } from '../menu/MenuErrorState';
import { MenuEmptyState } from '../menu/MenuEmptyState';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, SparklesIcon, GridTableIcon, ListViewIcon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../types';

export function MenuHighlights() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('grid');

  const { data: categories } = useCategories();
  const { data: allItems, isLoading: loadingAll, isError, refetch } = useMenuItems(true);
  const { data: todaysSpecials } = useTodaysSpecials();
  const { data: bestSellers } = useBestSellingItems(6);

  // Algorithmic curation: blend specials, bestsellers, items with images & category diversity
  const curatedItems = useMemo(() => {
    if (!allItems || allItems.length === 0) return [];

    const specialIds = new Set((todaysSpecials || []).map((s) => s.id));
    const bestSellerIds = new Set((bestSellers || []).map((b) => b.id));

    // Enrich items with live badges
    const enriched = allItems.map((item) => ({
      ...item,
      is_today_special: specialIds.has(item.id) || !!item.is_today_special,
      is_best_seller: bestSellerIds.has(item.id) || !!item.is_best_seller,
    }));

    // Filter by category tab
    if (selectedCategory === 'specials') {
      return enriched.filter((i) => i.is_today_special || i.is_best_seller);
    }
    if (selectedCategory !== 'all') {
      return enriched.filter((item) => item.category_id === selectedCategory);
    }

    // Curated prioritization for 'all':
    // 1. Specials first
    // 2. Best sellers next
    // 3. Items with images
    // 4. Balanced categories
    const sorted = [...enriched].sort((a, b) => {
      if (a.is_today_special && !b.is_today_special) return -1;
      if (!a.is_today_special && b.is_today_special) return 1;
      if (a.is_best_seller && !b.is_best_seller) return -1;
      if (!a.is_best_seller && b.is_best_seller) return 1;
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
      return 0;
    });

    return sorted.slice(0, 8);
  }, [allItems, todaysSpecials, bestSellers, selectedCategory]);

  const hasSpecials = (todaysSpecials && todaysSpecials.length > 0) || (bestSellers && bestSellers.length > 0);

  return (
    <section
      id="menu"
      className="py-20 sm:py-28 bg-[#160B07] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Menu Highlights"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div className="space-y-2.5 max-w-xl">
              <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
                Handcrafted & Curated
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                Signature{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">Collection</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                Discover guest favorites, traditional filter brews, and daily specials made fresh with artisanal care.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle (Grid / Carousel) */}
              <div
                className="flex items-center p-1 rounded-full bg-[#1C100B] border border-[#3E2519] shadow-inner"
                role="group"
                aria-label="Menu layout view toggle"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#E5A88B] text-[#140A06] shadow-md'
                      : 'text-cream/60 hover:text-cream hover:bg-white/5'
                  }`}
                  aria-label="Grid layout view"
                  aria-pressed={viewMode === 'grid'}
                  title="Grid view"
                >
                  <HugeiconsIcon icon={GridTableIcon} size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('carousel')}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    viewMode === 'carousel'
                      ? 'bg-[#E5A88B] text-[#140A06] shadow-md'
                      : 'text-cream/60 hover:text-cream hover:bg-white/5'
                  }`}
                  aria-label="Carousel slide view"
                  aria-pressed={viewMode === 'carousel'}
                  title="Carousel view"
                >
                  <HugeiconsIcon icon={ListViewIcon} size={15} />
                </button>
              </div>

              <Link
                to={ROUTES.PUBLIC.MENU}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-xs font-bold text-white transition-all shadow-md hover:scale-105 shrink-0"
              >
                <span>Full Menu</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Category Filters */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#E5A88B] text-[#140A06] shadow-md shadow-[#E5A88B]/20 scale-105'
                  : 'bg-[#1D100A] text-cream/80 hover:bg-[#2C1810] border border-[#2C1810]'
              }`}
            >
              All Highlights ({allItems?.length || 0})
            </button>

            {hasSpecials && (
              <button
                type="button"
                onClick={() => setSelectedCategory('specials')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'specials'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#140A06] shadow-md scale-105'
                    : 'bg-[#1D100A] text-amber-300 hover:bg-[#2C1810] border border-amber-500/30'
                }`}
              >
                <HugeiconsIcon icon={SparklesIcon} size={12} />
                <span>Featured & Specials</span>
              </button>
            )}

            {categories?.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#E5A88B] text-[#140A06] shadow-md shadow-[#E5A88B]/20 scale-105'
                    : 'bg-[#1D100A] text-cream/80 hover:bg-[#2C1810] border border-[#2C1810]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Menu Items Showcase */}
        {loadingAll ? (
          <MenuSkeleton />
        ) : isError ? (
          <MenuErrorState onRetry={() => refetch()} />
        ) : curatedItems.length === 0 ? (
          <MenuEmptyState />
        ) : viewMode === 'carousel' ? (
          /* Embla Carousel View with HugeIcon navigation & drag/touch swipe */
          <div className="relative px-6 sm:px-12 animate-fade-in">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6">
                {curatedItems.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="pl-4 sm:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 h-full"
                  >
                    <MenuItemCard
                      item={item}
                      onSelect={(selected) => setDetailItem(selected)}
                      className="h-full"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-[#1C100B]/90 backdrop-blur-sm border-[#3E2519] text-cream hover:bg-[#E5A88B] hover:text-[#140A06] -left-3 sm:-left-5 z-20 shadow-xl cursor-pointer" />
              <CarouselNext className="bg-[#1C100B]/90 backdrop-blur-sm border-[#3E2519] text-cream hover:bg-[#E5A88B] hover:text-[#140A06] -right-3 sm:-right-5 z-20 shadow-xl cursor-pointer" />
            </Carousel>
          </div>
        ) : (
          /* Responsive Editorial Grid View with Equal Height */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch animate-fade-in">
            {curatedItems.map((item, idx) => (
              <ScrollReveal key={item.id} direction="up" delay={0.05 * idx} className="h-full">
                <MenuItemCard
                  item={item}
                  onSelect={(selected) => setDetailItem(selected)}
                  className="h-full"
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Bottom Explore Full Menu Callout */}
        <ScrollReveal delay={0.2}>
          <div className="text-center pt-6">
            <p className="text-xs text-cream/60">
              Craving something else? View our extensive menu of hot & cold beverages, shakes, and gourmet snacks.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Item Detail Modal */}
      <MenuItemDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}

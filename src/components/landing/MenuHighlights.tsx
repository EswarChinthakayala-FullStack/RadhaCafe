import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { ROUTES } from '../../constants/routes';
import { ScrollReveal } from '../shared/ScrollReveal';
import { MenuItemCard } from '../menu/MenuItemCard';
import { MenuItemDetailDialog } from '../menu/MenuItemDetailDialog';
import { MenuSkeleton } from '../menu/MenuSkeleton';
import { MenuErrorState } from '../menu/MenuErrorState';
import { MenuEmptyState } from '../menu/MenuEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../types';

export function MenuHighlights() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const { data: categories } = useCategories();
  const { data: menuItems, isLoading, isError, refetch } = useMenuItems(true);

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems?.filter((item) => item.category_id === selectedCategory);

  const count = filteredItems?.length || 0;
  const gridClasses =
    count === 1
      ? 'max-w-xs sm:max-w-sm mx-auto grid-cols-1'
      : count === 2
      ? 'max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2'
      : 'grid sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section id="menu" className="py-20 bg-[#160B07] text-cream border-b border-[#2C1810] relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4 border-b border-[#2C1810]">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E5A88B] tracking-widest uppercase">
                Handcrafted Specialties
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream">
                Signature{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">Collection</span>
              </h2>
              <p className="text-xs sm:text-sm text-cream/70">
                Discover customer favorites brewed with artisanal care every day.
              </p>
            </div>

            <Link
              to={ROUTES.PUBLIC.MENU}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-xs font-bold text-[#140A06] transition-all shadow-md shrink-0 hover:-translate-y-0.5"
            >
              <span>Explore All Offerings</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Category Filter Tabs */}
        {categories && categories.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                    : 'bg-[#1D100A] text-cream/80 hover:bg-[#2C1810] border border-[#2C1810]'
                }`}
              >
                All Items ({menuItems?.length || 0})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                      : 'bg-[#1D100A] text-cream/80 hover:bg-[#2C1810] border border-[#2C1810]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Menu Cards Grid */}
        {isLoading ? (
          <MenuSkeleton />
        ) : isError ? (
          <MenuErrorState onRetry={() => refetch()} />
        ) : !filteredItems || filteredItems.length === 0 ? (
          <MenuEmptyState />
        ) : (
          <div className={`grid gap-6 ${gridClasses}`}>
            {filteredItems.slice(0, 8).map((item, idx) => (
              <ScrollReveal key={item.id} direction="scale" delay={0.06 * idx}>
                <MenuItemCard item={item} onSelect={(selected) => setDetailItem(selected)} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Menu Detail Modal */}
      <MenuItemDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}

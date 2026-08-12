import { useState, useMemo } from 'react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { MenuHeader } from '../../components/menu/MenuHeader';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { MenuItemDetailDialog } from '../../components/menu/MenuItemDetailDialog';
import { MenuSkeleton } from '../../components/menu/MenuSkeleton';
import { MenuErrorState } from '../../components/menu/MenuErrorState';
import { MenuEmptyState } from '../../components/menu/MenuEmptyState';
import { Input } from '../../components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../types';

export function PublicMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const { data: categories } = useCategories();
  const { data: menuItems, isLoading, isError, refetch } = useMenuItems(true);

  // Derived filtered menu items based on search and category
  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, search]);

  // Group items by category for editorial presentation
  const groupedByCategory = useMemo(() => {
    if (!categories || !filteredItems) return [];
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.id === selectedCategory);
      return [{ category: cat || { id: 'other', name: 'Specialties' }, items: filteredItems }];
    }

    const map = new Map<string, { category: any; items: MenuItem[] }>();
    categories.forEach((cat) => {
      map.set(cat.id, { category: cat, items: [] });
    });

    const uncategorized: MenuItem[] = [];
    filteredItems.forEach((item) => {
      if (item.category_id && map.has(item.category_id)) {
        map.get(item.category_id)!.items.push(item);
      } else {
        uncategorized.push(item);
      }
    });

    const result = Array.from(map.values()).filter((group) => group.items.length > 0);
    if (uncategorized.length > 0) {
      result.push({
        category: { id: 'uncategorized', name: 'Other Offerings' },
        items: uncategorized,
      });
    }

    return result;
  }, [categories, filteredItems, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Editorial Page Header */}
      <MenuHeader />

      {/* Main Menu Section */}
      <main className="flex-1 py-14 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-12">
          {/* Search Bar & Sticky Category Filter Pills */}
          <div className="sticky top-16 z-30 bg-[#1D100A]/95 backdrop-blur-xl p-4 sm:p-5 rounded-md border border-[#2C1810] shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                  <HugeiconsIcon icon={Search01Icon} size={15} />
                </div>
                <Input
                  placeholder="Search menu offerings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 bg-[#140A06] border-[#2C1810] text-cream text-xs rounded-full h-10 focus-visible:ring-[#E5A88B]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-cream/40 hover:text-cream"
                    aria-label="Clear search"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              {categories && categories.length > 0 && (
                <div
                  className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none"
                  role="tablist"
                  aria-label="Menu category filters"
                >
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'all'
                        ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                        : 'bg-[#140A06] text-cream/75 hover:text-cream hover:bg-white/5 border border-[#2C1810]'
                      }`}
                  >
                    All Items ({menuItems?.length || 0})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                          ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                          : 'bg-[#140A06] text-cream/75 hover:text-cream hover:bg-white/5 border border-[#2C1810]'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu Catalog View */}
          {isLoading ? (
            <MenuSkeleton />
          ) : isError ? (
            <MenuErrorState onRetry={() => refetch()} />
          ) : filteredItems.length === 0 ? (
            <MenuEmptyState searchQuery={search} onClearSearch={() => setSearch('')} />
          ) : (
            <div className="space-y-14">
              {groupedByCategory.map(({ category, items }) => (
                <section key={category.id} className="space-y-6">
                  {/* Category Header Bar */}
                  <div className="flex items-center gap-4 pb-2 border-b border-[#2C1810]">
                    <h2 className="font-heading font-bold text-2xl sm:text-3xl text-cream">
                      {category.name}
                    </h2>
                    <span className="h-px flex-1 bg-[#2C1810]" />
                    <span className="text-xs font-bold text-[#E5A88B]">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Menu Cards Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onSelect={(selected) => setDetailItem(selected)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Bottom Visit RadhaCafe CTA Banner */}
          <div className="mt-16 bg-[#1D100A] border border-[#2C1810] rounded-md p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={Location01Icon} size={24} />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-cream">
                Taste it Fresh at RadhaCafe
              </h3>
              <p className="text-xs sm:text-sm text-cream/70 leading-relaxed">
                Visit our Tallur cafe for authentic filter roast, artisanal lattes, and warm hospitality.
              </p>
            </div>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-xs font-bold text-[#140A06] transition-all shadow-md"
            >
              <span>Get Directions to RadhaCafe</span>
            </a>
          </div>
        </div>
      </main>

      {/* Menu Item Details Dialog */}
      <MenuItemDetailDialog item={detailItem} onClose={() => setDetailItem(null)} />

      <Footer />
    </div>
  );
}

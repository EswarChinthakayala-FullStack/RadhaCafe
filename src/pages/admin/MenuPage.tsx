import { useState, useMemo } from 'react';
import { useMenuItems, useDeleteMenuItem, useToggleMenuItemAvailability, useDuplicateMenuItem, useSetTodaySpecial } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { useBestSellingItems } from '../../hooks/useMenuRecommendations';
import { MenuSummary } from '../../components/admin/menu/MenuSummary';
import { MenuToolbar, type MenuFiltersState } from '../../components/admin/menu/MenuToolbar';
import { MenuGrid } from '../../components/admin/menu/MenuGrid';
import { MenuItemTable } from '../../components/admin/menu/MenuItemTable';
import { MenuItemForm } from '../../components/admin/menu/MenuItemForm';
import { CategoryManager } from '../../components/admin/menu/CategoryManager';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Loader } from '../../components/shared/Loader';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Coffee02Icon, Folder01Icon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../types';

export function MenuPage() {
  const { data: rawItems, isLoading: isItemsLoading } = useMenuItems(false);
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: bestSellers = [] } = useBestSellingItems(10);

  const deleteMutation = useDeleteMenuItem();
  const toggleAvailabilityMutation = useToggleMenuItemAvailability();
  const duplicateMutation = useDuplicateMenuItem();
  const setSpecialMutation = useSetTodaySpecial();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Unified Filter State
  const [filters, setFilters] = useState<MenuFiltersState>({
    search: '',
    categoryId: 'all',
    availability: 'all',
    special: 'all',
    sort: 'name_asc',
    viewMode: 'grid',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Best seller ID lookup set
  const bestSellerIdSet = useMemo(() => {
    return new Set(bestSellers.map((b) => b.id));
  }, [bestSellers]);

  // Enrich items with real dynamic best seller flag
  const enrichedItems = useMemo(() => {
    return (rawItems || []).map((item) => ({
      ...item,
      is_best_seller: bestSellerIdSet.has(item.id) || Boolean(item.is_best_seller),
    }));
  }, [rawItems, bestSellerIdSet]);

  // Filter & Sort Items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...enrichedItems];

    // Search query filter (name, description, tags, category)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((item) => {
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCategory = item.category?.name?.toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchName || matchDesc || matchCategory || matchTags;
      });
    }

    // Category filter
    if (filters.categoryId !== 'all') {
      if (filters.categoryId === 'uncategorized') {
        result = result.filter((item) => !item.category_id);
      } else {
        result = result.filter((item) => item.category_id === filters.categoryId);
      }
    }

    // Availability filter
    if (filters.availability === 'available') {
      result = result.filter((item) => item.is_available);
    } else if (filters.availability === 'unavailable') {
      result = result.filter((item) => !item.is_available);
    }

    // Specials filter
    if (filters.special === 'specials') {
      result = result.filter((item) => item.daily_special_date === todayStr);
    } else if (filters.special === 'regular') {
      result = result.filter((item) => item.daily_special_date !== todayStr);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sort === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (filters.sort === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (filters.sort === 'price_asc') {
        return a.price - b.price;
      }
      if (filters.sort === 'price_desc') {
        return b.price - a.price;
      }
      if (filters.sort === 'category') {
        const catA = a.category?.name || 'zzz';
        const catB = b.category?.name || 'zzz';
        return catA.localeCompare(catB);
      }
      if (filters.sort === 'newest') {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [enrichedItems, filters, todayStr]);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleDuplicate = (item: MenuItem) => {
    duplicateMutation.mutate(item);
  };

  const handleToggleAvailability = (item: MenuItem, available: boolean) => {
    toggleAvailabilityMutation.mutate({ id: item.id, is_available: available });
  };

  const handleToggleSpecial = (item: MenuItem, isSpecial: boolean) => {
    setSpecialMutation.mutate({ id: item.id, date: isSpecial ? todayStr : null });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const handleSummarySelect = (type: 'all' | 'available' | 'unavailable' | 'specials') => {
    if (type === 'all') {
      setFilters((prev) => ({ ...prev, availability: 'all', special: 'all' }));
    } else if (type === 'available') {
      setFilters((prev) => ({ ...prev, availability: 'available', special: 'all' }));
    } else if (type === 'unavailable') {
      setFilters((prev) => ({ ...prev, availability: 'unavailable', special: 'all' }));
    } else if (type === 'specials') {
      setFilters((prev) => ({ ...prev, special: 'specials', availability: 'all' }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      categoryId: 'all',
      availability: 'all',
      special: 'all',
      sort: 'name_asc',
      viewMode: filters.viewMode,
    });
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.categoryId !== 'all' ||
    filters.availability !== 'all' ||
    filters.special !== 'all' ||
    filters.sort !== 'name_asc';

  if (isItemsLoading || isCategoriesLoading) {
    return <Loader label="Loading RadhaCafe menu catalog..." />;
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Coffee02Icon} size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                Cafe Menu
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage RadhaCafe categories, products, pricing and availability.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-xs font-semibold h-10 px-3 sm:px-4 rounded-xl gap-1.5 justify-center flex-1 sm:flex-none border-border/80 hover:bg-secondary"
          >
            <HugeiconsIcon icon={Folder01Icon} size={15} />
            <span>Manage Categories</span>
          </Button>

          <Button
            onClick={handleCreate}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-10 px-4 sm:px-5 rounded-xl shadow-md transition-all justify-center flex-1 sm:flex-none"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>

      {/* Operational Summary Metric Cards */}
      <MenuSummary
        items={enrichedItems}
        onSelectFilter={handleSummarySelect}
        activeFilter={
          filters.availability === 'available'
            ? 'available'
            : filters.availability === 'unavailable'
            ? 'unavailable'
            : filters.special === 'specials'
            ? 'specials'
            : 'all'
        }
      />

      {/* Search, Filter & View Controls Toolbar */}
      <MenuToolbar
        filters={filters}
        categories={categories}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Product Display View (Grid or Table) */}
      {filters.viewMode === 'grid' ? (
        <MenuGrid
          items={filteredAndSortedItems}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onToggleAvailability={handleToggleAvailability}
          onToggleSpecial={handleToggleSpecial}
          onDelete={(item) => setDeletingItem(item)}
          onAddNew={handleCreate}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />
      ) : (
        <MenuItemTable
          items={filteredAndSortedItems}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onToggleAvailability={handleToggleAvailability}
          onToggleSpecial={handleToggleSpecial}
          onDelete={(item) => setDeletingItem(item)}
          onAddNew={handleCreate}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />
      )}

      {/* Create / Edit Menu Item Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-card rounded-2xl border border-border/80 p-5 sm:p-7 shadow-2xl space-y-5">
          <DialogHeader className="p-0 border-b border-border/80 pb-3 text-left">
            <DialogTitle className="font-bold text-base sm:text-lg font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Coffee02Icon} size={20} className="text-cinnamon" />
              <span>{editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure product details, category assignment, price, image, and availability status.
            </DialogDescription>
          </DialogHeader>

          <MenuItemForm
            initialData={editingItem}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Categories Modal Dialog */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto no-scrollbar bg-card rounded-2xl border border-border/80 p-5 sm:p-7 shadow-2xl space-y-4">
          <DialogHeader className="p-0 border-b border-border/80 pb-3 text-left">
            <DialogTitle className="font-bold text-base sm:text-lg font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Folder01Icon} size={20} className="text-cinnamon" />
              <span>Manage Menu Categories</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create, reorder, rename, or remove categories. Category display order is reflected directly in POS and Menu navigation.
            </DialogDescription>
          </DialogHeader>

          <CategoryManager />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="bg-card rounded-xl border border-border/80 p-6 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-heading text-foreground">
              Delete "{deletingItem?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove this item from the RadhaCafe catalog? Historical orders and receipts will retain their snapshot item details without disruption.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-9 rounded-xl text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-9 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-xl"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

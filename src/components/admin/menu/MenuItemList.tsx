import { useState } from 'react';
import { useMenuItems, useDeleteMenuItem, useToggleMenuItemAvailability } from '../../../hooks/useMenuItems';
import { useCategories } from '../../../hooks/useCategories';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Loader } from '../../shared/Loader';
import { LazyImage } from '../../ui/lazy-image';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Coffee02Icon,
  Edit01Icon,
  Delete02Icon,
  Cancel01Icon,
  Image01Icon,
  FilterIcon,
} from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../../types';

interface MenuItemListProps {
  onEdit: (item: MenuItem) => void;
}

export function MenuItemList({ onEdit }: MenuItemListProps) {
  const { data: items, isLoading: isItemsLoading } = useMenuItems(false);
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteMenuItem();
  const toggleAvailabilityMutation = useToggleMenuItemAvailability();

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredItems = items?.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && item.is_available) ||
      (availabilityFilter === 'unavailable' && !item.is_available);
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesAvailability && matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      console.error('Delete menu item error:', err);
    }
  };

  const handleToggleAvailability = (item: MenuItem, checked: boolean) => {
    toggleAvailabilityMutation.mutate({ id: item.id, is_available: checked });
  };

  if (isItemsLoading) return <Loader label="Loading menu catalog..." />;

  const hasActiveFilters = search.trim() !== '' || selectedCategoryId !== 'all' || availabilityFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Filter Controls Toolbar */}
      <div className="p-4 rounded-md border border-border/80 bg-card space-y-3 shadow-sm">
        <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <HugeiconsIcon icon={FilterIcon} size={14} className="text-primary" />
          <span>FILTER MENU CATALOG</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <Input
              placeholder="Search by item name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 text-xs bg-background h-10 rounded-md"
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

          {/* Category Filter */}
          <Select value={selectedCategoryId} onValueChange={(val: string | null) => val && setSelectedCategoryId(val)}>
            <SelectTrigger className="w-full h-10 text-xs bg-background rounded-md">
              <SelectValue placeholder="All Categories">
                {selectedCategoryId === 'all'
                  ? 'All Categories'
                  : categories?.find((c) => c.id === selectedCategoryId)?.name || 'All Categories'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={availabilityFilter} onValueChange={(val: string | null) => val && setAvailabilityFilter(val)}>
            <SelectTrigger className="w-full h-10 text-xs bg-background rounded-md">
              <SelectValue placeholder="All Statuses">
                {availabilityFilter === 'all'
                  ? 'All Statuses'
                  : availabilityFilter === 'available'
                    ? 'Available Only'
                    : 'Unavailable Only'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
              <SelectItem value="unavailable">Unavailable Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-1 border-t border-border/40">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setSearch('');
                setSelectedCategoryId('all');
                setAvailabilityFilter('all');
              }}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7 rounded-lg px-2"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} />
              <span>Clear Active Filters</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Catalog View: Responsive Table for Desktop & Cards for Mobile */}
      <div className="border border-border/80 rounded-md overflow-hidden bg-card shadow-sm">
        {filteredItems && filteredItems.length > 0 ? (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="p-3.5 pl-4">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && !failedImages[item.id] ? (
                            <LazyImage
                              src={item.image_url}
                              alt={item.name}
                              onError={() => handleImageError(item.id)}
                              containerClassName="w-11 h-11 rounded-md border border-border/80 shrink-0 shadow-xs"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-md border border-dashed border-border bg-secondary/40 flex items-center justify-center text-muted-foreground/40 shrink-0">
                              <HugeiconsIcon icon={Image01Icon} size={18} />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground text-xs block">{item.name}</span>
                            {item.description && (
                              <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {item.category?.name ? (
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-lg">
                            {item.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px] italic">Uncategorized</span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-primary text-xs">{formatCurrency(item.price)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_available}
                            disabled={toggleAvailabilityMutation.isPending}
                            onCheckedChange={(checked) => handleToggleAvailability(item, checked)}
                            aria-label={`Toggle availability for ${item.name}`}
                          />
                          <span className={`text-[11px] font-semibold ${item.is_available ? 'text-success' : 'text-muted-foreground'}`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 pr-4 text-right space-x-2">
                        <Button size="xs" variant="outline" onClick={() => onEdit(item)} className="gap-1 text-xs h-8 rounded-lg px-2.5">
                          <HugeiconsIcon icon={Edit01Icon} size={13} />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 gap-1 text-xs h-8 rounded-lg px-2.5"
                          onClick={() => setDeletingItem(item)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} />
                          <span>Delete</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (<640px) */}
            <div className="sm:hidden divide-y divide-border">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3 bg-card hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-3">
                    {item.image_url && !failedImages[item.id] ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={() => handleImageError(item.id)}
                        className="w-14 h-14 rounded-md object-cover border border-border/80 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md border border-dashed border-border bg-secondary/40 flex items-center justify-center text-muted-foreground/40 shrink-0">
                        <HugeiconsIcon icon={Image01Icon} size={20} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                        <span className="font-bold text-primary text-xs shrink-0">{formatCurrency(item.price)}</span>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                      )}

                      <div>
                        {item.category?.name ? (
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md">
                            {item.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">Uncategorized</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_available}
                        disabled={toggleAvailabilityMutation.isPending}
                        onCheckedChange={(checked) => handleToggleAvailability(item, checked)}
                        aria-label={`Toggle availability for ${item.name}`}
                      />
                      <span className={`text-[10px] font-semibold ${item.is_available ? 'text-success' : 'text-muted-foreground'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="xs" variant="outline" onClick={() => onEdit(item)} className="gap-1 text-xs h-7 rounded-lg">
                        <HugeiconsIcon icon={Edit01Icon} size={12} />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 gap-1 text-xs h-7 rounded-lg"
                        onClick={() => setDeletingItem(item)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Custom Empty State */
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
              <HugeiconsIcon icon={Coffee02Icon} size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                {hasActiveFilters ? 'No menu items found' : 'No menu items cataloged yet'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {hasActiveFilters
                  ? 'Try a different search query or clear your category / status filters.'
                  : 'Click Add Menu Item at the top to create your first offering.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setSearch('');
                  setSelectedCategoryId('all');
                  setAvailabilityFilter('all');
                }}
                className="h-8 rounded-md text-xs font-semibold"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Item Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="bg-card rounded-md border border-border p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-heading text-foreground">
              Delete Menu Item "{deletingItem?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will remove the item from active menu listings. Historical customer receipts containing this item remain completely untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 rounded-md text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-9 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-md"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

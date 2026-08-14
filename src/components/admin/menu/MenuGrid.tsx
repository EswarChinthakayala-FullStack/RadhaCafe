import { MenuItemCard } from './MenuItemCard';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, PlusSignIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../../types';

interface MenuGridProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem, available: boolean) => void;
  onToggleSpecial: (item: MenuItem, isSpecial: boolean) => void;
  onDelete: (item: MenuItem) => void;
  onAddNew: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function MenuGrid({
  items,
  onEdit,
  onDuplicate,
  onToggleAvailability,
  onToggleSpecial,
  onDelete,
  onAddNew,
  onResetFilters,
  isFiltered,
}: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-xl border border-dashed border-border/80 bg-card space-y-4">
        <div className="w-14 h-14 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
          <HugeiconsIcon icon={Coffee02Icon} size={28} />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-bold text-base text-foreground font-heading">
            {isFiltered ? 'No matching menu items' : 'No menu items yet'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isFiltered
              ? 'Try modifying your search or clearing active filters to see more products.'
              : 'Add your first RadhaCafe menu item to begin building the operational catalog.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs font-semibold rounded-lg gap-1.5 h-9"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} />
              <span>Clear Filters</span>
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={onAddNew}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-lg gap-1.5 h-9 px-4 shadow-sm"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onToggleAvailability={onToggleAvailability}
          onToggleSpecial={onToggleSpecial}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

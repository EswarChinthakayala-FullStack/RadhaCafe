import { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  FilterIcon,
  Sorting01Icon,
  RefreshIcon,
  GridIcon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';
import type { Category } from '../../../types';

export interface MenuFiltersState {
  search: string;
  categoryId: string;
  availability: 'all' | 'available' | 'unavailable';
  special: 'all' | 'specials' | 'regular';
  sort: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'category' | 'newest';
  viewMode: 'grid' | 'table';
}

interface MenuToolbarProps {
  filters: MenuFiltersState;
  categories: Category[];
  onFilterChange: (filters: MenuFiltersState) => void;
  onResetFilters: () => void;
}

export function MenuToolbar({
  filters,
  categories,
  onFilterChange,
  onResetFilters,
}: MenuToolbarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.categoryId !== 'all' ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0) +
    (filters.special !== 'all' ? 1 : 0) +
    (filters.sort !== 'name_asc' ? 1 : 0);

  const selectedCategoryName =
    filters.categoryId === 'all'
      ? 'All Categories'
      : filters.categoryId === 'uncategorized'
      ? 'Uncategorized'
      : categories.find((c) => c.id === filters.categoryId)?.name || 'Category';

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-3">
        {/* Top Row: Search + Quick Category + Sort + View Toggle + Mobile Filter Trigger */}
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <Input
              placeholder="Search by item name, description, tags..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9 pr-8 text-xs bg-background h-10 rounded-lg w-full"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          {/* Category Select (Visible on sm+) */}
          <div className="hidden sm:flex items-center gap-2">
            <Select
              value={filters.categoryId}
              onValueChange={(val: string | null) =>
                onFilterChange({ ...filters, categoryId: val || 'all' })
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-lg min-w-[140px] max-w-[180px]">
                <SelectValue placeholder="Category">
                  <span className="truncate">{selectedCategoryName}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select
              value={filters.sort}
              onValueChange={(val: string | null) =>
                onFilterChange({
                  ...filters,
                  sort: (val || 'name_asc') as MenuFiltersState['sort'],
                })
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-lg min-w-[130px] hidden lg:flex">
                <SelectValue placeholder="Sort">
                  <span className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={Sorting01Icon} size={14} className="text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {filters.sort === 'name_asc'
                        ? 'Name (A-Z)'
                        : filters.sort === 'name_desc'
                        ? 'Name (Z-A)'
                        : filters.sort === 'price_asc'
                        ? 'Price (Low-High)'
                        : filters.sort === 'price_desc'
                        ? 'Price (High-Low)'
                        : filters.sort === 'category'
                        ? 'Category'
                        : 'Newest'}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle Buttons (Grid vs Table) */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-secondary/60 border border-border/60 shrink-0">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
              className={`p-1.5 rounded-md transition-all ${
                filters.viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <HugeiconsIcon icon={GridIcon} size={16} />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
              className={`p-1.5 rounded-md transition-all ${
                filters.viewMode === 'table'
                  ? 'bg-card text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <HugeiconsIcon icon={Menu01Icon} size={16} />
            </button>
          </div>

          {/* Mobile Filter Drawer Trigger (< md) */}
          <div className="flex sm:hidden items-center gap-2">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" className="h-10 px-3 text-xs font-bold rounded-lg gap-1.5 flex-1" />
                }
              >
                <HugeiconsIcon icon={FilterIcon} size={14} />
                <span>Filter & Sort</span>
                {activeFilterCount > 0 && (
                  <Badge className="bg-cinnamon text-white font-mono text-[10px] h-5 px-1.5 rounded-full ml-0.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-card space-y-5 overflow-y-auto no-scrollbar">
                <SheetHeader className="p-0 border-b border-border/80 pb-3 text-left">
                  <SheetTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={FilterIcon} size={18} className="text-cinnamon" />
                    <span>Filter & Sort Menu Items</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 text-xs">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Category</label>
                    <Select
                      value={filters.categoryId}
                      onValueChange={(val: string | null) =>
                        onFilterChange({ ...filters, categoryId: val || 'all' })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="Category">
                          <span>{selectedCategoryName}</span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Availability</label>
                    <Select
                      value={filters.availability}
                      onValueChange={(val: string | null) =>
                        onFilterChange({
                          ...filters,
                          availability: (val || 'all') as MenuFiltersState['availability'],
                        })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="Availability">
                          <span className="capitalize">{filters.availability}</span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specials */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Specials</label>
                    <Select
                      value={filters.special}
                      onValueChange={(val: string | null) =>
                        onFilterChange({
                          ...filters,
                          special: (val || 'all') as MenuFiltersState['special'],
                        })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="Specials">
                          <span>
                            {filters.special === 'all'
                              ? 'All Items'
                              : filters.special === 'specials'
                              ? "Today's Specials"
                              : 'Regular Items'}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="specials">Today's Specials Only</SelectItem>
                        <SelectItem value="regular">Regular Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Sort By</label>
                    <Select
                      value={filters.sort}
                      onValueChange={(val: string | null) =>
                        onFilterChange({
                          ...filters,
                          sort: (val || 'name_asc') as MenuFiltersState['sort'],
                        })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="Sort">
                          <span>
                            {filters.sort === 'name_asc'
                              ? 'Name (A-Z)'
                              : filters.sort === 'name_desc'
                              ? 'Name (Z-A)'
                              : filters.sort === 'price_asc'
                              ? 'Price (Low-High)'
                              : filters.sort === 'price_desc'
                              ? 'Price (High-Low)'
                              : filters.sort === 'category'
                              ? 'Category'
                              : 'Newest'}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                        <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                        <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={onResetFilters}
                      className="w-1/2 h-10 text-xs font-semibold rounded-lg text-destructive"
                    >
                      Reset All
                    </Button>
                    <Button
                      onClick={() => setIsMobileSheetOpen(false)}
                      className="w-1/2 h-10 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile View Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-secondary/60 border border-border/60 shrink-0">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
                className={`p-2 rounded-md ${
                  filters.viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'
                }`}
                aria-label="Grid View"
              >
                <HugeiconsIcon icon={GridIcon} size={15} />
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
                className={`p-2 rounded-md ${
                  filters.viewMode === 'table' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'
                }`}
                aria-label="Table View"
              >
                <HugeiconsIcon icon={Menu01Icon} size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Desktop Filters Row (Hidden on mobile) */}
        <div className="hidden md:grid grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-xs">
          {/* Availability Select */}
          <div>
            <Select
              value={filters.availability}
              onValueChange={(val: string | null) =>
                onFilterChange({
                  ...filters,
                  availability: (val || 'all') as MenuFiltersState['availability'],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Availability">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-semibold capitalize">{filters.availability}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="unavailable">Unavailable Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specials Select */}
          <div>
            <Select
              value={filters.special}
              onValueChange={(val: string | null) =>
                onFilterChange({
                  ...filters,
                  special: (val || 'all') as MenuFiltersState['special'],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Specials">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Specials:</span>
                    <span className="font-semibold">
                      {filters.special === 'all'
                        ? 'All'
                        : filters.special === 'specials'
                        ? "Today's Specials"
                        : 'Regular'}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="specials">Today's Specials Only</SelectItem>
                <SelectItem value="regular">Regular Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Select on Tablet/Desktop */}
          <div>
            <Select
              value={filters.sort}
              onValueChange={(val: string | null) =>
                onFilterChange({
                  ...filters,
                  sort: (val || 'name_asc') as MenuFiltersState['sort'],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Sort">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Sort:</span>
                    <span className="font-semibold">
                      {filters.sort === 'name_asc'
                        ? 'Name (A-Z)'
                        : filters.sort === 'name_desc'
                        ? 'Name (Z-A)'
                        : filters.sort === 'price_asc'
                        ? 'Price (Low-High)'
                        : filters.sort === 'price_desc'
                        ? 'Price (High-Low)'
                        : filters.sort === 'category'
                        ? 'Category'
                        : 'Newest'}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="price_asc">Price (Low-High)</SelectItem>
                <SelectItem value="price_desc">Price (High-Low)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-semibold text-[11px]">Active Filters:</span>

          {filters.search && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Search: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove search filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.categoryId !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Category: {selectedCategoryName}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, categoryId: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove category filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.availability !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="capitalize">Availability: {filters.availability}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, availability: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove availability filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.special !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>{filters.special === 'specials' ? "Today's Specials" : 'Regular Items'}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, special: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove special filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.sort !== 'name_asc' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Sort: {filters.sort}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, sort: 'name_asc' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Reset sort"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          <Button
            size="xs"
            variant="ghost"
            onClick={onResetFilters}
            className="h-7 text-xs text-destructive hover:bg-destructive/10 rounded-lg gap-1 font-semibold"
          >
            <HugeiconsIcon icon={RefreshIcon} size={12} />
            <span>Clear all</span>
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
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
} from '@hugeicons/core-free-icons';
import type { CustomerSort } from '../../../types';

export interface CustomerToolbarFilters {
  search: string;
  statusFilter: 'all' | 'due' | 'paid';
  sortBy: CustomerSort;
}

interface CustomerToolbarProps {
  filters: CustomerToolbarFilters;
  onFilterChange: (filters: CustomerToolbarFilters) => void;
  onResetFilters: () => void;
}

export function CustomerToolbar({
  filters,
  onFilterChange,
  onResetFilters,
}: CustomerToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.statusFilter !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'highest_due' ? 1 : 0);

  const getSortLabel = (sort: CustomerSort) => {
    switch (sort) {
      case 'highest_due':
        return 'Highest Due';
      case 'most_orders':
        return 'Most Orders';
      case 'highest_spent':
        return 'Highest Spend';
      case 'recent_order':
        return 'Recent Order';
      case 'name_asc':
        return 'Name (A-Z)';
      case 'name_desc':
        return 'Name (Z-A)';
      case 'oldest':
        return 'Oldest Customer';
      case 'newest':
      default:
        return 'Newest Customer';
    }
  };

  const getStatusLabel = (status: 'all' | 'due' | 'paid') => {
    switch (status) {
      case 'due':
        return 'With Outstanding';
      case 'paid':
        return 'No Dues / Paid';
      case 'all':
      default:
        return 'All Customers';
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <Input
              placeholder="Search customers by name or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 text-xs bg-background h-10 rounded-lg w-full"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          {/* Desktop Status Filter Tabs/Select */}
          <div className="hidden md:flex items-center p-1 rounded-lg bg-secondary/50 border border-border/60 gap-1 text-xs">
            {(['all', 'due', 'paid'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onFilterChange({ ...filters, statusFilter: status })}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  filters.statusFilter === status
                    ? 'bg-card text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden sm:block">
            <Select
              value={filters.sortBy}
              onValueChange={(val: string | null) =>
                onFilterChange({
                  ...filters,
                  sortBy: (val || 'highest_due') as CustomerSort,
                })
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-lg min-w-[150px]">
                <SelectValue placeholder="Sort">
                  <span className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={Sorting01Icon} size={14} className="text-muted-foreground shrink-0" />
                    <span>{getSortLabel(filters.sortBy)}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="highest_due">Highest Due First</SelectItem>
                <SelectItem value="most_orders">Most Orders</SelectItem>
                <SelectItem value="highest_spent">Highest Lifetime Spend</SelectItem>
                <SelectItem value="recent_order">Most Recent Order</SelectItem>
                <SelectItem value="newest">Newest Customer</SelectItem>
                <SelectItem value="oldest">Oldest Customer</SelectItem>
                <SelectItem value="name_asc">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filters Sheet Button (< sm) */}
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
                    <span>Filter Customers</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 text-xs">
                  {/* Status Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Account Status</label>
                    <Select
                      value={filters.statusFilter}
                      onValueChange={(val: string | null) =>
                        onFilterChange({ ...filters, statusFilter: (val || 'all') as any })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="All Customers">
                          {getStatusLabel(filters.statusFilter)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="due">With Outstanding Dues</SelectItem>
                        <SelectItem value="paid">No Outstanding / Clean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground block">Sort By</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(val: string | null) =>
                        onFilterChange({ ...filters, sortBy: (val || 'highest_due') as CustomerSort })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                        <SelectValue placeholder="Sort">
                          {getSortLabel(filters.sortBy)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="highest_due">Highest Due First</SelectItem>
                        <SelectItem value="most_orders">Most Orders</SelectItem>
                        <SelectItem value="highest_spent">Highest Lifetime Spend</SelectItem>
                        <SelectItem value="recent_order">Most Recent Order</SelectItem>
                        <SelectItem value="newest">Newest Customer</SelectItem>
                        <SelectItem value="oldest">Oldest Customer</SelectItem>
                        <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={onResetFilters}
                      className="w-1/2 h-10 text-xs font-semibold rounded-lg text-destructive"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => setIsMobileSheetOpen(false)}
                      className="w-1/2 h-10 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
                onClick={() => setSearchInput('')}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove search filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.statusFilter !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Status: {getStatusLabel(filters.statusFilter)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, statusFilter: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove status filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.sortBy !== 'highest_due' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Sort: {getSortLabel(filters.sortBy)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, sortBy: 'highest_due' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Reset sort filter"
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

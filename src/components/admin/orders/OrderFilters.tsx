import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  FilterIcon,
  Calendar01Icon,
  RefreshIcon,
  Sorting01Icon,
} from '@hugeicons/core-free-icons';
import type { OrderSort } from '../../../types';

export interface OrderFiltersState {
  search: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  datePreset: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  customDate: string;
  sort: OrderSort;
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFilterChange: (filters: OrderFiltersState) => void;
  onResetFilters: () => void;
}

export function OrderFilters({ filters, onFilterChange, onResetFilters }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  // Keep local search input in sync when parent resets
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Count active non-default filters
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.paymentStatus !== 'all' ? 1 : 0) +
    (filters.paymentMethod !== 'all' ? 1 : 0) +
    (filters.datePreset !== 'all' || filters.customDate ? 1 : 0) +
    (filters.sort !== 'newest' ? 1 : 0);

  const handleDatePresetChange = (preset: OrderFiltersState['datePreset']) => {
    onFilterChange({
      ...filters,
      datePreset: preset,
      customDate: preset === 'custom' ? filters.customDate : '',
    });
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-3">
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <Input
              placeholder="Search by order # (e.g. RC-2026...) or customer..."
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

          {/* Quick Date Range Select */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.datePreset}
              onValueChange={(val: string | null) =>
                handleDatePresetChange((val || 'all') as OrderFiltersState['datePreset'])
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-lg min-w-[130px] sm:min-w-[145px]">
                <SelectValue placeholder="Date">
                  <span className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon shrink-0" />
                    <span className="truncate">
                      {filters.datePreset === 'all'
                        ? 'All Time'
                        : filters.datePreset === 'today'
                          ? 'Today'
                          : filters.datePreset === 'yesterday'
                            ? 'Yesterday'
                            : filters.datePreset === 'week'
                              ? 'Last 7 Days'
                              : filters.datePreset === 'month'
                                ? 'This Month'
                                : filters.customDate
                                  ? formatDate(filters.customDate, 'dd MMM yyyy')
                                  : 'Custom Date'}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>

            {filters.datePreset === 'custom' && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="h-10 text-xs bg-background rounded-lg gap-1.5 px-3 shrink-0" />
                  }
                >
                  <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                  <span>{filters.customDate ? formatDate(filters.customDate, 'dd MMM yyyy') : 'Pick Date'}</span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0 rounded-xl bg-card border border-border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={filters.customDate ? new Date(filters.customDate + 'T00:00:00') : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        onFilterChange({
                          ...filters,
                          datePreset: 'custom',
                          customDate: `${yyyy}-${mm}-${dd}`,
                        });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Sort Select */}
            <Select
              value={filters.sort}
              onValueChange={(val: string | null) =>
                onFilterChange({ ...filters, sort: (val || 'newest') as OrderSort })
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-lg min-w-[130px] hidden sm:flex">
                <SelectValue placeholder="Sort">
                  <span className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={Sorting01Icon} size={14} className="text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {filters.sort === 'newest'
                        ? 'Newest First'
                        : filters.sort === 'oldest'
                          ? 'Oldest First'
                          : filters.sort === 'highest'
                            ? 'Highest Total'
                            : filters.sort === 'lowest'
                              ? 'Lowest Total'
                              : 'Largest Due'}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Total</SelectItem>
                <SelectItem value="lowest">Lowest Total</SelectItem>
                <SelectItem value="largest_due">Largest Due</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filters Sheet Button (< md) */}
            <div className="md:hidden">
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" className="h-10 px-3 text-xs font-bold rounded-lg gap-1.5" />
                  }
                >
                  <HugeiconsIcon icon={FilterIcon} size={14} />
                  <span>Filters</span>
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
                      <span>Filter & Sort Orders</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-4 text-xs">
                    {/* Sort */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground block">Sort By</label>
                      <Select
                        value={filters.sort}
                        onValueChange={(val: string | null) =>
                          onFilterChange({ ...filters, sort: (val || 'newest') as OrderSort })
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                          <SelectValue placeholder="Sort">
                            {filters.sort === 'newest'
                              ? 'Newest First'
                              : filters.sort === 'oldest'
                                ? 'Oldest First'
                                : filters.sort === 'highest'
                                  ? 'Highest Total'
                                  : filters.sort === 'lowest'
                                    ? 'Lowest Total'
                                    : 'Largest Due'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent side="bottom" alignItemWithTrigger={false}>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="highest">Highest Total</SelectItem>
                          <SelectItem value="lowest">Lowest Total</SelectItem>
                          <SelectItem value="largest_due">Largest Due</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Order Status */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground block">Order Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={(val: string | null) =>
                          onFilterChange({ ...filters, status: val || 'all' })
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                          <SelectValue placeholder="All Statuses">
                            {filters.status === 'all'
                              ? 'All Statuses'
                              : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent side="bottom" alignItemWithTrigger={false}>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground block">Payment Status</label>
                      <Select
                        value={filters.paymentStatus}
                        onValueChange={(val: string | null) =>
                          onFilterChange({ ...filters, paymentStatus: val || 'all' })
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                          <SelectValue placeholder="All Payment Statuses">
                            {filters.paymentStatus === 'all'
                              ? 'All Payment Statuses'
                              : filters.paymentStatus.toUpperCase()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent side="bottom" alignItemWithTrigger={false}>
                          <SelectItem value="all">All Payment Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="outstanding">Outstanding / Due</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground block">Payment Method</label>
                      <Select
                        value={filters.paymentMethod}
                        onValueChange={(val: string | null) =>
                          onFilterChange({ ...filters, paymentMethod: val || 'all' })
                        }
                      >
                        <SelectTrigger className="w-full h-10 bg-background rounded-lg">
                          <SelectValue placeholder="All Payment Methods">
                            {filters.paymentMethod === 'all'
                              ? 'All Payment Methods'
                              : filters.paymentMethod.toUpperCase()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent side="bottom" alignItemWithTrigger={false}>
                          <SelectItem value="all">All Payment Methods</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="pay_later">Pay Later</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Presets */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground block">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'All Time', value: 'all' },
                          { label: 'Today', value: 'today' },
                          { label: 'Yesterday', value: 'yesterday' },
                          { label: 'Last 7 Days', value: 'week' },
                          { label: 'This Month', value: 'month' },
                        ].map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => handleDatePresetChange(p.value as any)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                              filters.datePreset === p.value
                                ? 'bg-cinnamon text-white border-cinnamon shadow-xs'
                                : 'bg-secondary/40 text-foreground border-border/60 hover:bg-secondary'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
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
            </div>
          </div>
        </div>

        {/* Secondary Desktop Filters Row (Hidden on mobile) */}
        <div className="hidden md:grid grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-xs">
          {/* Order Status Select */}
          <div>
            <Select
              value={filters.status}
              onValueChange={(val: string | null) => onFilterChange({ ...filters, status: val || 'all' })}
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Order Status">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Order:</span>
                    <span className="font-semibold">
                      {filters.status === 'all'
                        ? 'All'
                        : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Order Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Select */}
          <div>
            <Select
              value={filters.paymentStatus}
              onValueChange={(val: string | null) =>
                onFilterChange({ ...filters, paymentStatus: val || 'all' })
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Payment Status">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="font-semibold">
                      {filters.paymentStatus === 'all'
                        ? 'All'
                        : filters.paymentStatus.toUpperCase()}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="outstanding">Outstanding / Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Select */}
          <div>
            <Select
              value={filters.paymentMethod}
              onValueChange={(val: string | null) =>
                onFilterChange({ ...filters, paymentMethod: val || 'all' })
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background rounded-lg w-full">
                <SelectValue placeholder="Method">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-semibold">
                      {filters.paymentMethod === 'all'
                        ? 'All'
                        : filters.paymentMethod.toUpperCase()}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="pay_later">Pay Later</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
                onClick={() => setSearchInput('')}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove search filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="capitalize">Status: {filters.status}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, status: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove status filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.paymentStatus !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="uppercase">Payment: {filters.paymentStatus}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, paymentStatus: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove payment status filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.paymentMethod !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="uppercase">Method: {filters.paymentMethod}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, paymentMethod: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove payment method filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {(filters.datePreset !== 'all' || filters.customDate) && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="capitalize">
                Date: {filters.customDate || filters.datePreset}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, datePreset: 'all', customDate: '' })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove date filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.sort !== 'newest' && (
            <Badge
              variant="outline"
              className="bg-secondary/70 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Sort: {filters.sort}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, sort: 'newest' })}
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

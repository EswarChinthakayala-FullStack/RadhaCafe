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
import { Search01Icon, Cancel01Icon, FilterIcon, Calendar01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

export interface OrderFiltersState {
  search: string;
  status: string;
  paymentMethod: string;
  datePreset: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  customDate: string;
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

  // Keep local search input in sync when reset or parent changes
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Count active non-default filters
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.paymentMethod !== 'all' ? 1 : 0) +
    (filters.datePreset !== 'all' || filters.customDate ? 1 : 0);

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
      <div className="p-4 rounded-md border border-border/80 bg-card shadow-xs space-y-3">
        {/* Desktop & Mobile Header Row */}
        <div className="flex justify-between items-center pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={FilterIcon} size={15} />
            </div>
            <span>Order Filters</span>
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold rounded-md gap-1.5" />
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
                <SheetHeader className="p-0 border-b border-border/80 pb-3">
                  <SheetTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={FilterIcon} size={18} className="text-cinnamon" />
                    <span>Filter Historical Orders</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-5 text-xs">
                  {/* Status Filter */}
                  <div>
                    <label className="block font-bold text-foreground mb-2 text-xs">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(val: string | null) =>
                        onFilterChange({ ...filters, status: val || 'all' })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-md">
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

                  {/* Payment Method Filter */}
                  <div>
                    <label className="block font-bold text-foreground mb-2 text-xs">Payment Method</label>
                    <Select
                      value={filters.paymentMethod}
                      onValueChange={(val: string | null) =>
                        onFilterChange({ ...filters, paymentMethod: val || 'all' })
                      }
                    >
                      <SelectTrigger className="w-full h-10 bg-background rounded-md">
                        <SelectValue placeholder="All Payment Methods">
                          {filters.paymentMethod === 'all'
                            ? 'All Payment Methods'
                            : filters.paymentMethod.toUpperCase()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" alignItemWithTrigger={false}>
                        <SelectItem value="all">All Payment Methods</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Preset */}
                  <div>
                    <label className="block font-bold text-foreground mb-2 text-xs">Date Filter</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'All Time', value: 'all' },
                        { label: 'Today', value: 'today' },
                        { label: 'Yesterday', value: 'yesterday' },
                        { label: 'This Week', value: 'week' },
                        { label: 'This Month', value: 'month' },
                      ].map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => handleDatePresetChange(p.value as any)}
                          className={`p-2.5 rounded-md border text-xs font-semibold transition-all ${filters.datePreset === p.value
                            ? 'bg-cinnamon text-white border-cinnamon shadow-xs'
                            : 'bg-secondary/40 text-foreground border-border/60 hover:bg-secondary'
                            }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Input with ShadCN Calendar */}
                  <div>
                    <label className="block font-bold text-foreground mb-2 text-xs">Specific Date</label>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button variant="outline" className="w-full h-10 justify-start text-xs bg-background rounded-md gap-2 px-3 font-normal" />
                        }
                      >
                        <HugeiconsIcon icon={Calendar01Icon} size={15} className="text-cinnamon" />
                        <span>{filters.customDate ? formatDate(filters.customDate, 'dd MMM yyyy') : 'Select Date from Calendar'}</span>
                      </PopoverTrigger>
                      <PopoverContent align="center" className="w-auto p-0 rounded-md bg-card border border-border shadow-md">
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
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={onResetFilters}
                      className="w-1/2 h-10 text-xs font-semibold rounded-md text-destructive"
                    >
                      Reset All
                    </Button>
                    <Button
                      onClick={() => setIsMobileSheetOpen(false)}
                      className="w-1/2 h-10 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-md"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filter Controls Grid (2-in-a-row on mobile/tablet, 4-in-a-row on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          {/* Search Input (Spans 2 columns on mobile/tablet, 1 column on desktop) */}
          <div className="relative col-span-2 lg:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
            <Input
              placeholder="Search Order # or Customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 text-xs bg-background h-10 rounded-md"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          {/* Status Select Filter (Side-by-side in 1 column) */}
          <div className="col-span-1">
            <Select
              value={filters.status}
              onValueChange={(val: string | null) => onFilterChange({ ...filters, status: val || 'all' })}
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-md w-full">
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

          {/* Payment Method Select Filter (Side-by-side in 1 column) */}
          <div className="col-span-1">
            <Select
              value={filters.paymentMethod}
              onValueChange={(val: string | null) =>
                onFilterChange({ ...filters, paymentMethod: val || 'all' })
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-md w-full">
                <SelectValue placeholder="All Payment Methods">
                  {filters.paymentMethod === 'all'
                    ? 'All Payment Methods'
                    : filters.paymentMethod.toUpperCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter Selection (Spans 2 columns on mobile/tablet, 1 column on desktop) */}
          <div className="flex gap-2 col-span-2 lg:col-span-1">
            <Select
              value={filters.datePreset}
              onValueChange={(val: string | null) =>
                handleDatePresetChange((val || 'all') as OrderFiltersState['datePreset'])
              }
            >
              <SelectTrigger className="h-10 text-xs bg-background rounded-md flex-1">
                <SelectValue placeholder="Date Filter">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-muted-foreground" />
                    <span>
                      {filters.datePreset === 'all'
                        ? 'All Time'
                        : filters.datePreset === 'today'
                          ? 'Today'
                          : filters.datePreset === 'yesterday'
                            ? 'Yesterday'
                            : filters.datePreset === 'week'
                              ? 'This Week'
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
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Date (Calendar)</SelectItem>
              </SelectContent>
            </Select>

            {filters.datePreset === 'custom' && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="h-10 text-xs bg-background rounded-md gap-1.5 px-3 shrink-0" />
                  }
                >
                  <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                  <span>{filters.customDate ? formatDate(filters.customDate, 'dd MMM yyyy') : 'Pick Date'}</span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0 rounded-md bg-card border border-border shadow-md">
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
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-muted-foreground font-semibold text-[11px]">Active Filters:</span>

          {filters.search && (
            <Badge
              variant="outline"
              className="bg-secondary/60 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span>Search: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/60 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="capitalize">Status: {filters.status}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, status: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {filters.paymentMethod !== 'all' && (
            <Badge
              variant="outline"
              className="bg-secondary/60 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="uppercase">Payment: {filters.paymentMethod}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, paymentMethod: 'all' })}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </Badge>
          )}

          {(filters.datePreset !== 'all' || filters.customDate) && (
            <Badge
              variant="outline"
              className="bg-secondary/60 text-foreground border-border/80 rounded-md px-2.5 py-1 gap-1 text-[11px]"
            >
              <span className="capitalize">
                Date: {filters.customDate || filters.datePreset}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, datePreset: 'all', customDate: '' })}
                className="hover:text-destructive transition-colors ml-0.5"
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

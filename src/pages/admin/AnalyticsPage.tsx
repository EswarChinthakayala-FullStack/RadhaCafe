import { useState, useEffect } from 'react';
import { AnalyticsKpiGrid } from '../../components/admin/analytics/AnalyticsKpiGrid';
import { DailySummary } from '../../components/admin/analytics/DailySummary';
import { SalesChart } from '../../components/admin/analytics/SalesChart';
import { ItemPerformance } from '../../components/admin/analytics/ItemPerformance';
import { PaymentMethodBreakdown } from '../../components/admin/analytics/PaymentMethodBreakdown';
import { ExportReport } from '../../components/admin/analytics/ExportReport';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { formatDate } from '../../lib/utils/formatDate';
import { supabase } from '../../lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, RefreshIcon, FilterIcon, Calendar01Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../types';

export function AnalyticsPage() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<AnalyticsDateRange>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Single lifecycle-controlled Realtime subscription to invalidate analytics queries upon order updates
  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Invalidate analytics queries to pull fresh metrics automatically
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleRefresh = async () => {
    setIsRefetching(true);
    await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    setTimeout(() => setIsRefetching(false), 500);
  };

  const handlePresetSelect = (preset: AnalyticsDateRange) => {
    setRange(preset);
    if (preset !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
    }
  };

  const handleResetFilters = () => {
    setRange('today');
    setCustomStart('');
    setCustomEnd('');
  };

  const isFilterActive = range !== 'today' || Boolean(customStart) || Boolean(customEnd);

  const getFilterButtonText = () => {
    if (range === 'today') return 'Today';
    if (range === 'week') return 'This Week';
    if (range === 'month') return 'This Month';
    if (range === 'custom') {
      if (customStart && customEnd) {
        return `${formatDate(customStart, 'dd MMM')} - ${formatDate(customEnd, 'dd MMM yyyy')}`;
      }
      if (customStart) return `From ${formatDate(customStart, 'dd MMM yyyy')}`;
      return 'Custom Range';
    }
    return 'Select Range';
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Analytics01Icon} size={22} />
            </div>
            <span>Analytics & Reports</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor RadhaCafe sales performance, revenue trends, top items, and daily business activity.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {/* Analytics Filter Sheet Drawer */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  className={`h-9 px-2 sm:px-3.5 text-[11px] sm:text-xs font-bold rounded-md gap-1.5 sm:gap-2 transition-all shadow-xs w-full sm:w-auto justify-center text-center truncate ${isFilterActive
                    ? 'bg-cinnamon text-white border-cinnamon hover:bg-cinnamon/90'
                    : 'bg-card border-border/80 text-foreground hover:bg-secondary/40'
                    }`}
                />
              }
            >
              <HugeiconsIcon icon={FilterIcon} size={15} className={isFilterActive ? 'text-white shrink-0' : 'text-cinnamon shrink-0'} />
              <span className="truncate">{getFilterButtonText()}</span>
              {isFilterActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0 ml-0.5" />
              )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-card overflow-y-auto no-scrollbar space-y-6">
              <SheetHeader className="p-0 border-b border-border/80 pb-3">
                <SheetTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={FilterIcon} size={18} className="text-cinnamon" />
                  <span>Filter Analytics & Reports</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5 text-xs">
                {/* Timeframe Presets */}
                <div>
                  <label className="block font-bold text-foreground mb-2 text-xs">Timeframe Period</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Today', value: 'today' },
                      { label: 'This Week', value: 'week' },
                      { label: 'This Month', value: 'month' },
                      { label: 'Custom Range', value: 'custom' },
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handlePresetSelect(p.value as AnalyticsDateRange)}
                        className={`p-2.5 rounded-md border text-xs font-semibold transition-all ${range === p.value
                          ? 'bg-cinnamon text-white border-cinnamon shadow-xs'
                          : 'bg-secondary/40 text-foreground border-border/60 hover:bg-secondary'
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Selection with ShadCN Calendar */}
                {range === 'custom' && (
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    <div>
                      <label className="block font-bold text-foreground mb-2 text-xs">Start Date</label>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button variant="outline" className="w-full h-10 justify-start text-xs bg-background rounded-md gap-2 px-3 font-normal border-border/80" />
                          }
                        >
                          <HugeiconsIcon icon={Calendar01Icon} size={15} className="text-cinnamon" />
                          <span>{customStart ? formatDate(customStart, 'dd MMM yyyy') : 'Select Start Date'}</span>
                        </PopoverTrigger>
                        <PopoverContent align="center" className="w-auto p-0 rounded-md bg-card border border-border shadow-md">
                          <Calendar
                            mode="single"
                            selected={customStart ? new Date(customStart + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, '0');
                                const dd = String(date.getDate()).padStart(2, '0');
                                setCustomStart(`${yyyy}-${mm}-${dd}`);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="block font-bold text-foreground mb-2 text-xs">End Date</label>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button variant="outline" className="w-full h-10 justify-start text-xs bg-background rounded-md gap-2 px-3 font-normal border-border/80" />
                          }
                        >
                          <HugeiconsIcon icon={Calendar01Icon} size={15} className="text-cinnamon" />
                          <span>{customEnd ? formatDate(customEnd, 'dd MMM yyyy') : 'Select End Date'}</span>
                        </PopoverTrigger>
                        <PopoverContent align="center" className="w-auto p-0 rounded-md bg-card border border-border shadow-md">
                          <Calendar
                            mode="single"
                            selected={customEnd ? new Date(customEnd + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, '0');
                                const dd = String(date.getDate()).padStart(2, '0');
                                setCustomEnd(`${yyyy}-${mm}-${dd}`);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Filter Sheet Actions */}
                <div className="pt-4 flex gap-2 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="w-1/2 h-10 text-xs font-semibold rounded-md text-destructive hover:bg-destructive/10"
                  >
                    Reset Filters
                  </Button>
                  <Button
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="w-1/2 h-10 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-md shadow-xs"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="h-9 px-2 sm:px-3.5 text-[11px] sm:text-xs font-semibold gap-1.5 bg-card border-border/80 rounded-md shadow-xs w-full sm:w-auto justify-center text-center truncate"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} className={isRefetching ? 'animate-spin text-cinnamon shrink-0' : 'shrink-0'} />
            <span className="truncate">{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          {/* CSV Export Dropdown */}
          <ExportReport range={range} />
        </div>
      </div>

      {/* Row 1: KPI Overview Cards */}
      <AnalyticsKpiGrid range={range} customStart={customStart} customEnd={customEnd} />

      {/* Row 2: Revenue Trend Chart & Top Selling Menu Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart range={range} customStart={customStart} customEnd={customEnd} />
        <ItemPerformance range={range} customStart={customStart} customEnd={customEnd} />
      </div>

      {/* Row 3: Payment Method Performance Breakdown & Historical Daily Summary */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <PaymentMethodBreakdown range={range} customStart={customStart} customEnd={customEnd} />
        </div>
        <div className="lg:col-span-2">
          <DailySummary />
        </div>
      </div>
    </div>
  );
}

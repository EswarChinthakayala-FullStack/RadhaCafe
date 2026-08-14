import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase/client';
import { getAnalyticsDateBounds } from '../../lib/supabase/queries/analytics';
import {
  useCafeAnalyticsSummary,
  useCafeTrendData,
  useCafeProductPerformance,
  useCafeCategoryPerformance,
  useCafePaymentSummary,
  useCafeCreditAnalytics,
  useCafePeakHours,
  useCafeDailyPerformance,
  ANALYTICS_QUERY_KEYS,
} from '../../hooks/useAnalytics';
import { AnalyticsHeader } from '../../components/admin/analytics/AnalyticsHeader';
import { AnalyticsKpis } from '../../components/admin/analytics/AnalyticsKpis';
import { AnalyticsInsightsBanner } from '../../components/admin/analytics/AnalyticsInsightsBanner';
import { RevenueTrendChart } from '../../components/admin/analytics/RevenueTrendChart';
import { ProductPerformanceSection } from '../../components/admin/analytics/ProductPerformanceSection';
import { CategoryPerformanceSection } from '../../components/admin/analytics/CategoryPerformanceSection';
import { PaymentAnalyticsSection } from '../../components/admin/analytics/PaymentAnalyticsSection';
import { CafeCreditSection } from '../../components/admin/analytics/CafeCreditSection';
import { PeakOrderingSection } from '../../components/admin/analytics/PeakOrderingSection';
import { DailyPerformanceTable } from '../../components/admin/analytics/DailyPerformanceTable';
import { toast } from '../../components/ui/toast';
import type { AnalyticsDateRange } from '../../types';

export function AnalyticsPage() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<AnalyticsDateRange>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute normalized local Cafe timezone date bounds
  const bounds = useMemo(
    () => getAnalyticsDateBounds(range, customStart, customEnd),
    [range, customStart, customEnd]
  );

  // Parallel Progressive TanStack Queries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useCafeAnalyticsSummary(bounds);

  const {
    data: trendData,
    isLoading: isTrendLoading,
    refetch: refetchTrend,
  } = useCafeTrendData(bounds);

  const {
    data: products,
    isLoading: isProductsLoading,
    refetch: refetchProducts,
  } = useCafeProductPerformance(bounds, 10);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useCafeCategoryPerformance(bounds);

  const {
    data: paymentSummary,
    isLoading: isPaymentLoading,
    refetch: refetchPayments,
  } = useCafePaymentSummary(bounds);

  const {
    data: creditData,
    isLoading: isCreditLoading,
    refetch: refetchCredit,
  } = useCafeCreditAnalytics(bounds);

  const {
    data: peakHours,
    isLoading: isPeakHoursLoading,
    refetch: refetchPeakHours,
  } = useCafePeakHours(bounds);

  const {
    data: dailyRecords,
    isLoading: isDailyLoading,
    refetch: refetchDaily,
  } = useCafeDailyPerformance(bounds);

  // Realtime subscription to automatically refresh cafe analytics upon order or payment changes
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const debouncedInvalidate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.cafe() });
      }, 800);
    };

    const channel = supabase
      .channel('admin-analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, debouncedInvalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, debouncedInvalidate)
      .subscribe();

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Date range handlers
  const handleSelectPreset = (newPreset: AnalyticsDateRange) => {
    setRange(newPreset);
    if (newPreset !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
    }
  };

  const handleSelectCustomRange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setRange('custom');
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchTrend(),
        refetchProducts(),
        refetchCategories(),
        refetchPayments(),
        refetchCredit(),
        refetchPeakHours(),
        refetchDaily(),
      ]);
      toast.add({
        title: 'Analytics Refreshed',
        description: 'Latest RadhaCafe business metrics loaded.',
        type: 'success',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Global Date Range Selector & Export Menu */}
      <AnalyticsHeader
        bounds={bounds}
        onSelectPreset={handleSelectPreset}
        onSelectCustomRange={handleSelectCustomRange}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* 2. Primary 6 KPI Cards with Period Comparison */}
      <AnalyticsKpis
        summary={summary}
        isLoading={isSummaryLoading}
        bounds={bounds}
      />

      {/* 3. Deterministic "At a Glance" Insights Banner */}
      <AnalyticsInsightsBanner
        summary={summary}
        isLoading={isSummaryLoading}
      />

      {/* 4. Main Sales & Order Trend Chart with Metric Switcher */}
      <RevenueTrendChart
        data={trendData}
        isLoading={isTrendLoading}
        bounds={bounds}
      />

      {/* 5. Product & Category Performance Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <ProductPerformanceSection
            products={products}
            isLoading={isProductsLoading}
            bounds={bounds}
          />
        </div>
        <div className="lg:col-span-5">
          <CategoryPerformanceSection
            categories={categories}
            isLoading={isCategoriesLoading}
            bounds={bounds}
          />
        </div>
      </div>

      {/* 6. Payments & Collections Breakdown */}
      <PaymentAnalyticsSection
        summary={paymentSummary}
        isLoading={isPaymentLoading}
        bounds={bounds}
      />

      {/* 7. Customer Credit & Pay Later Exposure */}
      <CafeCreditSection
        creditData={creditData}
        isLoading={isCreditLoading}
      />

      {/* 8. Peak Ordering Hours & Weekly Distribution */}
      <PeakOrderingSection
        analytics={peakHours}
        isLoading={isPeakHoursLoading}
        bounds={bounds}
      />

      {/* 9. Detailed Daily Financial Performance Table */}
      <DailyPerformanceTable
        records={dailyRecords}
        isLoading={isDailyLoading}
      />
    </div>
  );
}

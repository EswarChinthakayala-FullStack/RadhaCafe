import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardHeader } from '../../components/admin/dashboard/DashboardHeader';
import { StatsCards } from '../../components/admin/dashboard/StatsCards';
import { SecondaryMetrics } from '../../components/admin/dashboard/SecondaryMetrics';
import { RevenueChart } from '../../components/admin/dashboard/RevenueChart';
import { OrderActivityChart } from '../../components/admin/dashboard/OrderActivityChart';
import { TopItemsChart } from '../../components/admin/dashboard/TopItemsChart';
import { PaymentBreakdown } from '../../components/admin/dashboard/PaymentBreakdown';
import { RecentOrders } from '../../components/admin/dashboard/RecentOrders';
import { OutstandingPayments } from '../../components/admin/dashboard/OutstandingPayments';
import { PrinterStatusCard } from '../../components/admin/dashboard/PrinterStatusCard';
import { DashboardQuickActions } from '../../components/admin/dashboard/DashboardQuickActions';
import type { AnalyticsDateRange } from '../../types';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedRange, setSelectedRange] = useState<AnalyticsDateRange>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Level 0: Dashboard Header & Controls ── */}
      <DashboardHeader
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* ── Level 1: Immediate Business Health (Primary KPIs) ── */}
      <section aria-label="Today's Primary Business Health">
        <StatsCards />
      </section>

      {/* ── Level 2: Secondary Performance Metrics ── */}
      <section aria-label="Cafe Performance Metrics">
        <SecondaryMetrics />
      </section>

      {/* ── Level 3: Visual Analytics & Rush Hours ── */}
      <section aria-label="Sales and Order Trends" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart range={selectedRange} />
          <OrderActivityChart range={selectedRange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopItemsChart range={selectedRange} />
          <PaymentBreakdown range={selectedRange} />
        </div>
      </section>

      {/* ── Level 4: Live Operations & Follow-ups ── */}
      <section aria-label="Cafe Operations Feed" className="space-y-6">
        {/* Recent Orders Live Feed */}
        <RecentOrders />

        {/* Outstanding Dues & Thermal Printer Connection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <OutstandingPayments />
          <PrinterStatusCard />
        </div>

        {/* Quick POS Navigation - Full Width Responsive Grid */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <span className="text-xs font-bold font-heading uppercase tracking-wider text-muted-foreground block px-1">
            Quick POS Navigation
          </span>
          <DashboardQuickActions />
        </div>
      </section>
    </div>
  );
}

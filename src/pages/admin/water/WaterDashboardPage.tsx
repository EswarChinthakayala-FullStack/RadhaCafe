import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useWaterKpiSummary,
  useWaterRevenueTrend,
  useWaterProductPerformance,
  useWaterPaymentSummary,
  useWaterEventAnalytics,
} from '../../../hooks/useWaterAnalytics';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { WaterKpiCards } from '../../../components/admin/water/analytics/WaterKpiCards';
import { WaterRevenueChart } from '../../../components/admin/water/analytics/WaterRevenueChart';
import { WaterProductPerformance } from '../../../components/admin/water/analytics/WaterProductPerformance';
import { WaterPaymentChart } from '../../../components/admin/water/analytics/WaterPaymentChart';
import { WaterEventAnalytics } from '../../../components/admin/water/analytics/WaterEventAnalytics';
import { WaterOrderDetailsModal } from '../../../components/admin/water/orders/WaterOrderDetailsModal';
import type { WaterAnalyticsDateRange, WaterOrder } from '../../../types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  PlusSignIcon,
  EyeIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export function WaterDashboardPage() {
  const navigate = useNavigate();
  const [dashboardRange, setDashboardRange] = useState<WaterAnalyticsDateRange>('today');
  const [selectedOrder, setSelectedOrder] = useState<WaterOrder | null>(null);

  // Analytics queries
  const { data: kpiData, isLoading: isKpiLoading, isError: isKpiError } = useWaterKpiSummary(dashboardRange);
  const { data: revenueData, isLoading: isRevLoading } = useWaterRevenueTrend(dashboardRange);
  const { data: productPerfData, isLoading: isProdLoading } = useWaterProductPerformance(dashboardRange);
  const { data: paymentData, isLoading: isPmtLoading } = useWaterPaymentSummary(dashboardRange);
  const { data: eventData, isLoading: isEvtLoading } = useWaterEventAnalytics(dashboardRange);

  // Recent orders
  const { data: recentOrdersData, isLoading: isOrdersLoading } = useWaterOrders({ limit: 6 });
  const recentOrders = recentOrdersData?.orders || [];

  return (
    <div className="space-y-6 pb-12 min-w-0 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-3.5 border-b border-border/80 pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs mt-0.5 sm:mt-0">
              <HugeiconsIcon icon={DropletIcon} size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                RadhaWater Operational Dashboard
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight sm:leading-normal">
                Real-time daily metrics, Recharts visual analytics, credit ledger, and bulk event requests.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/admin/water/orders/new')}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 sm:h-10 text-xs px-3.5 sm:px-4 rounded-md shadow-xs gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>New Water Order</span>
          </Button>
        </div>

        {/* Quick Range selector for dashboard */}
        <div className="flex items-center justify-between sm:justify-start gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Timeframe:</span>
          <div className="flex items-center gap-1 bg-card p-1 rounded-md border border-border/80 text-xs shrink-0">
            {(['today', 'week', 'days_30', 'month'] as const).map((r) => (
              <Button
                key={r}
                type="button"
                variant={dashboardRange === r ? 'default' : 'ghost'}
                size="xs"
                className={
                  dashboardRange === r
                    ? 'bg-cinnamon text-white font-bold text-[11px] h-7 px-2.5 rounded-md shadow-2xs'
                    : 'text-[11px] h-7 text-foreground/80 rounded-md px-2.5'
                }
                onClick={() => setDashboardRange(r)}
              >
                {r === 'today' ? 'Today' : r === 'week' ? '7 Days' : r === 'days_30' ? '30 Days' : 'Month'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <WaterKpiCards data={kpiData} isLoading={isKpiLoading} isError={isKpiError} />

      {/* Primary Revenue Trend Chart */}
      <WaterRevenueChart
        data={revenueData}
        isLoading={isRevLoading}
        title="RadhaWater Sales Revenue Trend"
        description="Recharts visualization showing sales performance over the selected timeframe."
      />

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterProductPerformance data={productPerfData} isLoading={isProdLoading} />
        <WaterPaymentChart data={paymentData} isLoading={isPmtLoading} />
      </div>

      {/* Event Overview Section */}
      <WaterEventAnalytics data={eventData} isLoading={isEvtLoading} />

      {/* Recent Water Orders Section */}
      <div className="space-y-3 pt-2 border-t border-border/80">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-foreground font-heading">Recent Water Orders</h3>
            <p className="text-xs text-muted-foreground">Inspect completed & Pay-Later orders.</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/admin/water/orders')}
            className="text-xs text-cinnamon font-bold gap-1 hover:bg-cinnamon/10"
          >
            <span>View All Orders</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
          </Button>
        </div>

        {isOrdersLoading ? (
          <Skeleton className="h-40 w-full rounded-md" />
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-md border border-dashed border-border/80 text-xs text-muted-foreground">
            No recent water orders found.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-border/80 rounded-md bg-card overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Order #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5 text-right">Paid</th>
                    <th className="p-3.5 text-right">Due</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {recentOrders.map((ord) => {
                    const due = Number(ord.amount_due || 0);

                    return (
                      <tr key={ord.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-cinnamon">{ord.order_number}</td>
                        <td className="p-3.5 font-semibold">{ord.customer_name}</td>
                        <td className="p-3.5 text-muted-foreground text-[11px]">{formatDate(ord.created_at)}</td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="uppercase text-[9px] font-bold">
                            {ord.payment_method === 'pay_later' ? 'PAY LATER' : ord.payment_method}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right font-bold font-mono">{formatCurrency(ord.total_amount)}</td>
                        <td className="p-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(ord.amount_paid || 0)}
                        </td>
                        <td className="p-3.5 text-right font-bold text-amber-700 dark:text-amber-400">
                          {due > 0 ? formatCurrency(due) : '-'}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSelectedOrder(ord)}
                            className="h-7 text-xs gap-1 text-cinnamon hover:bg-cinnamon/10 font-bold"
                          >
                            <HugeiconsIcon icon={EyeIcon} size={14} />
                            <span>Inspect</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="md:hidden space-y-3">
              {recentOrders.map((ord) => {
                const due = Number(ord.amount_due || 0);
                return (
                  <Card key={ord.id} className="border border-border/80 bg-card rounded-md p-4 space-y-2 text-xs shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-cinnamon block">{ord.order_number}</span>
                        <p className="font-bold text-foreground">{ord.customer_name}</p>
                      </div>
                      <Badge variant="outline" className="uppercase text-[9px] font-bold">
                        {ord.payment_method === 'pay_later' ? 'PAY LATER' : ord.payment_method}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/40 font-mono">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-sans">Total</p>
                        <p className="font-bold text-foreground">{formatCurrency(ord.total_amount)}</p>
                      </div>
                      {due > 0 && (
                        <div className="text-right">
                          <p className="text-[10px] text-amber-700 uppercase font-sans font-semibold">Due</p>
                          <p className="font-bold text-amber-700">{formatCurrency(due)}</p>
                        </div>
                      )}
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedOrder(ord)}
                        className="h-8 text-xs font-bold gap-1 border-cinnamon/30 text-cinnamon hover:bg-cinnamon/10"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={13} />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <WaterOrderDetailsModal
          order={selectedOrder}
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

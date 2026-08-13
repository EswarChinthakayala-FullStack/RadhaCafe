import { useState } from 'react';
import {
  useWaterKpiSummary,
  useWaterRevenueTrend,
  useWaterOrderVolume,
  useWaterProductPerformance,
  useWaterPaymentSummary,
  useWaterOutstandingTrend,
  useWaterEventAnalytics,
} from '../../../hooks/useWaterAnalytics';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import {
  downloadWaterOrdersCsv,
  downloadWaterProductsCsv,
  downloadWaterPaymentsCsv,
  downloadWaterEventsCsv,
} from '../../../lib/utils/exportWaterCsv';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { WaterDateRangeSelector } from '../../../components/admin/water/analytics/WaterDateRangeSelector';
import { WaterKpiCards } from '../../../components/admin/water/analytics/WaterKpiCards';
import { WaterRevenueChart } from '../../../components/admin/water/analytics/WaterRevenueChart';
import { WaterOrderVolumeChart } from '../../../components/admin/water/analytics/WaterOrderVolumeChart';
import { WaterProductPerformance } from '../../../components/admin/water/analytics/WaterProductPerformance';
import { WaterPaymentChart } from '../../../components/admin/water/analytics/WaterPaymentChart';
import { WaterOutstandingChart } from '../../../components/admin/water/analytics/WaterOutstandingChart';
import { WaterEventAnalytics } from '../../../components/admin/water/analytics/WaterEventAnalytics';
import { WaterOrderDetailsModal } from '../../../components/admin/water/orders/WaterOrderDetailsModal';
import type { WaterAnalyticsDateRange, WaterOrder } from '../../../types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  Download01Icon,
  EyeIcon,
  Invoice01Icon,
} from '@hugeicons/core-free-icons';

export function WaterAnalyticsPage() {
  const [range, setRange] = useState<WaterAnalyticsDateRange>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<WaterOrder | null>(null);

  // Analytics hooks
  const { data: kpiData, isLoading: isKpiLoading, isError: isKpiError, refetch: refetchKpi } = useWaterKpiSummary(range, customStart, customEnd);
  const { data: revenueData, isLoading: isRevLoading, refetch: refetchRev } = useWaterRevenueTrend(range, customStart, customEnd);
  const { data: volumeData, isLoading: isVolLoading } = useWaterOrderVolume(range, customStart, customEnd);
  const { data: prodPerfData, isLoading: isProdLoading } = useWaterProductPerformance(range, customStart, customEnd);
  const { data: paymentData, isLoading: isPmtLoading } = useWaterPaymentSummary(range, customStart, customEnd);
  const { data: outstandingData, isLoading: isDueLoading } = useWaterOutstandingTrend(range, customStart, customEnd);
  const { data: eventData, isLoading: isEvtLoading } = useWaterEventAnalytics(range, customStart, customEnd);

  // Orders list for table view & CSV export
  const { data: ordersData, isLoading: isOrdersLoading } = useWaterOrders({ page, limit: 15 });
  const orders = ordersData?.orders || [];
  const totalPages = Math.ceil((ordersData?.count || 0) / 15) || 1;

  const handleExportAllOrders = () => {
    if (orders.length > 0) downloadWaterOrdersCsv(orders);
  };

  const handleExportProducts = () => {
    if (prodPerfData && prodPerfData.length > 0) downloadWaterProductsCsv(prodPerfData);
  };

  const handleExportPayments = () => {
    if (paymentData && paymentData.length > 0) downloadWaterPaymentsCsv(paymentData);
  };

  const handleExportEvents = () => {
    if (eventData) downloadWaterEventsCsv(eventData);
  };

  return (
    <div className="space-y-6 pb-12 min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs mt-0.5 sm:mt-0">
            <HugeiconsIcon icon={DropletIcon} size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              RadhaWater Performance Analytics
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight sm:leading-normal">
              Dedicated sales performance, 20L cans distribution, revenue breakdown, and event supply metrics.
            </p>
          </div>
        </div>

        {/* CSV Export Dropdown / Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            size="sm"
            onClick={handleExportAllOrders}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 text-xs gap-1.5 rounded-md shadow-xs justify-center"
          >
            <HugeiconsIcon icon={Download01Icon} size={15} />
            <span>Export Orders CSV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportProducts}
            className="h-9 text-xs font-semibold gap-1.5 rounded-md border-border/80 justify-center"
          >
            <HugeiconsIcon icon={Invoice01Icon} size={15} />
            <span>Products CSV</span>
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <WaterDateRangeSelector
        range={range}
        setRange={setRange}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
      />

      {/* Error Fallback with Retry */}
      {isKpiError && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex justify-between items-center">
          <span>Unable to load Water analytics data. Please try again.</span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              refetchKpi();
              refetchRev();
            }}
            className="text-xs border-destructive/30"
          >
            Retry Analytics
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <WaterKpiCards data={kpiData} isLoading={isKpiLoading} isError={isKpiError} />

      {/* Primary Revenue Trend Chart */}
      <WaterRevenueChart
        data={revenueData}
        isLoading={isRevLoading}
        title="Primary Sales Revenue Trend"
        description="Recharts AreaChart visualizing total water revenue in INR over time."
      />

      {/* Order Volume & Outstanding Balance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterOrderVolumeChart data={volumeData} isLoading={isVolLoading} />
        <WaterOutstandingChart data={outstandingData} isLoading={isDueLoading} />
      </div>

      {/* Product Performance & Payment Collection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterProductPerformance data={prodPerfData} isLoading={isProdLoading} />
        <WaterPaymentChart data={paymentData} isLoading={isPmtLoading} />
      </div>

      {/* Event Analytics Section */}
      <WaterEventAnalytics data={eventData} isLoading={isEvtLoading} />

      {/* Detailed Water Performance Table */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-foreground font-heading">
              Detailed Water Performance Table
            </h3>
            <p className="text-xs text-muted-foreground">
              Complete list of water orders placed during this operational period.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleExportPayments}
              className="text-xs h-8 gap-1.5 rounded-md"
            >
              <HugeiconsIcon icon={Download01Icon} size={13} />
              <span>Payments CSV</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={handleExportEvents}
              className="text-xs h-8 gap-1.5 rounded-md"
            >
              <HugeiconsIcon icon={Download01Icon} size={13} />
              <span>Events CSV</span>
            </Button>
          </div>
        </div>

        {isOrdersLoading ? (
          <Skeleton className="h-48 w-full rounded-md" />
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-md border border-dashed border-border/80 text-xs text-muted-foreground">
            No water orders available for table inspection.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-border/80 rounded-md bg-card overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Order #</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5 text-right">Amount Paid</th>
                    <th className="p-3.5 text-right">Amount Due</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {orders.map((ord) => {
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
                        <td className="p-3.5">
                          <Badge
                            variant={ord.order_status === 'completed' ? 'default' : 'outline'}
                            className="uppercase text-[9px] font-bold"
                          >
                            {ord.order_status}
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
                            <span>View</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {orders.map((ord) => {
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-3 text-xs">
                <span className="text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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

import { useState } from 'react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { exportToCsv } from '../../../lib/utils/csvExport';
import { sanitizeCsvField } from '../../../lib/supabase/queries/analytics';
import {
  fetchCafeAnalyticsSummary,
  fetchCafeDailyPerformance,
  fetchCafeProductPerformance,
  fetchCafePaymentSummary,
} from '../../../lib/supabase/queries/analytics';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Download01Icon,
  FileSpreadsheetIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import type { DateRangeBounds } from '../../../types';

interface AnalyticsExportMenuProps {
  bounds: DateRangeBounds;
}

export function AnalyticsExportMenu({ bounds }: AnalyticsExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getFileSuffix = () => {
    const from = bounds.startISO.slice(0, 10);
    const to = bounds.endISO.slice(0, 10);
    return `${from}-to-${to}`;
  };

  const handleExportSummary = async () => {
    try {
      setIsExporting(true);
      const summary = await fetchCafeAnalyticsSummary(bounds);

      const headers = ['Metric', 'Current Period', 'Previous Period', 'Change (%)'];
      const rows = [
        ['Sales Revenue (₹)', summary.sales_revenue, summary.prev_sales_revenue, summary.sales_change_pct ?? 'N/A'],
        ['Completed Orders', summary.completed_orders, summary.prev_completed_orders, summary.orders_change_pct ?? 'N/A'],
        ['Collected Amount (₹)', summary.collected_amount, summary.prev_collected_amount, summary.collected_change_pct ?? 'N/A'],
        ['Current Outstanding (₹)', summary.current_outstanding, '—', '—'],
        ['Average Order Value (₹)', summary.avg_order_value, summary.prev_avg_order_value, summary.aov_change_pct ?? 'N/A'],
        ['Items Sold', summary.total_items_sold, summary.prev_total_items_sold, summary.items_change_pct ?? 'N/A'],
        ['Customers With Dues', summary.customers_with_dues, '—', '—'],
        ['Cancelled Orders', summary.cancelled_orders_count, '—', '—'],
        ['Total Discounts Given (₹)', summary.total_discount_amount, '—', '—'],
      ].map((row) => row.map(sanitizeCsvField));

      exportToCsv(`radhacafe-summary-${getFileSuffix()}.csv`, headers, rows);
      toast.add({
        title: 'Summary Exported',
        description: 'Cafe summary metrics downloaded successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Export Failed',
        description: err?.message || 'Unable to generate export.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDailyPerformance = async () => {
    try {
      setIsExporting(true);
      const dailyRecords = await fetchCafeDailyPerformance(bounds);

      if (!dailyRecords || dailyRecords.length === 0) {
        toast.add({
          title: 'No Data',
          description: 'No daily records found for the selected period.',
          type: 'info',
        });
        return;
      }

      const headers = [
        'Date',
        'Formatted Date',
        'Completed Orders',
        'Items Sold',
        'Sales Revenue (₹)',
        'Collected Amount (₹)',
        'Avg Order Value (₹)',
        'Discount Amount (₹)',
        'Outstanding Created (₹)',
      ];

      const rows = dailyRecords.map((r) =>
        [
          r.date,
          r.formatted_date,
          r.orders,
          r.items_sold,
          r.sales,
          r.collected,
          r.aov,
          r.discount_amount,
          r.outstanding_created,
        ].map(sanitizeCsvField)
      );

      exportToCsv(`radhacafe-daily-performance-${getFileSuffix()}.csv`, headers, rows);
      toast.add({
        title: 'Daily Performance Exported',
        description: 'Daily breakdown report downloaded successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Export Failed',
        description: err?.message || 'Unable to generate export.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProducts = async () => {
    try {
      setIsExporting(true);
      const products = await fetchCafeProductPerformance(bounds, 50);

      if (!products || products.length === 0) {
        toast.add({
          title: 'No Data',
          description: 'No product sales recorded in this period.',
          type: 'info',
        });
        return;
      }

      const headers = [
        'Rank',
        'Product Name',
        'Category',
        'Quantity Sold',
        'Total Revenue (₹)',
        'Orders Count',
        'Avg Unit Price (₹)',
        'Revenue Share (%)',
      ];

      const rows = products.map((p) =>
        [
          p.rank,
          p.item_name,
          p.category_name,
          p.quantity_sold,
          p.revenue,
          p.order_count,
          p.avg_price,
          p.revenue_share_pct,
        ].map(sanitizeCsvField)
      );

      exportToCsv(`radhacafe-product-performance-${getFileSuffix()}.csv`, headers, rows);
      toast.add({
        title: 'Product Report Exported',
        description: 'Product sales breakdown downloaded successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Export Failed',
        description: err?.message || 'Unable to generate export.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPayments = async () => {
    try {
      setIsExporting(true);
      const paymentsData = await fetchCafePaymentSummary(bounds);

      const headers = ['Payment Method', 'Amount Collected (₹)', 'Transaction Count', 'Share (%)'];
      const rows = paymentsData.methods.map((m) =>
        [m.label, m.amount, m.count, m.percentage].map(sanitizeCsvField)
      );

      exportToCsv(`radhacafe-payments-summary-${getFileSuffix()}.csv`, headers, rows);
      toast.add({
        title: 'Payments Exported',
        description: 'Payment methods summary downloaded successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Export Failed',
        description: err?.message || 'Unable to generate export.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="h-9 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-card border-border/80 text-foreground hover:bg-secondary/60 shadow-2xs shrink-0"
          />
        }
      >
        {isExporting ? (
          <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin text-cinnamon" />
        ) : (
          <HugeiconsIcon icon={Download01Icon} size={14} />
        )}
        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-card border-border/80 rounded-xl p-1.5 shadow-xl text-xs">
        <DropdownMenuItem
          onClick={handleExportSummary}
          className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
        >
          <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-cinnamon" />
          <span>Export Summary Metrics</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleExportDailyPerformance}
          className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
        >
          <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-primary" />
          <span>Export Daily Breakdown</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleExportProducts}
          className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
        >
          <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-emerald-600" />
          <span>Export Product Performance</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleExportPayments}
          className="gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary/60"
        >
          <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-amber-600" />
          <span>Export Payment Methods</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

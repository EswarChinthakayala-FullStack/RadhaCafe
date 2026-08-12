import { useState } from 'react';
import { exportToCsv } from '../../../lib/utils/csvExport';
import { fetchExportOrdersData, fetchHistoricalDailySummaries } from '../../../lib/supabase/queries/analytics';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon, FileSpreadsheetIcon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface ExportReportProps {
  range?: AnalyticsDateRange;
}

export function ExportReport({ range = 'today' }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleExportOrders = async () => {
    try {
      setIsExporting(true);
      setExportMessage('Preparing orders export...');

      const orders = await fetchExportOrdersData(range);

      if (!orders || orders.length === 0) {
        setExportMessage('No orders available for the selected period.');
        setIsExporting(false);
        return;
      }

      const headers = [
        'Order Number',
        'Customer Name',
        'Status',
        'Subtotal',
        'Tax Amount',
        'Discount Amount',
        'Total Amount',
        'Payment Method',
        'Printed',
        'Created At',
      ];

      const rows = orders.map((o: any) => [
        o.order_number,
        o.customer_name || 'Walk-in',
        o.status,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.payment_method,
        o.is_printed ? 'Yes' : 'No',
        o.created_at,
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      exportToCsv(`radhacafe-orders-${range}-${todayStr}.csv`, headers, rows);

      setExportMessage('Orders CSV exported successfully.');
    } catch (err: any) {
      setExportMessage(err.message || 'Unable to export orders data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDailySummaries = async () => {
    try {
      setIsExporting(true);
      setExportMessage('Preparing daily summary export...');

      const summaries = await fetchHistoricalDailySummaries(60);

      if (!summaries || summaries.length === 0) {
        setExportMessage('No daily summary records available for export.');
        setIsExporting(false);
        return;
      }

      const headers = ['Order Date', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Total Items Sold'];

      const rows = summaries.map((s) => [
        s.order_date || '',
        s.total_orders,
        s.total_revenue,
        s.avg_order_value,
        s.total_items_sold,
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      exportToCsv(`radhacafe-daily-summary-${todayStr}.csv`, headers, rows);

      setExportMessage('Daily Summary CSV exported successfully.');
    } catch (err: any) {
      setExportMessage(err.message || 'Unable to export daily summary data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full sm:w-auto inline-flex shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              disabled={isExporting}
              className="h-9 px-2 sm:px-3.5 text-[11px] sm:text-xs font-semibold rounded-md gap-1.5 sm:gap-2 bg-card border-border/80 shadow-xs w-full sm:w-auto justify-center text-center truncate"
            >
              <HugeiconsIcon icon={Download01Icon} size={14} />
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="bg-card border-border">
          <DropdownMenuItem onClick={handleExportOrders} className="gap-2 text-xs font-medium cursor-pointer">
            <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-primary" />
            <span>Export Orders CSV ({range})</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportDailySummaries} className="gap-2 text-xs font-medium cursor-pointer">
            <HugeiconsIcon icon={FileSpreadsheetIcon} size={14} className="text-cinnamon" />
            <span>Export Daily Summary CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {exportMessage && (
        <span className="text-[10px] font-medium text-muted-foreground">{exportMessage}</span>
      )}
    </div>
  );
}

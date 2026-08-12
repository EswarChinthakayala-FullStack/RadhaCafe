import { useAnalyticsMetrics } from '../../../hooks/useAnalytics';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon, Invoice01Icon, ChartIncreaseIcon, ShoppingBasket01Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface AnalyticsKpiGridProps {
  range: AnalyticsDateRange;
  customStart?: string;
  customEnd?: string;
}

export function AnalyticsKpiGrid({ range, customStart, customEnd }: AnalyticsKpiGridProps) {
  const { data: metrics, isLoading, isError } = useAnalyticsMetrics(range, customStart, customEnd);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 rounded-md">
            <CardContent className="p-3.5 sm:p-4 space-y-2">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 bg-muted" />
              <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 text-center">
        Unable to load KPI metrics. Please try refreshing.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Total Revenue */}
      <Card className="border-border/80 bg-card shadow-xs hover:border-cinnamon/40 transition-colors rounded-md">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-base sm:text-2xl font-extrabold font-heading text-foreground">
              {formatCurrency(metrics?.total_revenue || 0)}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 ml-1">
            <HugeiconsIcon icon={Wallet01Icon} size={20} className="sm:w-6 sm:h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Completed Orders */}
      <Card className="border-border/80 bg-card shadow-xs hover:border-cinnamon/40 transition-colors rounded-md">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Completed Orders
            </p>
            <p className="text-base sm:text-2xl font-extrabold font-heading text-foreground">
              {metrics?.total_orders || 0}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 ml-1">
            <HugeiconsIcon icon={Invoice01Icon} size={20} className="sm:w-6 sm:h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="border-border/80 bg-card shadow-xs hover:border-cinnamon/40 transition-colors rounded-md">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Avg Order Value
            </p>
            <p className="text-base sm:text-2xl font-extrabold font-heading text-foreground">
              {formatCurrency(metrics?.avg_order_value || 0)}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 ml-1">
            <HugeiconsIcon icon={ChartIncreaseIcon} size={20} className="sm:w-6 sm:h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Total Items Sold */}
      <Card className="border-border/80 bg-card shadow-xs hover:border-cinnamon/40 transition-colors rounded-md">
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Items Sold
            </p>
            <p className="text-base sm:text-2xl font-extrabold font-heading text-foreground">
              {metrics?.total_items_sold || 0}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 ml-1">
            <HugeiconsIcon icon={ShoppingBasket01Icon} size={20} className="sm:w-6 sm:h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

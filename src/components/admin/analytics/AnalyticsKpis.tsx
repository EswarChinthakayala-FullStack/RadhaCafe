import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Wallet01Icon,
  Invoice01Icon,
  CreditCardIcon,
  ChartIncreaseIcon,
  ShoppingBasket01Icon,
  UserGroupIcon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
} from '@hugeicons/core-free-icons';
import type { CafeAnalyticsSummary, DateRangeBounds } from '../../../types';

interface AnalyticsKpisProps {
  summary?: CafeAnalyticsSummary;
  isLoading: boolean;
  bounds: DateRangeBounds;
}

export function AnalyticsKpis({ summary, isLoading, bounds }: AnalyticsKpisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border/60 rounded-2xl bg-card">
            <CardContent className="p-4 space-y-2.5">
              <Skeleton className="h-3 w-20 bg-muted/60" />
              <Skeleton className="h-7 w-28 bg-muted/60" />
              <Skeleton className="h-3 w-24 bg-muted/40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const s = summary || {
    sales_revenue: 0,
    completed_orders: 0,
    avg_order_value: 0,
    total_items_sold: 0,
    collected_amount: 0,
    current_outstanding: 0,
    customers_with_dues: 0,
    cancelled_orders_count: 0,
    total_discount_amount: 0,
    prev_sales_revenue: 0,
    prev_completed_orders: 0,
    prev_avg_order_value: 0,
    prev_total_items_sold: 0,
    prev_collected_amount: 0,
    sales_change_pct: null,
    orders_change_pct: null,
    aov_change_pct: null,
    items_change_pct: null,
    collected_change_pct: null,
    top_selling_item: null,
    top_category: null,
    busiest_hour: null,
    upi_collection_pct: 0,
  };

  const renderTrend = (pct: number | null | undefined, prevVal: number) => {
    if (pct === null || pct === undefined) {
      if (prevVal === 0) {
        return (
          <span className="text-[10px] text-muted-foreground font-medium">
            No prior period data
          </span>
        );
      }
      return null;
    }

    if (pct === 0) {
      return (
        <span className="text-[10px] text-muted-foreground font-semibold">
          0% {bounds.comparisonLabel}
        </span>
      );
    }

    const isPositive = pct > 0;
    return (
      <div
        className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        <HugeiconsIcon
          icon={isPositive ? ArrowUpRight01Icon : ArrowDownRight01Icon}
          size={13}
          className="shrink-0"
        />
        <span>
          {isPositive ? `+${pct}%` : `${pct}%`}
        </span>
        <span className="text-[10px] font-normal text-muted-foreground ml-1 truncate max-w-[80px] sm:max-w-none">
          {bounds.comparisonLabel}
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Sales Revenue */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-cinnamon/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Sales Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Wallet01Icon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
              {formatCurrency(s.sales_revenue)}
            </p>
            <div className="pt-0.5">{renderTrend(s.sales_change_pct, s.prev_sales_revenue)}</div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Completed orders total
          </p>
        </CardContent>
      </Card>

      {/* 2. Completed Orders */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-cinnamon/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Orders
            </span>
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Invoice01Icon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
              {s.completed_orders}
            </p>
            <div className="pt-0.5">{renderTrend(s.orders_change_pct, s.prev_completed_orders)}</div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Completed in period
          </p>
        </CardContent>
      </Card>

      {/* 3. Collected Amount */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-cinnamon/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Collected
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <HugeiconsIcon icon={CreditCardIcon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
              {formatCurrency(s.collected_amount)}
            </p>
            <div className="pt-0.5">{renderTrend(s.collected_change_pct, s.prev_collected_amount)}</div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Actual payment inflows
          </p>
        </CardContent>
      </Card>

      {/* 4. Current Outstanding */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-amber-500/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Outstanding
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <HugeiconsIcon icon={UserGroupIcon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-amber-700 dark:text-amber-400 tracking-tight">
              {formatCurrency(s.current_outstanding)}
            </p>
            <div className="text-[11px] font-semibold text-muted-foreground pt-0.5">
              {s.customers_with_dues} {s.customers_with_dues === 1 ? 'customer owes' : 'customers owe'}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Active Cafe credit dues
          </p>
        </CardContent>
      </Card>

      {/* 5. Average Order Value */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-cinnamon/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={ChartIncreaseIcon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
              {formatCurrency(s.avg_order_value)}
            </p>
            <div className="pt-0.5">{renderTrend(s.aov_change_pct, s.prev_avg_order_value)}</div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Revenue / completed orders
          </p>
        </CardContent>
      </Card>

      {/* 6. Total Items Sold */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs hover:border-cinnamon/40 transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Items Sold
            </span>
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={ShoppingBasket01Icon} size={15} />
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
              {s.total_items_sold}
            </p>
            <div className="pt-0.5">{renderTrend(s.items_change_pct, s.prev_total_items_sold)}</div>
          </div>

          <p className="text-[10px] text-muted-foreground/80 leading-tight">
            Total unit quantities
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

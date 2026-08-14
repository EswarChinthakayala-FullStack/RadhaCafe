import { useCafeDashboardMetrics } from '../../../hooks/useAnalytics';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Button } from '../../ui/button';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBag01Icon,
  Invoice01Icon,
  RefreshIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  HelpCircleIcon,
  Clock01Icon,
  Coins01Icon,
} from '@hugeicons/core-free-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export function StatsCards() {
  const { data: metrics, isLoading, isError, refetch } = useCafeDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-28 bg-muted" />
            <Skeleton className="h-8 w-36 bg-muted" />
            <Skeleton className="h-3 w-44 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="p-6 text-center bg-card rounded-xl border border-destructive/30 space-y-3 shadow-xs">
        <p className="text-xs font-bold text-destructive">
          Unable to load today&apos;s primary business statistics.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="gap-1.5 text-xs h-8"
        >
          <HugeiconsIcon icon={RefreshIcon} size={14} />
          <span>Retry Loading KPIs</span>
        </Button>
      </div>
    );
  }

  const kpis = [
    {
      id: 'today-revenue',
      title: "Today's Revenue",
      value: formatCurrency(metrics.total_revenue),
      subtext: 'Completed sales today',
      icon: Invoice01Icon,
      iconBg: 'bg-primary/10 text-primary border-primary/20',
      trend: metrics.revenue_change_pct,
      trendLabel:
        metrics.yesterday_revenue === 0 && metrics.total_revenue > 0
          ? 'First sales of the week'
          : metrics.revenue_change_pct !== null
          ? `${metrics.revenue_change_pct >= 0 ? '+' : ''}${metrics.revenue_change_pct}% vs yesterday`
          : null,
      tooltip: 'Gross sales value from all completed cafe orders today.',
    },
    {
      id: 'today-orders',
      title: "Today's Orders",
      value: metrics.total_orders,
      subtext: `${metrics.total_items_sold} ${metrics.total_items_sold === 1 ? 'item' : 'items'} sold today`,
      icon: ShoppingBag01Icon,
      iconBg: 'bg-cinnamon/10 text-cinnamon border-cinnamon/20',
      trend: metrics.orders_change_pct,
      trendLabel:
        metrics.yesterday_orders === 0 && metrics.total_orders > 0
          ? 'Orders active today'
          : metrics.orders_change_pct !== null
          ? `${metrics.orders_change_pct >= 0 ? '+' : ''}${metrics.orders_change_pct}% vs yesterday`
          : null,
      tooltip: 'Number of completed cafe orders placed and fulfilled today.',
    },
    {
      id: 'collected-today',
      title: 'Collected Today',
      value: formatCurrency(metrics.collected_today),
      subtext: 'Actual cash & digital receipts',
      icon: Coins01Icon,
      iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      tooltip:
        'Money actually received today in Cash/UPI, including collections received against older Pay Later orders.',
      hasSpecialBadge: true,
      badgeText: 'Actual Cash Flow',
    },
    {
      id: 'outstanding-credit',
      title: 'Outstanding Credit',
      value: formatCurrency(metrics.outstanding_credit),
      subtext:
        metrics.customers_with_dues_count > 0
          ? `${metrics.customers_with_dues_count} ${
              metrics.customers_with_dues_count === 1 ? 'customer has' : 'customers have'
            } active dues`
          : 'Zero customer dues pending',
      icon: Clock01Icon,
      iconBg:
        metrics.outstanding_credit > 0
          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          : 'bg-muted text-muted-foreground border-border/40',
      tooltip:
        'Total unpaid customer credit across all active completed cafe orders requiring collection.',
      hasWarning: metrics.outstanding_credit > 0,
    },
  ];

  return (
    <TooltipProvider delay={200}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;

          return (
            <Card
              key={kpi.id}
              className="border-border/80 bg-card rounded-xl shadow-2xs hover:shadow-md transition-all duration-200 group relative overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
                {/* Top Row: Label + Tooltip + Icon */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {kpi.title}
                    </span>
                    <Tooltip>
                      <TooltipTrigger
                        className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded focus:outline-none"
                        aria-label={`About ${kpi.title}`}
                      >
                        <HugeiconsIcon icon={HelpCircleIcon} size={13} />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs font-medium">
                        {kpi.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${kpi.iconBg} transition-transform group-hover:scale-105`}
                  >
                    <HugeiconsIcon icon={IconComponent} size={18} />
                  </div>
                </div>

                {/* Center Value */}
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight truncate">
                    {kpi.value}
                  </h2>
                </div>

                {/* Bottom Detail Strip / Trend Indicator */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground truncate font-medium">
                    {kpi.subtext}
                  </span>

                  {kpi.trendLabel && kpi.trend !== null && kpi.trend !== undefined && (
                    <div
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        kpi.trend >= 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      <HugeiconsIcon
                        icon={kpi.trend >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
                        size={12}
                      />
                      <span>{Math.abs(kpi.trend)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

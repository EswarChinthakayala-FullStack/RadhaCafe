import { useCafeDashboardMetrics } from '../../../hooks/useAnalytics';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Analytics01Icon,
  Coffee02Icon,
  FireIcon,
  Time02Icon,
} from '@hugeicons/core-free-icons';

export function SecondaryMetrics() {
  const { data: metrics, isLoading } = useCafeDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 bg-card p-3.5 space-y-2">
            <Skeleton className="h-3 w-20 bg-muted" />
            <Skeleton className="h-6 w-24 bg-muted" />
            <Skeleton className="h-2.5 w-28 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const secondary = [
    {
      id: 'aov',
      label: 'Avg Order Value',
      value: formatCurrency(metrics.avg_order_value),
      subtext: metrics.total_orders > 0 ? `Across ${metrics.total_orders} orders` : 'No orders today',
      icon: Analytics01Icon,
      iconColor: 'text-primary',
    },
    {
      id: 'items-sold',
      label: 'Items Sold',
      value: `${metrics.total_items_sold} units`,
      subtext: 'Completed menu items',
      icon: Coffee02Icon,
      iconColor: 'text-cinnamon',
    },
    {
      id: 'best-seller',
      label: 'Top Seller Today',
      value: metrics.top_item ? metrics.top_item.name : 'Waiting for sales',
      subtext: metrics.top_item ? `${metrics.top_item.quantity} sold (${formatCurrency(metrics.top_item.revenue)})` : 'Fresh brews ready',
      icon: FireIcon,
      iconColor: 'text-amber-500',
    },
    {
      id: 'peak-hour',
      label: 'Peak Sales Period',
      value: metrics.peak_hour ? metrics.peak_hour.label : 'Pending activity',
      subtext: metrics.peak_hour ? `${metrics.peak_hour.orders} orders during rush` : 'Based on order timestamps',
      icon: Time02Icon,
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {secondary.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.id}
            className="border-border/70 bg-card/80 rounded-xl p-3.5 shadow-2xs hover:border-border transition-colors"
          >
            <CardContent className="p-0 flex items-start justify-between gap-2.5">
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                  {item.label}
                </span>
                <div className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight truncate">
                  {item.value}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground/85 truncate">
                  {item.subtext}
                </p>
              </div>

              <div className={`p-2 rounded-lg bg-secondary/80 ${item.iconColor} shrink-0`}>
                <HugeiconsIcon icon={Icon} size={16} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

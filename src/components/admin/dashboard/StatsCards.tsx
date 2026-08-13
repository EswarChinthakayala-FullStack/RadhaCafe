import { useDailySummary, useTopSellingItems } from '../../../hooks/useAnalytics';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Button } from '../../ui/button';
import { formatCompactCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBag01Icon,
  Invoice01Icon,
  Analytics01Icon,
  Coffee02Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';

export function StatsCards() {
  const { data: summary, isLoading: isSummaryLoading, isError, refetch } = useDailySummary();
  const { data: topItems, isLoading: isTopLoading } = useTopSellingItems('today', 1);

  if (isSummaryLoading || isTopLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-8 w-32 bg-muted" />
            <Skeleton className="h-3 w-40 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center bg-card rounded-md border border-destructive/30 space-y-3">
        <p className="text-xs font-bold text-destructive">
          Unable to load today&apos;s statistics.
        </p>
        <Button size="xs" variant="outline" onClick={() => refetch()} className="gap-1.5 text-xs">
          <HugeiconsIcon icon={RefreshIcon} size={14} />
          <span>Retry Loading Stats</span>
        </Button>
      </div>
    );
  }

  const topItem = topItems && topItems.length > 0 ? topItems[0] : null;

  const cards = [
    {
      title: "Today's Orders",
      value: summary?.total_orders ?? 0,
      subtext: `${summary?.total_items_sold ?? 0} total items sold`,
      icon: ShoppingBag01Icon,
    },
    {
      title: "Today's Revenue",
      value: formatCompactCurrency(summary?.total_revenue ?? 0),
      subtext: 'Completed sales today',
      icon: Invoice01Icon,
    },
    {
      title: 'Avg Order Value',
      value: formatCompactCurrency(summary?.avg_order_value ?? 0),
      subtext: 'Revenue per completed order',
      icon: Analytics01Icon,
    },
    {
      title: 'Top Item Today',
      value: topItem ? topItem.name : 'No sales yet',
      subtext: topItem ? `${topItem.quantity} units sold today` : 'Fresh brews waiting for first order',
      icon: Coffee02Icon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={i}
            className="border-border/80 bg-card rounded-md shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden"
          >
            <CardContent className="p-5 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                  {card.title}
                </span>
                <h3 className="text-2xl font-bold font-heading text-foreground tracking-tight truncate">
                  {card.value}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground/80 truncate">
                  {card.subtext}
                </p>
              </div>

              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={IconComponent} size={20} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

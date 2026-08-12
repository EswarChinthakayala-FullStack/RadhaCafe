import { useDailySummary } from '../../../hooks/useAnalytics';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Invoice01Icon, ShoppingBag01Icon, CheckmarkCircle02Icon, Coffee02Icon } from '@hugeicons/core-free-icons';

export function OrderSummaryCards() {
  const { data: summary, isLoading } = useDailySummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-md border border-border/80 bg-card space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(summary?.total_revenue || 0),
      subtitle: "Gross sales today",
      icon: Invoice01Icon,
      accent: 'text-cinnamon bg-cinnamon/10 border-cinnamon/20',
    },
    {
      title: 'Total Orders',
      value: summary?.total_orders || 0,
      subtitle: 'Completed today',
      icon: ShoppingBag01Icon,
      accent: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Items Prepared',
      value: summary?.total_items_sold || 0,
      subtitle: 'Units served today',
      icon: CheckmarkCircle02Icon,
      accent: 'text-success bg-success/10 border-success/20',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(summary?.avg_order_value || 0),
      subtitle: 'Per transaction',
      icon: Coffee02Icon,
      accent: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="p-3.5 sm:p-4 rounded-md border border-border/80 bg-card shadow-xs hover:border-border transition-all flex justify-between items-start"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground">{card.title}</p>
            <p className="text-base sm:text-xl font-bold font-mono text-foreground tracking-tight">
              {card.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{card.subtitle}</p>
          </div>

          <div className={`p-2 rounded-md border ${card.accent} shrink-0`}>
            <HugeiconsIcon icon={card.icon} size={18} />
          </div>
        </div>
      ))}
    </div>
  );
}

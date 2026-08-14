import { useOrderOperationalSummary } from '../../../hooks/useOrders';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Invoice01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Coins01Icon,
} from '@hugeicons/core-free-icons';

interface OrderSummaryCardsProps {
  startDate?: string;
  endDate?: string;
}

export function OrderSummaryCards({ startDate, endDate }: OrderSummaryCardsProps) {
  const { data: summary, isLoading } = useOrderOperationalSummary(startDate, endDate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 sm:h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Orders Today',
      value: summary?.ordersToday || 0,
      subtitle: 'Cafe orders placed',
      icon: Invoice01Icon,
      accent: 'text-cinnamon bg-cinnamon/10 border-cinnamon/20',
    },
    {
      title: 'Completed',
      value: summary?.completedOrders || 0,
      subtitle: 'Served & closed',
      icon: CheckmarkCircle02Icon,
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Outstanding',
      value: summary?.outstandingOrders || 0,
      subtitle: 'Orders with due balance',
      icon: Clock01Icon,
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: "Today's Sales",
      value: formatCurrency(summary?.totalSales || 0),
      subtitle: 'Completed order value',
      icon: Coins01Icon,
      accent: 'text-foreground bg-secondary/80 border-border/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="p-3 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs hover:border-border transition-all flex justify-between items-start overflow-hidden min-w-0"
        >
          <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1">
            <p className="text-[11px] font-semibold text-muted-foreground truncate">{card.title}</p>
            <p className="text-sm sm:text-lg lg:text-xl font-bold font-mono text-foreground tracking-tight truncate">
              {card.value}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{card.subtitle}</p>
          </div>

          <div className={`p-1.5 sm:p-2 rounded-lg border ${card.accent} shrink-0`}>
            <HugeiconsIcon icon={card.icon} size={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

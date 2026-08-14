import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Card, CardContent } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  AlertCircleIcon,
  Wallet01Icon,
  InvoiceIcon,
} from '@hugeicons/core-free-icons';
import type { CustomerOperationalSummary } from '../../../types';

interface CustomerSummaryCardsProps {
  summary?: CustomerOperationalSummary;
  isLoading: boolean;
  activeStatusFilter?: 'all' | 'due' | 'paid';
  onSelectStatusFilter?: (status: 'all' | 'due' | 'paid') => void;
}

export function CustomerSummaryCards({
  summary,
  isLoading,
  activeStatusFilter = 'all',
  onSelectStatusFilter,
}: CustomerSummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border/80 bg-card rounded-xl p-3.5 sm:p-4">
            <Skeleton className="h-4 w-24 mb-2 rounded" />
            <Skeleton className="h-7 w-16 mb-1 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers.toString(),
      subtext: 'Active cafe accounts',
      icon: UserGroupIcon,
      iconBg: 'bg-primary/10 text-primary border-primary/20',
      active: activeStatusFilter === 'all',
      onClick: () => onSelectStatusFilter && onSelectStatusFilter('all'),
    },
    {
      title: 'With Outstanding',
      value: summary.customersWithDue.toString(),
      subtext: 'Accounts with unpaid balance',
      icon: AlertCircleIcon,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      active: activeStatusFilter === 'due',
      highlightBorder: summary.customersWithDue > 0 ? 'border-amber-500/30 dark:border-amber-500/30' : undefined,
      onClick: () => onSelectStatusFilter && onSelectStatusFilter('due'),
    },
    {
      title: 'Total Outstanding',
      value: formatCurrency(summary.totalOutstanding),
      subtext: 'Unpaid Cafe credit total',
      icon: Wallet01Icon,
      iconBg: 'bg-cinnamon/10 text-cinnamon border-cinnamon/20',
      highlightBorder: summary.totalOutstanding > 0 ? 'border-cinnamon/30' : undefined,
      active: false,
    },
    {
      title: 'Collected Today',
      value: formatCurrency(summary.collectedToday),
      subtext: "Today's recorded payments",
      icon: InvoiceIcon,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      active: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => {
        const isClickable = Boolean(card.onClick);
        return (
          <Card
            key={index}
            onClick={card.onClick}
            className={`border bg-card rounded-xl shadow-2xs transition-all ${
              card.highlightBorder || 'border-border/80'
            } ${
              card.active
                ? 'ring-2 ring-cinnamon ring-offset-1 dark:ring-offset-background'
                : ''
            } ${
              isClickable ? 'cursor-pointer hover:border-cinnamon/60 hover:shadow-xs' : ''
            }`}
          >
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground truncate uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-heading text-foreground truncate">
                    {card.value}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                    {card.subtext}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs ${card.iconBg}`}
                >
                  <HugeiconsIcon icon={card.icon} size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

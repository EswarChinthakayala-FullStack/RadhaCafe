import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterKpiSummary } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  DropletIcon,
  Wallet01Icon,
  SparklesIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons';

interface WaterKpiCardsProps {
  data?: WaterKpiSummary;
  isLoading?: boolean;
  isError?: boolean;
}

export const WaterKpiCards: React.FC<WaterKpiCardsProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-24 rounded-md" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-md bg-card border border-destructive/20 text-destructive text-xs text-center">
        Failed to load RadhaWater operational metrics.
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Water Revenue',
      value: formatCurrency(data.totalRevenue),
      change: data.revenueChangePct,
      icon: DropletIcon,
      accent: 'border-cinnamon/30 bg-cinnamon/5 text-cinnamon',
      iconBg: 'bg-cinnamon/15 text-cinnamon border-cinnamon/20',
    },
    {
      title: 'Total Water Orders',
      value: data.totalOrders.toString(),
      change: data.ordersChangePct,
      icon: InvoiceIcon,
      accent: 'border-border/80 bg-card text-foreground',
      iconBg: 'bg-secondary text-foreground border-border/40',
    },
    {
      title: 'Avg Water Order Value',
      value: formatCurrency(data.avgOrderValue),
      change: undefined,
      icon: Analytics01Icon,
      accent: 'border-border/80 bg-card text-foreground',
      iconBg: 'bg-secondary text-foreground border-border/40',
    },
    {
      title: '20L Cans Sold',
      value: `${data.totalCansSold} Cans`,
      subtext: `Normal: ${data.normalCansSold} | Cooling: ${data.coolingCansSold}`,
      change: data.cansChangePct,
      icon: DropletIcon,
      accent: 'border-cinnamon/30 bg-cinnamon/5 text-cinnamon',
      iconBg: 'bg-cinnamon/15 text-cinnamon border-cinnamon/20',
    },
    {
      title: 'Payments Collected',
      value: formatCurrency(data.totalPaid),
      icon: Wallet01Icon,
      accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Outstanding Due',
      value: formatCurrency(data.totalDue),
      icon: Wallet01Icon,
      accent: 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
    },
    {
      title: 'Event Requests',
      value: data.totalEvents.toString(),
      icon: SparklesIcon,
      accent: 'border-border/80 bg-card text-foreground',
      iconBg: 'bg-secondary text-foreground border-border/40',
    },
    {
      title: 'Confirmed Events',
      value: data.confirmedEvents.toString(),
      icon: CheckmarkCircle02Icon,
      accent: 'border-border/80 bg-card text-foreground',
      iconBg: 'bg-secondary text-foreground border-border/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className={`border rounded-md shadow-2xs ${kpi.accent}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                {kpi.title}
              </p>
              <p className="text-2xl font-bold font-heading">{kpi.value}</p>
              {kpi.subtext && (
                <p className="text-[10px] text-muted-foreground font-medium">{kpi.subtext}</p>
              )}
              {typeof kpi.change === 'number' && kpi.change !== 0 && (
                <div className="flex items-center gap-1 text-[11px] font-bold pt-0.5">
                  {kpi.change > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <HugeiconsIcon icon={ArrowUp01Icon} size={13} />
                      <span>+{kpi.change}% vs prev period</span>
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-0.5">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={13} />
                      <span>{kpi.change}% vs prev period</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className={`w-10 h-10 rounded-md flex items-center justify-center border shrink-0 ${kpi.iconBg}`}>
              <HugeiconsIcon icon={kpi.icon} size={20} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

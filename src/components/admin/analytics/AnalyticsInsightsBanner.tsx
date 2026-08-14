import { Card, CardContent } from '../../ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Time02Icon,
  ShoppingBag02Icon,
  QrCodeIcon,
} from '@hugeicons/core-free-icons';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { CafeAnalyticsSummary } from '../../../types';

interface AnalyticsInsightsBannerProps {
  summary?: CafeAnalyticsSummary;
  isLoading: boolean;
}

export function AnalyticsInsightsBanner({ summary, isLoading }: AnalyticsInsightsBannerProps) {
  if (isLoading || !summary || summary.completed_orders === 0) return null;

  const insights: Array<{ icon: any; text: string; highlight: string }> = [];

  if (summary.top_selling_item) {
    insights.push({
      icon: ShoppingBag02Icon,
      highlight: summary.top_selling_item.name,
      text: `was the top product with ${summary.top_selling_item.quantity} units sold (${formatCurrency(
        summary.top_selling_item.revenue
      )})`,
    });
  }

  if (summary.busiest_hour) {
    insights.push({
      icon: Time02Icon,
      highlight: summary.busiest_hour.label,
      text: `was the peak ordering window (${summary.busiest_hour.orders} orders)`,
    });
  }

  if (summary.upi_collection_pct > 0) {
    insights.push({
      icon: QrCodeIcon,
      highlight: `${summary.upi_collection_pct}% of payments`,
      text: `were received via UPI / QR digital inflows`,
    });
  }

  if (insights.length === 0) return null;

  return (
    <Card className="border border-cinnamon/20 bg-cinnamon/5 rounded-2xl overflow-hidden shadow-2xs">
      <CardContent className="p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cinnamon font-bold shrink-0">
          <div className="p-1.5 rounded-lg bg-cinnamon/15">
            <HugeiconsIcon icon={SparklesIcon} size={15} />
          </div>
          <span>At a Glance</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground flex-1">
          {insights.map((ins, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <HugeiconsIcon icon={ins.icon} size={14} className="text-cinnamon shrink-0" />
              <span>
                <strong className="text-foreground font-semibold">{ins.highlight}</strong> {ins.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

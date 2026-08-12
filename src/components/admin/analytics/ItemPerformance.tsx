import { useTopSellingItems } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Loader } from '../../shared/Loader';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PackageIcon, ShoppingBag02Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface ItemPerformanceProps {
  range: AnalyticsDateRange;
  customStart?: string;
  customEnd?: string;
}

export function ItemPerformance({ range, customStart, customEnd }: ItemPerformanceProps) {
  const { data: topItems, isLoading, isError } = useTopSellingItems(range, customStart, customEnd, 5);

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-xs h-80 flex items-center justify-center">
        <Loader label="Loading top items..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/80 bg-card shadow-xs p-6 text-center text-xs text-destructive">
        Unable to load top item analytics.
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={ShoppingBag02Icon} size={18} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Top-Selling Items
            </CardTitle>
            <CardDescription className="text-xs">
              Best performing menu items ranked by completed sales quantity.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-xs">
        {topItems && topItems.length > 0 ? (
          <div className="space-y-3">
            {topItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-md border border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`w-6 h-6 rounded-full flex items-center justify-center p-0 font-bold text-xs ${item.rank === 1
                      ? 'bg-amber-500/15 text-amber-700 border-amber-500/40'
                      : item.rank === 2
                        ? 'bg-slate-400/15 text-slate-700 border-slate-400/40'
                        : item.rank === 3
                          ? 'bg-amber-700/15 text-amber-900 border-amber-700/40'
                          : 'bg-muted text-muted-foreground border-border/80'
                      }`}
                  >
                    #{item.rank}
                  </Badge>
                  <div>
                    <p className="font-bold text-foreground truncate max-w-[160px] sm:max-w-[220px]">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.quantity} sold</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold font-mono text-cinnamon text-xs">{formatCurrency(item.revenue)}</p>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-md text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={PackageIcon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No item sales recorded</p>
            <p className="text-[11px] text-muted-foreground">
              Top menu items will display here automatically once completed orders are placed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

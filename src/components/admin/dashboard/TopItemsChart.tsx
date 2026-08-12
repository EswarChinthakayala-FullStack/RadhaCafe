import { useTopSellingItems } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

export function TopItemsChart() {
  const { data: topItems, isLoading } = useTopSellingItems('today', 5);

  const maxQty = topItems && topItems.length > 0 ? Math.max(...topItems.map((i) => i.quantity)) : 1;

  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Coffee02Icon} size={18} className="text-primary" />
          <CardTitle className="text-base font-bold font-heading text-foreground">
            Top Selling Items Today
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md bg-muted" />
            ))}
          </div>
        ) : !topItems || topItems.length === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-md p-6 text-center space-y-2">
            <HugeiconsIcon icon={Coffee02Icon} size={28} className="text-muted-foreground/40" />
            <p className="text-xs font-bold text-foreground">No item sales recorded today</p>
            <p className="text-[11px] text-muted-foreground">
              Item sales will automatically rank here as orders are placed.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {topItems.map((item, idx) => {
              const pct = Math.round((item.quantity / maxQty) * 100);
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                      <Badge variant="outline" className="text-[10px] h-5 w-5 rounded-full p-0 flex items-center justify-center font-bold text-cinnamon border-cinnamon/30">
                        #{idx + 1}
                      </Badge>
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-foreground">{item.quantity} sold</span>
                      <span className="font-bold text-primary">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-gradient-to-r from-cinnamon to-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

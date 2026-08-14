import { Link } from 'react-router-dom';
import { useTopSellingItems } from '../../../hooks/useAnalytics';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface TopItemsChartProps {
  range: AnalyticsDateRange;
}

export function TopItemsChart({ range }: TopItemsChartProps) {
  const { data: topItems, isLoading } = useTopSellingItems(range, 5);

  const maxQty = topItems && topItems.length > 0 ? Math.max(...topItems.map((i) => i.quantity)) : 1;

  return (
    <Card className="border border-border/80 bg-card rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
            <HugeiconsIcon icon={Coffee02Icon} size={16} />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Top Selling Menu Items
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Ranked by quantity sold {range === 'today' ? 'today' : 'in period'}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ADMIN.ANALYTICS}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>All Items</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </Link>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted" />
            ))}
          </div>
        ) : !topItems || topItems.length === 0 ? (
          <div className="h-56 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
              <HugeiconsIcon icon={Coffee02Icon} size={20} />
            </div>
            <p className="text-xs font-bold text-foreground">No item sales recorded yet</p>
            <p className="text-[11px] text-muted-foreground">
              Items will rank here automatically as customer orders are placed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, idx) => {
              const pct = Math.round((item.quantity / maxQty) * 100);
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 font-bold text-foreground">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 w-5 rounded-full p-0 flex items-center justify-center font-extrabold shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500/15 text-amber-700 border-amber-500/40'
                            : idx === 1
                            ? 'bg-slate-300/30 text-slate-700 border-slate-400/40'
                            : idx === 2
                            ? 'bg-amber-700/15 text-amber-800 border-amber-700/40'
                            : 'bg-secondary text-muted-foreground border-border/60'
                        }`}
                      >
                        #{idx + 1}
                      </Badge>
                      <span className="truncate font-medium">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="font-semibold text-muted-foreground">
                        {item.quantity} sold
                      </span>
                      <span className="font-bold text-foreground min-w-[60px] text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/30">
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

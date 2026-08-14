import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBag02Icon,
  PackageIcon,
  ShoppingBasket01Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import type { CafeProductPerformance, DateRangeBounds } from '../../../types';

interface ProductPerformanceSectionProps {
  products?: CafeProductPerformance[];
  isLoading: boolean;
  bounds: DateRangeBounds;
}

export function ProductPerformanceSection({
  products,
  isLoading,
  bounds,
}: ProductPerformanceSectionProps) {
  const [metric, setMetric] = useState<'quantity' | 'revenue'>('quantity');

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-5 w-44 bg-muted/60" />
          <Skeleton className="h-3 w-64 bg-muted/40" />
        </CardHeader>
        <CardContent className="p-6 h-80 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const items = products && products.length > 0 ? products : [];
  const topForChart = items.slice(0, 7);

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={ShoppingBag02Icon} size={16} />
            </div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Product Performance
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Top performing menu items during {bounds.label}
          </CardDescription>
        </div>

        {/* Toggle: Quantity vs Revenue */}
        <div className="flex items-center p-1 rounded-xl bg-secondary/60 border border-border/60 self-start sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMetric('quantity')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              metric === 'quantity'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={ShoppingBasket01Icon} size={12} className="text-cinnamon" />
            <span>Quantity Sold</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMetric('revenue')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              metric === 'revenue'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={Wallet01Icon} size={12} className="text-cinnamon" />
            <span>Revenue (₹)</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {items.length > 0 ? (
          <>
            {/* Horizontal Bar Chart */}
            <div className="h-60 sm:h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topForChart}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (metric === 'revenue' ? `₹${v}` : String(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="item_name"
                    stroke="var(--foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickFormatter={(name) => (name.length > 13 ? `${name.slice(0, 12)}…` : name)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d: CafeProductPerformance = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-40">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-foreground">{d.item_name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60">
                                {d.category_name}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-cinnamon font-semibold">
                              <span>Quantity Sold:</span>
                              <span className="font-bold">{d.quantity_sold} units</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-foreground font-semibold">
                              <span>Total Sales:</span>
                              <span className="font-bold">{formatCurrency(d.revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Revenue Share:</span>
                              <span>{d.revenue_share_pct}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={metric === 'revenue' ? 'revenue' : 'quantity_sold'}
                    fill="#C86624"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ranked Product List Table */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                <span>Ranked Items</span>
                <span>Revenue Share</span>
              </div>

              <div className="space-y-2">
                {items.map((prod) => (
                  <div
                    key={prod.item_name}
                    className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/60 flex items-center justify-between gap-3 transition-colors text-xs"
                  >
                    {/* Left: Rank, Name & Category */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          prod.rank === 1
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-500/40'
                            : prod.rank === 2
                            ? 'bg-slate-400/20 text-slate-700 dark:text-slate-300 font-bold border border-slate-400/40'
                            : prod.rank === 3
                            ? 'bg-amber-800/20 text-amber-900 dark:text-amber-500 font-bold border border-amber-800/40'
                            : 'bg-muted text-muted-foreground border border-border/60'
                        }`}
                      >
                        {prod.rank}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground truncate">{prod.item_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/60 shrink-0">
                            {prod.category_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {prod.quantity_sold} sold • avg {formatCurrency(prod.avg_price)}/unit
                        </p>
                      </div>
                    </div>

                    {/* Right: Revenue & Share Progress */}
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-bold font-mono text-cinnamon text-xs">{formatCurrency(prod.revenue)}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-14 sm:w-20 bg-secondary/60 h-1.5 rounded-full overflow-hidden border border-border/40">
                          <div
                            className="bg-cinnamon h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, prod.revenue_share_pct))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono font-medium">
                          {prod.revenue_share_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={PackageIcon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No menu item sales recorded</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Product sales rankings will plot here automatically once completed orders are placed during {bounds.label}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

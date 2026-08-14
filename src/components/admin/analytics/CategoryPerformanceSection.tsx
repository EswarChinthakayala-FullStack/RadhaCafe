import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
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
import { Menu01Icon, PackageIcon } from '@hugeicons/core-free-icons';
import type { CafeCategoryPerformance, DateRangeBounds } from '../../../types';

interface CategoryPerformanceSectionProps {
  categories?: CafeCategoryPerformance[];
  isLoading: boolean;
  bounds: DateRangeBounds;
}

export function CategoryPerformanceSection({
  categories,
  isLoading,
  bounds,
}: CategoryPerformanceSectionProps) {
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

  const items = categories && categories.length > 0 ? categories : [];

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={Menu01Icon} size={16} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Category Performance
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Revenue and sales volume by category ({bounds.label})
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {items.length > 0 ? (
          <>
            {/* Horizontal Bar Chart */}
            <div className="h-48 sm:h-52 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={items}
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
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category_name"
                    stroke="var(--foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tickFormatter={(name) => (name.length > 12 ? `${name.slice(0, 11)}…` : name)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d: CafeCategoryPerformance = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-36">
                            <p className="font-bold text-foreground">{d.category_name}</p>
                            <div className="flex items-center justify-between gap-3 text-cinnamon font-semibold">
                              <span>Revenue:</span>
                              <span className="font-bold">{formatCurrency(d.revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Quantity Sold:</span>
                              <span>{d.quantity_sold} items</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Share:</span>
                              <span>{d.revenue_share_pct}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#6F4E37"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              {items.map((cat) => (
                <div
                  key={cat.category_id}
                  className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/60 space-y-2 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{cat.category_name}</span>
                      <p className="text-[11px] text-muted-foreground">
                        {cat.item_count} active {cat.item_count === 1 ? 'item' : 'items'} • {cat.quantity_sold} sold
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-cinnamon text-xs">
                        {formatCurrency(cat.revenue)}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                        ({cat.revenue_share_pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden border border-border/40">
                    <div
                      className="bg-[#6F4E37] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, cat.revenue_share_pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={PackageIcon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No category sales recorded</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Category distribution will display here once orders are placed during {bounds.label}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

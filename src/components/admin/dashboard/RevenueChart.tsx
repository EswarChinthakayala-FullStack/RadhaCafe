import { useRevenueTrend } from '../../../hooks/useAnalytics';
import type { AnalyticsDateRange } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, Coffee02Icon } from '@hugeicons/core-free-icons';

interface RevenueChartProps {
  range: AnalyticsDateRange;
}

export function RevenueChart({ range }: RevenueChartProps) {
  const { data: trend, isLoading } = useRevenueTrend(range);

  const hasData = trend && trend.length > 0 && trend.some((pt) => pt.revenue > 0);
  const totalPeriodRevenue = trend?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;

  return (
    <Card className="border border-border/80 bg-card rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <HugeiconsIcon icon={Analytics01Icon} size={16} />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Sales Revenue Trend
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {range === 'today' ? 'Hourly sales flow today' : 'Daily sales volume over time'}
            </p>
          </div>
        </div>

        {hasData && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Period Total
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-foreground font-heading">
              {formatCurrency(totalPeriodRevenue)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="h-60 w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg bg-muted" />
          </div>
        ) : !hasData ? (
          <div className="h-60 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <HugeiconsIcon icon={Coffee02Icon} size={20} />
            </div>
            <p className="text-xs font-bold text-foreground">No completed sales yet</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Completed cafe orders during this period will automatically map to the revenue curve.
            </p>
          </div>
        ) : (
          <div className="h-60 sm:h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B85C1E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B85C1E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border, #E8D8C8)"
                  opacity={0.6}
                />

                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground, #7A6258)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />

                <YAxis
                  stroke="var(--muted-foreground, #7A6258)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-card border border-border text-foreground rounded-lg shadow-lg space-y-1 text-xs font-semibold">
                          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                            {label}
                          </p>
                          <p className="text-primary font-bold text-sm">
                            {formatCurrency(data.revenue)}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {data.orders} {data.orders === 1 ? 'order' : 'orders'} completed
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B85C1E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

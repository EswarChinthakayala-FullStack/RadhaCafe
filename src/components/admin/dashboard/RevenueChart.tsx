import { useState } from 'react';
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

export function RevenueChart() {
  const [range, setRange] = useState<AnalyticsDateRange>('today');
  const { data: trend, isLoading } = useRevenueTrend(range);

  const hasData = trend && trend.length > 0 && trend.some((pt) => pt.revenue > 0);

  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Analytics01Icon} size={18} className="text-primary" />
          <CardTitle className="text-base font-bold font-heading text-foreground">
            Revenue Trend
          </CardTitle>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-md border border-border/60 self-start sm:self-auto">
          {(['today', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${range === r
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {r === 'today' ? 'Today' : r === 'week' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="h-64 w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-md bg-muted" />
          </div>
        ) : !hasData ? (
          <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-md p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <HugeiconsIcon icon={Coffee02Icon} size={20} />
            </div>
            <p className="text-xs font-bold text-foreground">No completed sales yet</p>
            <p className="text-[11px] text-muted-foreground">
              Sales completed during this period will automatically plot on the chart.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary, #b85c1e)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary, #b85c1e)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border, #2c1810)" opacity={0.5} />

                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground, #a08a80)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="var(--muted-foreground, #a08a80)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-card border border-border text-foreground rounded-md shadow-xl space-y-1 text-xs font-semibold">
                          <p className="text-muted-foreground text-[10px] uppercase font-bold">{label}</p>
                          <p className="text-primary font-bold">{formatCurrency(data.revenue)}</p>
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {data.orders} {data.orders === 1 ? 'order' : 'orders'}
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
                  stroke="var(--primary, #b85c1e)"
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

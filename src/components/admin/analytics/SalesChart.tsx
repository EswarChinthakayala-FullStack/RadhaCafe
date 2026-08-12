import { useRevenueTrend } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Loader } from '../../shared/Loader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { AnalyticsDateRange } from '../../../types';

interface SalesChartProps {
  range: AnalyticsDateRange;
  customStart?: string;
  customEnd?: string;
}

export function SalesChart({ range, customStart, customEnd }: SalesChartProps) {
  const { data: trendData, isLoading } = useRevenueTrend(range, customStart, customEnd);

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-sm h-80 flex items-center justify-center">
        <Loader label="Loading revenue trend..." />
      </Card>
    );
  }

  const chartData = trendData && trendData.length > 0 ? trendData : [];

  return (
    <Card className="border-border/80 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold font-heading text-foreground">Revenue Trend</CardTitle>
        <CardDescription className="text-xs">
          Completed order revenue aggregated over the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {chartData.length > 0 ? (
          <div className="h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 rounded-lg shadow-md text-xs space-y-1">
                          <p className="font-bold text-foreground">{data.label}</p>
                          <p className="text-primary font-semibold">
                            Revenue: {formatCurrency(data.revenue)}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            Orders: {data.orders}
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
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border border-dashed border-border/80 rounded-md text-xs text-muted-foreground italic">
            No completed sales data available for the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Analytics01Icon,
  Invoice01Icon,
  Wallet01Icon,
  ChartIncreaseIcon,
  CreditCardIcon,
} from '@hugeicons/core-free-icons';
import type { CafeTrendPoint, DateRangeBounds } from '../../../types';

interface RevenueTrendChartProps {
  data?: CafeTrendPoint[];
  isLoading: boolean;
  bounds: DateRangeBounds;
}

type TrendMetric = 'sales' | 'orders' | 'aov' | 'collected';

export function RevenueTrendChart({ data, isLoading, bounds }: RevenueTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<TrendMetric>('sales');

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

  const chartData = data && data.length > 0 ? data : [];
  const hasData = chartData.some((p) => p.sales > 0 || p.orders > 0 || p.collected > 0);

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'orders':
        return {
          title: 'Order Volume',
          color: '#6F4E37',
          yFormatter: (v: number) => String(v),
          tooltipFormatter: (v: number) => `${v} orders`,
        };
      case 'aov':
        return {
          title: 'Avg Order Value',
          color: '#D97706',
          yFormatter: (v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
          tooltipFormatter: (v: number) => formatCurrency(v),
        };
      case 'collected':
        return {
          title: 'Payment Inflows',
          color: '#059669',
          yFormatter: (v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
          tooltipFormatter: (v: number) => formatCurrency(v),
        };
      case 'sales':
      default:
        return {
          title: 'Sales Revenue',
          color: '#C86624',
          yFormatter: (v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
          tooltipFormatter: (v: number) => formatCurrency(v),
        };
    }
  };

  const metricConfig = getMetricConfig();

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Analytics01Icon} size={16} />
            </div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Sales & Order Trends
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            {bounds.granularity === 'hour'
              ? 'Hourly performance breakdown'
              : bounds.granularity === 'day'
              ? 'Daily performance progression'
              : 'Period trend analysis'}{' '}
            ({bounds.label})
          </CardDescription>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-secondary/60 border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setActiveMetric('sales')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              activeMetric === 'sales'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={Wallet01Icon} size={12} className="text-cinnamon" />
            <span>Sales</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setActiveMetric('orders')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              activeMetric === 'orders'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={Invoice01Icon} size={12} className="text-[#6F4E37]" />
            <span>Orders</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setActiveMetric('aov')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              activeMetric === 'aov'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={ChartIncreaseIcon} size={12} className="text-amber-600" />
            <span>AOV</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setActiveMetric('collected')}
            className={`h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5 transition-all ${
              activeMetric === 'collected'
                ? 'bg-card text-foreground font-bold shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HugeiconsIcon icon={CreditCardIcon} size={12} className="text-emerald-600" />
            <span>Collected</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-4">
        {hasData ? (
          <div className="h-72 sm:h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'orders' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={metricConfig.yFormatter}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d: CafeTrendPoint = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-36">
                            <p className="font-bold text-foreground">{d.label}</p>
                            <div className="flex items-center justify-between gap-3 text-[#6F4E37] font-semibold">
                              <span>Orders:</span>
                              <span className="font-bold">{d.orders}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Sales:</span>
                              <span>{formatCurrency(d.sales)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill={metricConfig.color}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              ) : activeMetric === 'aov' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={metricConfig.yFormatter}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d: CafeTrendPoint = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-40">
                            <p className="font-bold text-foreground">{d.label}</p>
                            <div className="flex items-center justify-between gap-3 text-amber-600 font-semibold">
                              <span>Avg Order:</span>
                              <span className="font-bold">{formatCurrency(d.aov)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Sales ({d.orders} ord):</span>
                              <span>{formatCurrency(d.sales)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aov"
                    stroke={metricConfig.color}
                    strokeWidth={2.5}
                    dot={{ fill: metricConfig.color, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`trendGrad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={metricConfig.yFormatter}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d: CafeTrendPoint = payload[0].payload;
                        const val = activeMetric === 'collected' ? d.collected : d.sales;
                        return (
                          <div className="bg-popover border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-40">
                            <p className="font-bold text-foreground">{d.label}</p>
                            <div className="flex items-center justify-between gap-3 font-semibold" style={{ color: metricConfig.color }}>
                              <span>{metricConfig.title}:</span>
                              <span className="font-bold">{formatCurrency(val)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
                              <span>Orders:</span>
                              <span>{d.orders} orders</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={metricConfig.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#trendGrad-${activeMetric})`}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 sm:h-80 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={Analytics01Icon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No sales recorded for this period</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Trend data will plot automatically as guests place completed orders during {bounds.label}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

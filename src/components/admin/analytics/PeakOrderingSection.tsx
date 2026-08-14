import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';
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
import { Time02Icon, Calendar01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { CafePeakHoursAnalytics, DateRangeBounds } from '../../../types';

interface PeakOrderingSectionProps {
  analytics?: CafePeakHoursAnalytics;
  isLoading: boolean;
  bounds: DateRangeBounds;
}

export function PeakOrderingSection({ analytics, isLoading, bounds }: PeakOrderingSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-5 w-44 bg-muted/60" />
          <Skeleton className="h-3 w-64 bg-muted/40" />
        </CardHeader>
        <CardContent className="p-6 h-72 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const hourlyData = (analytics?.hourly || []).filter((h) => {
    // Show hours between 6 AM and 11 PM or any hour with orders
    return (h.hour >= 6 && h.hour <= 23) || h.order_count > 0;
  });

  const dayData = analytics?.day_of_week;
  const busiest = analytics?.busiest_hour;
  const hasOrders = hourlyData.some((h) => h.order_count > 0);

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Time02Icon} size={16} />
            </div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Peak Ordering Times
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Understand when the Cafe experiences highest order traffic ({bounds.label})
          </CardDescription>
        </div>

        {busiest && (
          <Badge
            variant="outline"
            className="text-xs font-bold text-cinnamon border-cinnamon/30 bg-cinnamon/10 px-3 py-1 rounded-full gap-1.5 self-start sm:self-auto"
          >
            <HugeiconsIcon icon={SparklesIcon} size={13} />
            <span>
              Peak: {busiest.label} ({busiest.orders} orders)
            </span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {hasOrders ? (
          <div className={`grid ${dayData ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6 items-start`}>
            {/* Hourly Distribution Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Time02Icon} size={13} className="text-cinnamon" />
                  <span>Hourly Order Distribution</span>
                </span>
                <span>Orders</span>
              </div>

              <div className="h-60 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                    <XAxis
                      dataKey="label"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={window.innerWidth < 640 ? 2 : 1}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border/80 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-foreground">{d.label}</p>
                              <p className="text-cinnamon font-semibold">{d.order_count} completed orders</p>
                              <p className="text-muted-foreground text-[11px]">{formatCurrency(d.revenue)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="order_count"
                      fill="#C86624"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day of Week Distribution Chart (for 7d+ periods) */}
            {dayData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-cinnamon" />
                    <span>Orders by Day of Week</span>
                  </span>
                  <span>Orders</span>
                </div>

                <div className="h-60 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <XAxis
                        dataKey="day_name"
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
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-popover border border-border/80 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                                <p className="font-bold text-foreground">{d.day_name}</p>
                                <p className="text-[#6F4E37] font-semibold">{d.order_count} orders</p>
                                <p className="text-muted-foreground text-[11px]">
                                  Sales: {formatCurrency(d.revenue)} • avg {formatCurrency(d.avg_order_value)}/ord
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="order_count"
                        fill="#6F4E37"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={Time02Icon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No peak order activity recorded</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Hourly order density will display here as guests place orders during {bounds.label}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

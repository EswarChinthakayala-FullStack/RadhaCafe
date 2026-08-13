import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterRevenuePoint } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { DropletIcon } from '@hugeicons/core-free-icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface WaterRevenueChartProps {
  data?: WaterRevenuePoint[];
  isLoading?: boolean;
  isError?: boolean;
  title?: string;
  description?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: WaterRevenuePoint = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{data.label || label}</p>
        <div className="flex justify-between items-center gap-4 text-cinnamon font-bold">
          <span>Revenue:</span>
          <span>{formatCurrency(data.revenue)}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-muted-foreground">
          <span>Water Orders:</span>
          <span>{data.orders}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const WaterRevenueChart: React.FC<WaterRevenueChartProps> = ({
  data = [],
  isLoading,
  isError,
  title = 'Water Revenue Trend',
  description = 'Revenue generated from 20L drinking water sales over time.',
}) => {
  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={DropletIcon} size={18} className="text-cinnamon" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : isError ? (
          <div className="h-64 flex items-center justify-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/20">
            Failed to load water revenue trend data.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-md border border-dashed border-border/80 p-4 text-center">
            <HugeiconsIcon icon={DropletIcon} size={28} className="text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No revenue data available for this range.</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Start placing water orders to see sales trends.</p>
          </div>
        ) : (
          <div className="h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9825B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9825B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
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
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D9825B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waterRevenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

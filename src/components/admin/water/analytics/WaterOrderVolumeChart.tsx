import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { WaterOrderVolumePoint } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { InvoiceIcon } from '@hugeicons/core-free-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface WaterOrderVolumeChartProps {
  data?: WaterOrderVolumePoint[];
  isLoading?: boolean;
  isError?: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data: WaterOrderVolumePoint = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{data.label || label}</p>
        <div className="flex justify-between items-center gap-4 text-emerald-600 dark:text-emerald-400 font-semibold">
          <span>Completed Orders:</span>
          <span>{data.completed}</span>
        </div>
        {data.cancelled > 0 && (
          <div className="flex justify-between items-center gap-4 text-destructive font-semibold">
            <span>Cancelled Orders:</span>
            <span>{data.cancelled}</span>
          </div>
        )}
        <div className="flex justify-between items-center gap-4 text-foreground font-bold pt-1 border-t border-border/40">
          <span>Total Orders:</span>
          <span>{data.total}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const WaterOrderVolumeChart: React.FC<WaterOrderVolumeChartProps> = ({
  data = [],
  isLoading,
  isError,
}) => {
  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={InvoiceIcon} size={18} className="text-cinnamon" />
          <span>Water Order Volume Trend</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Daily volume of completed and cancelled water orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : isError ? (
          <div className="h-64 flex items-center justify-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/20">
            Failed to load water order volume data.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-md border border-dashed border-border/80 p-4 text-center">
            <HugeiconsIcon icon={InvoiceIcon} size={28} className="text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No order volume data found.</p>
          </div>
        ) : (
          <div className="h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="completed" name="Completed Orders" fill="#D9825B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled Orders" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

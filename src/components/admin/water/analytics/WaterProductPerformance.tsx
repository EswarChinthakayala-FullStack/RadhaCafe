import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterProductPerfItem } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { DropletIcon } from '@hugeicons/core-free-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

interface WaterProductPerformanceProps {
  data?: WaterProductPerfItem[];
  isLoading?: boolean;
  isError?: boolean;
}

const BAR_COLORS = ['#D9825B', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data: WaterProductPerfItem = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{data.product_name}</p>
        <div className="flex justify-between items-center gap-4 text-cinnamon font-bold">
          <span>Cans Sold:</span>
          <span>{data.quantity} Cans</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-foreground font-semibold">
          <span>Revenue Generated:</span>
          <span>{formatCurrency(data.revenue)}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-muted-foreground text-[11px]">
          <span>Share:</span>
          <span>{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const WaterProductPerformance: React.FC<WaterProductPerformanceProps> = ({
  data = [],
  isLoading,
  isError,
}) => {
  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={DropletIcon} size={18} className="text-cinnamon" />
          <span>Water Product Performance</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Ranked comparison of 20L water cans sold and revenue generated.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : isError ? (
          <div className="h-64 flex items-center justify-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/20">
            Failed to load water product performance.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-md border border-dashed border-border/80 p-4 text-center">
            <HugeiconsIcon icon={DropletIcon} size={28} className="text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No product performance data available.</p>
          </div>
        ) : (
          <>
            <div className="h-64 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    stroke="var(--foreground)"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantity" name="Cans Sold" radius={[0, 4, 4, 0]}>
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Ranked List */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <h4 className="text-xs font-bold text-foreground font-heading uppercase tracking-wider">
                Product Sales Breakdown
              </h4>
              <div className="divide-y divide-border/40 text-xs">
                {data.map((item, idx) => (
                  <div key={item.product_id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cinnamon/10 text-cinnamon font-bold text-[10px] flex items-center justify-center shrink-0 border border-cinnamon/20">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{item.product_name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.quantity} Cans Sold</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-cinnamon">{formatCurrency(item.revenue)}</p>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {item.percentage}% Share
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

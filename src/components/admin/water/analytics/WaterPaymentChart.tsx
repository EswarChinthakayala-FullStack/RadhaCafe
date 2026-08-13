import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterPaymentStatusItem } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wallet01Icon } from '@hugeicons/core-free-icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface WaterPaymentChartProps {
  data?: WaterPaymentStatusItem[];
  isLoading?: boolean;
  isError?: boolean;
}

const COLORS = ['#10b981', '#f59e0b', '#d97706'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data: WaterPaymentStatusItem = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{data.label}</p>
        <div className="flex justify-between items-center gap-4 text-foreground font-semibold">
          <span>Orders Count:</span>
          <span>{data.count} Orders</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-cinnamon font-bold">
          <span>Amount:</span>
          <span>{formatCurrency(data.amount)}</span>
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

export const WaterPaymentChart: React.FC<WaterPaymentChartProps> = ({
  data = [],
  isLoading,
  isError,
}) => {
  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Wallet01Icon} size={18} className="text-cinnamon" />
          <span>Water Payment Collections Overview</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Financial breakdown between fully paid, partial, and pending Pay-Later orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : isError ? (
          <div className="h-64 flex items-center justify-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/20">
            Failed to load water payment analytics.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-md border border-dashed border-border/80 p-4 text-center">
            <HugeiconsIcon icon={Wallet01Icon} size={28} className="text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No payment data available.</p>
          </div>
        ) : (
          <>
            <div className="h-60 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="label"
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-xs text-center">
              {data.map((item) => (
                <div key={item.status} className="p-2.5 rounded-md bg-secondary/40 border border-border/40 space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{item.label}</p>
                  <p className="font-bold font-mono text-foreground">{formatCurrency(item.amount)}</p>
                  <Badge variant="outline" className="text-[9px] font-bold">
                    {item.percentage}% ({item.count})
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

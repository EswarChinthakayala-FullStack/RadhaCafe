import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { WaterEventAnalyticsData } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, Calendar01Icon } from '@hugeicons/core-free-icons';
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

interface WaterEventAnalyticsProps {
  data?: WaterEventAnalyticsData;
  isLoading?: boolean;
  isError?: boolean;
}

const CustomTimeTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-md shadow-xl text-xs space-y-1 z-50">
        <p className="font-bold text-foreground">{item.label || label}</p>
        <div className="flex justify-between items-center gap-4 text-amber-600 font-semibold">
          <span>New Inquiries:</span>
          <span>{item.new}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-emerald-600 font-semibold">
          <span>Confirmed Events:</span>
          <span>{item.confirmed}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-cinnamon font-bold">
          <span>Completed Events:</span>
          <span>{item.completed}</span>
        </div>
        <div className="flex justify-between items-center gap-4 text-foreground font-bold pt-1 border-t border-border/40">
          <span>Estimated Cans:</span>
          <span>{item.estimated_cans} Cans</span>
        </div>
      </div>
    );
  }
  return null;
};

export const WaterEventAnalytics: React.FC<WaterEventAnalyticsProps> = ({
  data,
  isLoading,
  isError,
}) => {
  const summary = data?.summary || {
    totalEvents: 0,
    newEvents: 0,
    confirmedEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    totalEstimatedCans: 0,
  };

  const timeData = data?.timeData || [];
  const typeData = data?.typeData || [];

  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={SparklesIcon} size={18} className="text-cinnamon" />
          <span>Event Supply & Bulk Inquiry Demand</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Analytics for wedding, party, and corporate event water supply inquiries.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* KPI Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-md bg-secondary/40 border border-border/40 space-y-0.5">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Inquiries</p>
            <p className="text-xl font-bold font-heading text-foreground">{summary.totalEvents}</p>
          </div>

          <div className="p-3 rounded-md bg-cinnamon/10 border border-cinnamon/20 space-y-0.5">
            <p className="text-[10px] text-cinnamon uppercase font-semibold">Estimated Cans Needed</p>
            <p className="text-xl font-bold font-heading text-cinnamon">{summary.totalEstimatedCans} Cans</p>
          </div>

          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-semibold">Confirmed / Completed</p>
            <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
              {summary.confirmedEvents + summary.completedEvents}
            </p>
          </div>

          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 space-y-0.5">
            <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-semibold">New Pending</p>
            <p className="text-xl font-bold font-heading text-amber-700 dark:text-amber-400">{summary.newEvents}</p>
          </div>
        </div>

        {/* Charts Grid */}
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-md" />
        ) : isError ? (
          <div className="h-64 flex items-center justify-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/20">
            Failed to load event supply analytics.
          </div>
        ) : timeData.length === 0 && typeData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-xs text-muted-foreground bg-secondary/20 rounded-md border border-dashed border-border/80 p-4 text-center">
            <HugeiconsIcon icon={SparklesIcon} size={28} className="text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-foreground">No event inquiries received in this date range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Requests Over Time */}
            <div className="lg:col-span-2 space-y-2">
              <h4 className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5 uppercase tracking-wider">
                <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                <span>Event Inquiries Over Time</span>
              </h4>
              <div className="h-60 w-full min-w-0 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTimeTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="new" name="New" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#D9825B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Type Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground font-heading uppercase tracking-wider">
                Event Type Breakdown
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {typeData.map((t) => (
                  <div key={t.type} className="p-3 rounded-md bg-secondary/40 border border-border/40 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-foreground">{t.type}</p>
                      <p className="text-[10px] text-muted-foreground">{t.estimated_cans} Cans Required</p>
                    </div>
                    <Badge variant="outline" className="font-bold text-cinnamon border-cinnamon/30">
                      {t.count} Events
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

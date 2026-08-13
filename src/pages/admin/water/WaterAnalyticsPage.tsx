import { useState } from 'react';
import { useWaterAnalytics } from '../../../hooks/useWaterAnalytics';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  Wallet01Icon,
  InvoiceIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

export function WaterAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsDateRange>('today');
  const { data: analytics, isLoading } = useWaterAnalytics(range);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={DropletIcon} size={22} />
            </div>
            <span>RadhaWater Performance Analytics</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Dedicated sales performance, 20L cans distribution, revenue breakdown, and event supply metrics.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-md border border-border/80">
          {(['today', 'week', 'month'] as const).map((r) => {
            const isSelected = range === r;
            const label = r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month';
            return (
              <Button
                key={r}
                type="button"
                variant={isSelected ? 'default' : 'ghost'}
                size="xs"
                className={
                  isSelected
                    ? 'bg-cinnamon text-white font-bold text-xs h-8 rounded-md shadow-2xs'
                    : 'text-xs h-8 text-foreground/80 rounded-md'
                }
                onClick={() => setRange(r)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Water Orders</p>
              <p className="text-2xl font-bold text-foreground font-heading">
                {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalOrders || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center">
              <HugeiconsIcon icon={InvoiceIcon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-cinnamon/30 bg-cinnamon/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-cinnamon uppercase tracking-wider">Water Sales Revenue</p>
              <p className="text-2xl font-bold text-cinnamon font-heading">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cinnamon/15 text-cinnamon flex items-center justify-center border border-cinnamon/20">
              <HugeiconsIcon icon={DropletIcon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Total Payments Collected</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.totalPaid || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <HugeiconsIcon icon={Wallet01Icon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Outstanding Credit Due</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-heading">
                {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.totalDue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <HugeiconsIcon icon={Wallet01Icon} size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={DropletIcon} size={18} className="text-cinnamon" />
              <span>20L Cans Sold Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution between Normal Water (₹5) and Cooling Water (₹30).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex justify-between items-center p-3 rounded-md bg-secondary/40 border border-border/40">
                  <div>
                    <p className="font-bold text-foreground">Normal 20L Water Cans (₹5)</p>
                    <p className="text-[11px] text-muted-foreground">Standard room-temperature drinking water</p>
                  </div>
                  <span className="text-xl font-bold font-heading text-cinnamon">
                    {analytics?.normalCansSold || 0} Cans
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-md bg-secondary/40 border border-border/40">
                  <div>
                    <p className="font-bold text-foreground">Cooling 20L Water Cans (₹30)</p>
                    <p className="text-[11px] text-muted-foreground">Chilled cold drinking water</p>
                  </div>
                  <span className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400">
                    {analytics?.coolingCansSold || 0} Cans
                  </span>
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-sm">
                  <span>Total Cans Delivered</span>
                  <span className="text-foreground font-heading">{analytics?.totalCansSold || 0} Cans</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={18} className="text-cinnamon" />
              <span>Event Supply Inquiries</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Bulk water supply requests received for weddings & functions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="p-6 text-center space-y-2 rounded-md bg-cinnamon/5 border border-cinnamon/20">
                <p className="text-3xl font-bold text-cinnamon font-heading">
                  {analytics?.totalEvents || 0}
                </p>
                <p className="font-semibold text-foreground text-xs">Total Event Inquiries Received</p>
                <p className="text-[11px] text-muted-foreground">
                  Inquiries logged from the public `/water` booking page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

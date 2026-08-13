import { useNavigate } from 'react-router-dom';
import { useWaterAnalytics } from '../../../hooks/useWaterAnalytics';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { useWaterEvents } from '../../../hooks/useWaterEvents';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  PlusSignIcon,
  InvoiceIcon,
  Wallet01Icon,
  SparklesIcon,
  EyeIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export function WaterDashboardPage() {
  const navigate = useNavigate();
  const { data: analytics, isLoading: isAnalyticsLoading } = useWaterAnalytics('today');
  const { data: recentOrdersData, isLoading: isOrdersLoading } = useWaterOrders({ limit: 5 });
  const { data: pendingEventsData } = useWaterEvents('new');

  const recentOrders = recentOrdersData?.orders || [];
  const pendingEventsCount = pendingEventsData?.length || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={DropletIcon} size={22} />
            </div>
            <span>RadhaWater Operational Dashboard</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time daily metrics, water cans sold, credit ledger, and bulk event requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/water/orders/new')}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs px-4 rounded-md shadow-xs gap-2"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>New Water Order</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Orders</p>
              <p className="text-2xl font-bold text-foreground font-heading">
                {isAnalyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalOrders || 0}
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
              <p className="text-[11px] font-semibold text-cinnamon uppercase tracking-wider">Today's Revenue</p>
              <p className="text-2xl font-bold text-cinnamon font-heading">
                {isAnalyticsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cinnamon/15 text-cinnamon flex items-center justify-center border border-cinnamon/20">
              <HugeiconsIcon icon={DropletIcon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Outstanding Due</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-heading">
                {isAnalyticsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analytics?.totalDue || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <HugeiconsIcon icon={Wallet01Icon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Event Requests</p>
              <p className="text-2xl font-bold text-foreground font-heading">
                {pendingEventsCount} <span className="text-xs font-normal text-muted-foreground">new</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center border border-border/40">
              <HugeiconsIcon icon={SparklesIcon} size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cans Sold Summary Banner */}
      <div className="p-4 rounded-md bg-secondary/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={DropletIcon} size={20} />
          </div>
          <div>
            <p className="font-bold text-foreground">Today's Water Cans Sold: {analytics?.totalCansSold || 0} Cans</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Normal 20L Cans (₹5): <span className="font-semibold text-foreground">{analytics?.normalCansSold || 0}</span> | Cooling Cans (₹30): <span className="font-semibold text-foreground">{analytics?.coolingCansSold || 0}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/admin/water/analytics')}
          className="h-8 text-xs font-semibold gap-1 rounded-md border-border/80 self-start sm:self-auto"
        >
          <span>View Analytics</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </Button>
      </div>

      {/* Recent Water Orders Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-heading">
            Recent Water Orders
          </h3>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/admin/water/orders')}
            className="text-xs text-cinnamon font-bold gap-1"
          >
            <span>View All Orders</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
          </Button>
        </div>

        {isOrdersLoading ? (
          <Skeleton className="h-32 w-full rounded-md" />
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-md border border-dashed border-border/80 text-xs text-muted-foreground">
            No water orders placed today yet.
          </div>
        ) : (
          <div className="border border-border/80 rounded-md bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                <tr>
                  <th className="p-3">Water Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-bold font-mono text-cinnamon">{ord.order_number}</td>
                    <td className="p-3 font-semibold">{ord.customer_name}</td>
                    <td className="p-3 text-muted-foreground text-[11px]">{formatDate(ord.created_at)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="uppercase font-bold text-[10px]">
                        {ord.payment_method === 'pay_later' ? 'PAY LATER' : ord.payment_method}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-bold font-mono">{formatCurrency(ord.total_amount)}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => navigate('/admin/water/orders')}
                        className="h-7 text-[11px] gap-1"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={13} />
                        <span>Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

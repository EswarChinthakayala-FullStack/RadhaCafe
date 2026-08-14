import { Link } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBag01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';

export function RecentOrders() {
  const { data, isLoading } = useOrders({ page: 1, limit: 6 });

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600/15 text-emerald-700 border-emerald-600/30 text-[10px] font-bold">Completed</Badge>;
      case 'preparing':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px] font-bold">Preparing</Badge>;
      case 'pending':
        return <Badge className="bg-blue-600/15 text-blue-700 border-blue-600/30 text-[10px] font-bold">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px] font-bold">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-bold">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string | null | undefined, dueAmount: number) => {
    if (dueAmount > 0) {
      return (
        <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px] font-bold">
          Due: {formatCurrency(dueAmount)}
        </Badge>
      );
    }

    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-600/20 text-[10px] font-bold">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px] font-bold">Partial</Badge>;
      case 'outstanding':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px] font-bold">Outstanding</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-bold">Settled</Badge>;
    }
  };

  return (
    <Card className="border border-border/80 bg-card rounded-xl shadow-2xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={16} />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Recent Cafe Orders
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Live counter transactions and fulfillment status
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ADMIN.ORDERS}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>View All Orders</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted" />
            ))}
          </div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground mx-auto flex items-center justify-center">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No orders recorded yet today</p>
              <p className="text-xs text-muted-foreground">
                Start ringing up items from the POS counter to populate your live feed.
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN.NEW_ORDER}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cinnamon text-white text-xs font-bold shadow-xs hover:bg-cinnamon/90 transition-all"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              <span>Create New Order</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Visible md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-muted-foreground font-bold uppercase tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {data.orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <HugeiconsIcon icon={UserIcon} size={13} className="text-muted-foreground" />
                          <span>{order.customer_name || 'Walk-in Guest'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-foreground">
                          {order.payment_method?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {getOrderStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getPaymentStatusBadge(order.payment_status, Number(order.due_amount || 0))}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-[11px]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-foreground">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (Visible < md) */}
            <div className="md:hidden divide-y divide-border/60">
              {data.orders.slice(0, 6).map((order) => (
                <div key={order.id} className="p-3.5 space-y-2 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {order.order_number}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {order.customer_name || 'Walk-in Guest'}
                      </span>
                    </div>

                    <span className="font-extrabold text-xs text-foreground">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {getOrderStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status, Number(order.due_amount || 0))}
                    </div>

                    <span className="text-muted-foreground text-[10px]">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

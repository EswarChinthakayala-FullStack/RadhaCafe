import { Link } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon, ArrowRight01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

export function RecentOrders() {
  const { data, isLoading } = useOrders({ page: 1, limit: 5 });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Completed</Badge>;
      case 'preparing':
        return <Badge className="bg-amber-500 text-white text-[10px] font-bold">Preparing</Badge>;
      case 'pending':
        return <Badge className="bg-blue-600 text-white text-[10px] font-bold">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-[10px] font-bold">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-bold">{status}</Badge>;
    }
  };

  return (
    <Card className="border border-border/80 bg-card rounded-md shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="text-primary" />
          <CardTitle className="text-base font-bold font-heading text-foreground">
            Recent Orders
          </CardTitle>
        </div>

        <Link
          to={ROUTES.ADMIN.ORDERS}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>View All Orders</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md bg-muted" />
            ))}
          </div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={32} className="mx-auto text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No orders recorded today</p>
              <p className="text-xs text-muted-foreground">Start taking orders from the POS counter.</p>
            </div>
            <Link
              to={ROUTES.ADMIN.NEW_ORDER}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              <span>Create New Order</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-muted-foreground font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="p-3.5 pl-5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5 pr-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-foreground">
                      {order.order_number}
                    </td>
                    <td className="p-3.5 text-muted-foreground font-medium">
                      {order.customer_name || 'Walk-in Guest'}
                    </td>
                    <td className="p-3.5 capitalize text-muted-foreground font-medium">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-foreground">
                        {order.payment_method}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-3.5 text-muted-foreground font-medium whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-3.5 pr-5 text-right font-bold text-primary">
                      {formatCurrency(order.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

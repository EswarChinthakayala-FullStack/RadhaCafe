import type { Order } from '../../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { PrinterIcon, ShoppingBag01Icon, UserIcon, ViewIcon } from '@hugeicons/core-free-icons';

interface OrderCardProps {
  order: Order;
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

export function OrderCard({ order, onSelectOrder, onPrintOrder }: OrderCardProps) {
  const due = Number(order.due_amount || 0);
  const isPaid = order.payment_status === 'paid' || due === 0;
  const isPartial = order.payment_status === 'partial';

  return (
    <div className="p-4 rounded-md border border-border/80 bg-card shadow-xs hover:border-cinnamon/40 transition-all flex flex-col justify-between space-y-3">
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-2.5">
        <div>
          <span className="font-mono font-bold text-xs sm:text-sm text-primary block">
            {order.order_number}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(order.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            className={
              isPaid
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]'
                : isPartial
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]'
                : 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 text-[10px]'
            }
          >
            {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'DUE'}
          </Badge>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Details Row */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <HugeiconsIcon icon={UserIcon} size={13} />
            <span>Customer:</span>
          </span>
          <span className="font-semibold text-foreground truncate max-w-[140px]">
            {order.customer_name || 'Walk-in Customer'}
          </span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={13} />
            <span>Items:</span>
          </span>
          <span className="font-semibold text-foreground">
            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-border/40">
          <Badge variant="outline" className="uppercase font-bold text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2 py-0.5">
            {order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method}
          </Badge>
          <div className="text-right">
            <span className="font-bold text-sm text-primary font-mono block">
              {formatCurrency(order.total_amount)}
            </span>
            {!isPaid && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                Due: {formatCurrency(due)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
        <Button
          size="xs"
          variant="outline"
          onClick={() => onSelectOrder(order)}
          className="h-8 text-xs font-semibold rounded-md gap-1"
        >
          <HugeiconsIcon icon={ViewIcon} size={13} />
          <span>Details</span>
        </Button>

        <Button
          size="xs"
          onClick={() => onPrintOrder(order)}
          className="h-8 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-md gap-1 shadow-xs"
        >
          <HugeiconsIcon icon={PrinterIcon} size={13} />
          <span>Print</span>
        </Button>
      </div>
    </div>
  );
}

import type { Order } from '../../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PrinterIcon,
  ShoppingBag01Icon,
  UserIcon,
  ViewIcon,
  Copy01Icon,
  SquareLockCheckIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface OrderCardProps {
  order: Order;
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onReceivePayment?: (order: Order) => void;
}

export function OrderCard({
  order,
  onSelectOrder,
  onPrintOrder,
  onReceivePayment,
}: OrderCardProps) {
  const due = Number(order.due_amount || 0);
  const isPaid = order.payment_status === 'paid' || due === 0;
  const totalItemsCount =
    order.items?.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0) ||
    order.items?.length ||
    0;

  const handleCopyOrderNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.order_number);
    toast.add({
      title: 'Copied',
      description: `Order #${order.order_number} copied to clipboard.`,
      type: 'info',
    });
  };

  return (
    <div
      onClick={() => onSelectOrder(order)}
      className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs hover:border-cinnamon/40 transition-all flex flex-col justify-between space-y-3 cursor-pointer"
    >
      {/* Top Header Row: Order Number, Date, Status Badges */}
      <div className="flex justify-between items-start gap-2 border-b border-border/60 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs sm:text-sm text-primary truncate">
              {order.order_number}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="text-muted-foreground hover:text-cinnamon transition-colors p-0.5"
              aria-label="Copy order number"
            >
              <HugeiconsIcon icon={Copy01Icon} size={12} />
            </button>
          </div>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            {formatDate(order.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <PaymentStatusBadge status={order.payment_status} dueAmount={due} />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Details Row: Customer, Items, Method & Price */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <HugeiconsIcon icon={UserIcon} size={13} className="text-muted-foreground/80" />
            <span>Customer:</span>
          </span>
          <span className="font-semibold text-foreground truncate max-w-[150px]">
            {order.customer_name || 'Walk-in Customer'}
          </span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={13} className="text-muted-foreground/80" />
            <span>Items:</span>
          </span>
          <span className="font-semibold text-foreground">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
          <Badge
            variant="outline"
            className="uppercase font-bold text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2 py-0.5"
          >
            {order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method}
          </Badge>

          <div className="text-right">
            <span className="font-bold text-sm sm:text-base text-foreground font-mono block">
              {formatCurrency(order.total_amount)}
            </span>
            {!isPaid && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                Due: {formatCurrency(due)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div
        className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/60"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="xs"
          variant="outline"
          onClick={() => onSelectOrder(order)}
          className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80 hover:bg-secondary"
        >
          <HugeiconsIcon icon={ViewIcon} size={13} />
          <span>Details</span>
        </Button>

        {!isPaid && onReceivePayment ? (
          <Button
            size="xs"
            onClick={() => onReceivePayment(order)}
            className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg gap-1 shadow-2xs"
          >
            <HugeiconsIcon icon={SquareLockCheckIcon} size={13} />
            <span>Collect</span>
          </Button>
        ) : (
          <Button
            size="xs"
            onClick={() => onPrintOrder(order)}
            className="h-8 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg gap-1 shadow-2xs"
          >
            <HugeiconsIcon icon={PrinterIcon} size={13} />
            <span>Print</span>
          </Button>
        )}
      </div>
    </div>
  );
}

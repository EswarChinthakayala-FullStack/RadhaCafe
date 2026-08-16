import type { Order } from '../../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ViewIcon,
  PrinterIcon,
  MoreVerticalIcon,
  Copy01Icon,
  SquareLockCheckIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface OrderTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onReceivePayment?: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}

export function OrderTable({
  orders,
  onSelectOrder,
  onPrintOrder,
  onReceivePayment,
  onCancelOrder,
}: OrderTableProps) {
  const handleCopyOrderNumber = (orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    toast.add({
      title: 'Copied',
      description: `Order #${orderNumber} copied to clipboard.`,
      type: 'info',
    });
  };

  return (
    <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider border-b border-border/80 text-[10px] sm:text-[11px]">
            <tr>
              <th className="p-3 pl-4">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3 hidden lg:table-cell">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Payment Status</th>
              <th className="p-3">Order Status</th>
              <th className="p-3 hidden xl:table-cell">Date & Time</th>
              <th className="p-3 hidden md:table-cell">Print</th>
              <th className="p-3 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.map((order) => {
              const due = Number(order.due_amount || 0);
              const isPaid = order.payment_status === 'paid' || due === 0;
              const totalItemsCount =
                order.items?.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0) ||
                order.items?.length ||
                0;

              return (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  {/* Order Number & Time */}
                  <td className="p-3 pl-4 whitespace-nowrap">
                    <div className="font-bold font-mono text-primary text-xs flex items-center gap-1.5 flex-wrap">
                      <span>{order.order_number}</span>
                      {order.created_offline && !order.synced_at && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold px-1.5 py-0 h-4 border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded"
                        >
                          Pending Sync
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderNumber(order.order_number, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-cinnamon transition-opacity text-muted-foreground p-0.5"
                        title="Copy order number"
                        aria-label="Copy order number"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={13} />
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground xl:hidden">
                      {formatDate(order.created_at)}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="p-3 font-medium text-foreground max-w-[140px] truncate">
                    <span className="truncate block font-semibold">
                      {order.customer_name || 'Walk-in Customer'}
                    </span>
                  </td>

                  {/* Items Count Summary */}
                  <td className="p-3 text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                    <span className="font-medium text-foreground">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    </span>
                    {order.items?.[0] && (
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[120px]">
                        {order.items[0].item_name}
                        {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                      </span>
                    )}
                  </td>

                  {/* Total & Due */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold font-mono text-foreground text-xs sm:text-sm">
                      {formatCurrency(order.total_amount)}
                    </div>
                    {!isPaid && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                        Due: {formatCurrency(due)}
                      </div>
                    )}
                  </td>

                  {/* Payment Method */}
                  <td className="p-3 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="uppercase font-bold text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2 py-0.5"
                    >
                      {order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method}
                    </Badge>
                  </td>

                  {/* Payment Status */}
                  <td className="p-3 whitespace-nowrap">
                    <PaymentStatusBadge status={order.payment_status} dueAmount={due} />
                  </td>

                  {/* Order Status */}
                  <td className="p-3 whitespace-nowrap">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  {/* Date & Time */}
                  <td className="p-3 text-muted-foreground whitespace-nowrap hidden xl:table-cell text-[11px]">
                    {formatDate(order.created_at)}
                  </td>

                  {/* Print Status */}
                  <td className="p-3 whitespace-nowrap hidden md:table-cell">
                    {order.is_printed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                        <span>Printed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Not printed</span>
                    )}
                  </td>

                  {/* Actions Dropdown */}
                  <td
                    className="p-3 text-right pr-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onSelectOrder(order)}
                        className="h-8 px-2 text-xs font-semibold text-cinnamon hover:text-cinnamon hover:bg-cinnamon/10 rounded-lg gap-1 hidden sm:inline-flex"
                      >
                        <HugeiconsIcon icon={ViewIcon} size={14} />
                        <span>View</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                              aria-label="Order actions"
                            />
                          }
                        >
                          <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 bg-card border border-border shadow-lg">
                          <DropdownMenuItem
                            onClick={() => onSelectOrder(order)}
                            className="cursor-pointer gap-2 font-semibold text-xs py-1.5 rounded-lg"
                          >
                            <HugeiconsIcon icon={ViewIcon} size={14} className="text-cinnamon" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onPrintOrder(order)}
                            className="cursor-pointer gap-2 font-semibold text-xs py-1.5 rounded-lg"
                          >
                            <HugeiconsIcon icon={PrinterIcon} size={14} className="text-primary" />
                            <span>Reprint Receipt</span>
                          </DropdownMenuItem>

                          {!isPaid && onReceivePayment && (
                            <DropdownMenuItem
                              onClick={() => onReceivePayment(order)}
                              className="cursor-pointer gap-2 font-semibold text-xs py-1.5 rounded-lg text-amber-700 dark:text-amber-400"
                            >
                              <HugeiconsIcon icon={SquareLockCheckIcon} size={14} />
                              <span>Receive Payment</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={(e) => handleCopyOrderNumber(order.order_number, e as any)}
                            className="cursor-pointer gap-2 font-semibold text-xs py-1.5 rounded-lg"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={14} />
                            <span>Copy Order #</span>
                          </DropdownMenuItem>

                          {order.status !== 'cancelled' && onCancelOrder && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onCancelOrder(order)}
                                className="cursor-pointer gap-2 font-semibold text-xs py-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                              >
                                <HugeiconsIcon icon={CancelCircleIcon} size={14} />
                                <span>Cancel Order</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

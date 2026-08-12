import type { Order } from '../../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, PrinterIcon, MoreVerticalIcon } from '@hugeicons/core-free-icons';

interface OrderTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

export function OrderTable({ orders, onSelectOrder, onPrintOrder }: OrderTableProps) {
  return (
    <div className="border border-border/80 rounded-md overflow-hidden bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase tracking-wider border-b border-border/80 text-[11px]">
            <tr>
              <th className="p-3.5 pl-4">Order #</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Date & Time</th>
              <th className="p-3.5">Items</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-3.5 pl-4 font-bold font-mono text-primary text-xs whitespace-nowrap">
                  {order.order_number}
                </td>
                <td className="p-3.5 font-medium text-foreground truncate max-w-[160px]">
                  {order.customer_name || 'Walk-in Customer'}
                </td>
                <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                  {formatDate(order.created_at)}
                </td>
                <td className="p-3.5 font-semibold text-foreground whitespace-nowrap">
                  {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                </td>
                <td className="p-3.5 font-bold font-mono text-foreground whitespace-nowrap">
                  {formatCurrency(order.total_amount)}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <Badge variant="outline" className="uppercase font-bold text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2 py-0.5">
                    {order.payment_method}
                  </Badge>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg" />
                      }
                    >
                      <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 rounded-md p-1 bg-card">
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
                        <span>Print Receipt</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

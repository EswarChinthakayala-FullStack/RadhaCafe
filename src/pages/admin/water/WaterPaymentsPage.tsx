import { useState } from 'react';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import type { WaterOrder } from '../../../types';
import { ReceiveWaterPaymentDialog } from '../../../components/admin/water/customers/ReceiveWaterPaymentDialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Wallet01Icon,
  Search01Icon,
  SquareLockCheckIcon,
  AlertCircleIcon,
  DropletIcon,
} from '@hugeicons/core-free-icons';

export function WaterPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'due' | 'paid' | 'all'>('due');
  const [page, setPage] = useState(1);

  const [selectedPayOrder, setSelectedPayOrder] = useState<WaterOrder | null>(null);

  const { data, isLoading, isError, error } = useWaterOrders({
    page,
    limit: 50,
    search: searchQuery,
    paymentStatus: statusFilter === 'due' ? 'pending' : statusFilter === 'paid' ? 'paid' : 'all',
  });

  const orders = data?.orders || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Wallet01Icon} size={22} />
            </div>
            <span>Water Payment Collection & Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track outstanding water balances, record collections, and view completed payment transactions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-md shadow-2xs">
        <div className="relative w-full sm:w-80">
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by order #, customer or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 text-xs pl-9 bg-background rounded-md"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['due', 'paid', 'all'] as const).map((st) => {
            const isSelected = statusFilter === st;
            const label = st === 'due' ? 'Outstanding Due' : st === 'paid' ? 'Fully Paid' : 'All Water Orders';
            return (
              <Button
                key={st}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="xs"
                className={
                  isSelected
                    ? 'bg-cinnamon text-white font-bold text-xs h-8 rounded-lg shadow-2xs px-3'
                    : 'text-xs h-8 text-foreground/80 rounded-lg px-3'
                }
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Orders & Collection Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive text-xs">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-8 h-8 mb-2" />
          <p className="font-bold">Failed to load water payment orders</p>
          <p className="text-muted-foreground">{(error as any)?.message}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-2">
          <HugeiconsIcon icon={DropletIcon} className="mx-auto w-10 h-10 text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">No water orders in this filter category</p>
        </div>
      ) : (
        <div className="border border-border/80 rounded-md bg-card overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-right">Amount Paid</th>
                <th className="p-3.5 text-right">Amount Due</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              {orders.map((ord) => {
                const due = Number(ord.amount_due || 0);
                const isPaid = ord.payment_status === 'paid' || due === 0;

                return (
                  <tr key={ord.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-cinnamon">{ord.order_number}</td>
                    <td className="p-3.5 font-semibold">{ord.customer_name}</td>
                    <td className="p-3.5 text-muted-foreground text-[11px]">{formatDate(ord.created_at)}</td>
                    <td className="p-3.5 text-right font-bold font-mono">{formatCurrency(ord.total_amount)}</td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ord.amount_paid || 0)}
                    </td>
                    <td className="p-3.5 text-right font-bold font-mono text-amber-600 dark:text-amber-400">
                      {formatCurrency(due)}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]'
                        }
                      >
                        {isPaid ? 'PAID' : 'OUTSTANDING'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {!isPaid && (
                        <Button
                          size="xs"
                          onClick={() => setSelectedPayOrder(ord)}
                          className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 rounded-md shadow-xs"
                        >
                          <HugeiconsIcon icon={SquareLockCheckIcon} size={14} />
                          <span>Record Payment</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Dialog */}
      {selectedPayOrder && (
        <ReceiveWaterPaymentDialog
          open={Boolean(selectedPayOrder)}
          onOpenChange={(open) => {
            if (!open) setSelectedPayOrder(null);
          }}
          customer={{
            id: selectedPayOrder.customer_id || 'unregistered',
            name: selectedPayOrder.customer_name,
            phone: '',
            created_at: '',
            updated_at: '',
            total_due: Number(selectedPayOrder.amount_due || 0),
          }}
          order={selectedPayOrder}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import type { WaterOrder } from '../../../types';
import { WaterOrderDetailsModal } from '../../../components/admin/water/orders/WaterOrderDetailsModal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  PlusSignIcon,
  Search01Icon,
  EyeIcon,
  DropletIcon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

export function WaterOrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<WaterOrder | null>(null);

  const { data, isLoading, isError, error } = useWaterOrders({
    page,
    limit: 50,
    search: searchQuery,
    paymentStatus: paymentStatusFilter,
  });

  const orders = data?.orders || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4 sm:pb-5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 sm:p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs mt-0.5 sm:mt-0">
            <HugeiconsIcon icon={InvoiceIcon} size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              Water Order History
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight sm:leading-normal">
              Filter, inspect, and reprint receipts for completed & Pay-Later water orders.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/admin/water/orders/new')}
          className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 sm:h-10 text-xs px-4 rounded-md shadow-xs gap-2 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          <span>New Water Order</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-md shadow-2xs">
        <div className="relative w-full sm:w-80">
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by order # or customer name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 text-xs pl-9 bg-background rounded-md"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'paid', 'partial', 'pending'] as const).map((st) => {
            const isSelected = paymentStatusFilter === st;
            const label = st === 'all' ? 'All Payment Status' : st.toUpperCase();
            return (
              <Button
                key={st}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="xs"
                className={
                  isSelected
                    ? 'bg-cinnamon text-white font-bold text-xs h-8 rounded-lg shadow-2xs px-3 whitespace-nowrap'
                    : 'text-xs h-8 text-foreground/80 rounded-lg px-3 whitespace-nowrap'
                }
                onClick={() => {
                  setPaymentStatusFilter(st);
                  setPage(1);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Orders List View */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive space-y-2">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-8 h-8" />
          <p className="font-bold text-sm">Failed to load water orders</p>
          <p className="text-xs text-muted-foreground">{(error as any)?.message}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
            <HugeiconsIcon icon={DropletIcon} size={24} />
          </div>
          <p className="font-bold text-sm text-foreground">No water orders found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery ? `No order matches "${searchQuery}".` : 'Start placing water orders to build order history.'}
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/admin/water/orders/new')}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Create First Order</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-border/80 rounded-md bg-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                <tr>
                  <th className="p-3.5">Water Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Total Amount</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {orders.map((ord) => {
                  const due = Number(ord.amount_due || 0);
                  const isPaid = ord.payment_status === 'paid' || due === 0;
                  const isPartial = ord.payment_status === 'partial';

                  return (
                    <tr key={ord.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-cinnamon">
                        {ord.order_number}
                      </td>
                      <td className="p-3.5 font-semibold">{ord.customer_name}</td>
                      <td className="p-3.5 text-muted-foreground text-[11px]">{formatDate(ord.created_at)}</td>
                      <td className="p-3.5 font-medium">{ord.items?.length || 0} items</td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="uppercase font-bold text-[10px]">
                          {ord.payment_method === 'pay_later' ? 'PAY LATER' : ord.payment_method}
                        </Badge>
                      </td>
                      <td className="p-3.5">
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
                      </td>
                      <td className="p-3.5 text-right font-bold font-mono">
                        <div>{formatCurrency(ord.total_amount)}</div>
                        {!isPaid && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            Due: {formatCurrency(due)}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setSelectedOrder(ord)}
                          className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground rounded-md"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={13} />
                          <span>Details</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="md:hidden space-y-3">
            {orders.map((ord) => {
              const due = Number(ord.amount_due || 0);
              const isPaid = ord.payment_status === 'paid' || due === 0;

              return (
                <Card key={ord.id} className="border border-border/80 bg-card rounded-md shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-xs text-cinnamon block">
                          {ord.order_number}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">{ord.customer_name}</h4>
                        <p className="text-[11px] text-muted-foreground">{formatDate(ord.created_at)}</p>
                      </div>
                      <Badge
                        className={
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]'
                        }
                      >
                        {isPaid ? 'PAID' : 'DUE'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/50 text-xs">
                      <div>
                        <span className="font-bold text-sm font-mono text-foreground">{formatCurrency(ord.total_amount)}</span>
                        {!isPaid && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                            Due: {formatCurrency(due)}
                          </span>
                        )}
                      </div>

                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedOrder(ord)}
                        className="h-8 text-xs font-semibold gap-1 rounded-md"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={13} />
                        <span>Details</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Water Order Details Modal */}
      {selectedOrder && (
        <WaterOrderDetailsModal
          order={selectedOrder}
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

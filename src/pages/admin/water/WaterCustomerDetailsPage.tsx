import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWaterCustomer } from '../../../hooks/useWaterCustomers';
import { useWaterOrders } from '../../../hooks/useWaterOrders';
import { useWaterCustomerPayments } from '../../../hooks/useWaterPayments';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import type { WaterOrder } from '../../../types';
import { ReceiveWaterPaymentDialog } from '../../../components/admin/water/customers/ReceiveWaterPaymentDialog';
import { WaterOrderDetailsModal } from '../../../components/admin/water/orders/WaterOrderDetailsModal';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  SmartPhoneIcon,
  ArrowLeft01Icon,
  SquareLockCheckIcon,
  Wallet01Icon,
  Clock01Icon,
  AlertCircleIcon,
  EyeIcon,
  DropletIcon,
  Location01Icon,
} from '@hugeicons/core-free-icons';

export function WaterCustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<WaterOrder | null>(null);

  const { data: customer, isLoading: isCustLoading, isError: isCustError } = useWaterCustomer(id);
  const { data: ordersData, isLoading: isOrdersLoading } = useWaterOrders({
    customerId: id,
    limit: 100,
  });
  const { data: paymentsData, isLoading: isPaymentsLoading } = useWaterCustomerPayments(id);

  const orders = ordersData?.orders || [];
  const payments = paymentsData || [];

  if (isCustLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (isCustError || !customer) {
    return (
      <div className="p-12 text-center bg-card rounded-md border border-destructive/20 text-destructive space-y-3">
        <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-10 h-10" />
        <p className="font-bold text-lg">Water Customer Profile Not Found</p>
        <Button
          size="sm"
          onClick={() => navigate('/admin/water/customers')}
          className="bg-sky-600 text-white font-bold text-xs gap-2 rounded-md"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          <span>Back to Water Customers</span>
        </Button>
      </div>
    );
  }

  const due = Number(customer.total_due || 0);
  const hasDue = due > 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/water/customers')}
          className="h-8 text-xs font-semibold gap-1.5 rounded-md border-border/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to Water Customers</span>
        </Button>
      </div>

      {/* Customer Header */}
      <div className="p-5 rounded-md bg-card border border-border/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xl font-heading shadow-2xs shrink-0">
              <HugeiconsIcon icon={UserIcon} size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">{customer.name}</h2>
                {hasDue ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                    Outstanding: {formatCurrency(due)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-500 text-xs border-emerald-500/30 font-semibold">
                    Account Clean
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={SmartPhoneIcon} size={13} className="text-sky-500" />
                  <span>{customer.phone}</span>
                </span>
                {customer.address && (
                  <span className="flex items-center gap-1 font-sans">
                    <HugeiconsIcon icon={Location01Icon} size={13} className="text-sky-500" />
                    <span>{customer.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {hasDue && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 text-xs px-4 rounded-md shadow-xs gap-2 shrink-0 self-start sm:self-auto"
            >
              <HugeiconsIcon icon={SquareLockCheckIcon} size={16} />
              <span>Receive Water Payment</span>
            </Button>
          )}
        </div>

        {/* Financial Aggregations Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Water Orders</p>
            <p className="text-lg font-bold text-foreground font-heading mt-0.5">{customer.total_orders || 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Purchased</p>
            <p className="text-lg font-bold text-sky-600 dark:text-sky-400 font-heading mt-0.5">{formatCurrency(customer.total_spent || 0)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Collected</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">{formatCurrency(customer.total_paid || 0)}</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-semibold">Current Water Due</p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400 font-heading mt-0.5">{formatCurrency(due)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <Button
          type="button"
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('orders')}
          className={
            activeTab === 'orders'
              ? 'bg-sky-600 text-white font-bold text-xs h-9 rounded-md shadow-2xs gap-2'
              : 'text-xs h-9 text-muted-foreground hover:text-foreground font-medium gap-2'
          }
        >
          <HugeiconsIcon icon={DropletIcon} size={15} />
          <span>Water Orders ({orders.length})</span>
        </Button>

        <Button
          type="button"
          variant={activeTab === 'payments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('payments')}
          className={
            activeTab === 'payments'
              ? 'bg-sky-600 text-white font-bold text-xs h-9 rounded-md shadow-2xs gap-2'
              : 'text-xs h-9 text-muted-foreground hover:text-foreground font-medium gap-2'
          }
        >
          <HugeiconsIcon icon={Wallet01Icon} size={15} />
          <span>Payment Ledger ({payments.length})</span>
        </Button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <>
          {isOrdersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-md border border-dashed border-border/80 space-y-2">
              <HugeiconsIcon icon={DropletIcon} className="mx-auto w-8 h-8 text-muted-foreground/40" />
              <p className="font-bold text-xs text-foreground">No water orders linked to this customer yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => {
                const ordDue = Number(ord.amount_due || 0);
                const isPaid = ord.payment_status === 'paid' || ordDue === 0;

                return (
                  <Card key={ord.id} className="border border-border/80 bg-card rounded-md shadow-2xs hover:border-sky-500/40 transition-colors">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sky-600 dark:text-sky-400 text-sm">{ord.order_number}</span>
                          <Badge
                            className={
                              isPaid
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]'
                            }
                          >
                            {isPaid ? 'PAID' : 'OUTSTANDING'}
                          </Badge>
                          <Badge variant="outline" className="uppercase text-[10px] font-mono">
                            {ord.payment_method === 'pay_later' ? 'PAY LATER' : ord.payment_method}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                          <HugeiconsIcon icon={Clock01Icon} size={12} />
                          <span>{formatDate(ord.created_at)}</span>
                          <span>•</span>
                          <span>{ord.items?.length || 0} items</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm">{formatCurrency(ord.total_amount)}</p>
                          {!isPaid && (
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              Due: {formatCurrency(ordDue)}
                            </p>
                          )}
                        </div>

                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="h-8 text-xs font-semibold gap-1 rounded-md border-border/80"
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
          )}
        </>
      )}

      {/* Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <>
          {isPaymentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-md border border-dashed border-border/80 space-y-2">
              <HugeiconsIcon icon={Wallet01Icon} className="mx-auto w-8 h-8 text-muted-foreground/40" />
              <p className="font-bold text-xs text-foreground">No water payments recorded for this customer yet</p>
            </div>
          ) : (
            <div className="border border-border/80 rounded-md bg-card overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Order #</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right">Amount Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5 font-medium text-muted-foreground text-[11px]">
                        {formatDate(pmt.created_at)}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-sky-600 dark:text-sky-400">
                        {pmt.order_number || 'Direct Ledger'}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="uppercase text-[10px] font-bold">
                          {pmt.payment_method}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-muted-foreground italic text-[11px]">
                        {pmt.notes || '—'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        +{formatCurrency(pmt.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <ReceiveWaterPaymentDialog
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          customer={customer}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <WaterOrderDetailsModal
          order={selectedOrderDetails}
          open={Boolean(selectedOrderDetails)}
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}
    </div>
  );
}

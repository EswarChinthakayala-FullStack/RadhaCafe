import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCustomer,
  useCustomerLedger,
} from '../../../hooks/useCustomers';
import { useOrders } from '../../../hooks/useOrders';
import { useCustomerPayments } from '../../../hooks/usePayments';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { CustomerLedger } from '../../../components/admin/customers/CustomerLedger';
import { CustomerFormModal } from '../../../components/admin/customers/CustomerFormModal';
import { ReceivePaymentDialog } from '../../../components/admin/customers/ReceivePaymentDialog';
import { OrderDetailsModal } from '../../../components/admin/orders/OrderDetailsModal';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  SmartPhoneIcon,
  ArrowLeft01Icon,
  SquareLockCheckIcon,
  Wallet01Icon,
  AlertCircleIcon,
  EyeIcon,
  ShoppingBag01Icon,
  InvoiceIcon,
  Edit02Icon,
  Copy01Icon,
  CallIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../../components/ui/toast';
import type { Order } from '../../../types';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments' | 'ledger'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetPaymentOrder, setTargetPaymentOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const {
    data: customer,
    isLoading: isCustLoading,
    isError: isCustError,
  } = useCustomer(id);

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
  } = useOrders({
    customerId: id,
    limit: 100,
  });

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
  } = useCustomerPayments(id);

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
  } = useCustomerLedger(id);

  const orders = ordersData?.orders || [];
  const payments = paymentsData || [];
  const ledger = ledgerData || [];

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.add({
      title: 'Copied',
      description: `Phone ${phone} copied to clipboard.`,
      type: 'success',
    });
  };

  if (isCustLoading) {
    return (
      <div className="space-y-5 pb-12">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isCustError || !customer) {
    return (
      <div className="p-12 text-center bg-card rounded-xl border border-destructive/20 text-destructive space-y-3 shadow-2xs">
        <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-10 h-10" />
        <p className="font-bold text-lg">Customer Profile Not Found</p>
        <p className="text-xs text-muted-foreground">The requested customer record does not exist or was removed.</p>
        <Button
          size="sm"
          onClick={() => navigate('/admin/customers')}
          className="bg-cinnamon text-white font-bold text-xs gap-2 rounded-lg"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          <span>Back to Customers</span>
        </Button>
      </div>
    );
  }

  const due = Number(customer.total_due || 0);
  const hasDue = due > 0;
  const initials = getInitials(customer.name);
  const unpaidOrders = orders.filter((o) => Number(o.due_amount || 0) > 0 && o.status !== 'cancelled');

  return (
    <div className="space-y-5 pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/customers')}
          className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to Customers</span>
        </Button>
      </div>

      {/* Customer Header & Identity Card */}
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identity & Contact Details */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center font-bold text-lg font-heading shadow-2xs shrink-0">
              {initials}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground truncate">
                  {customer.name}
                </h1>
                {hasDue ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                    Outstanding: {formatCurrency(due)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 text-xs border-emerald-500/30 font-semibold bg-emerald-500/10">
                    No Dues / Clean Account
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap font-mono">
                <div className="flex items-center gap-1 text-foreground">
                  <HugeiconsIcon icon={SmartPhoneIcon} size={13} className="text-cinnamon" />
                  <a href={`tel:${customer.phone}`} className="hover:underline font-semibold">
                    {customer.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(customer.phone)}
                    className="p-0.5 hover:text-foreground text-muted-foreground transition-colors"
                    title="Copy phone"
                    aria-label="Copy phone number"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={12} />
                  </button>
                </div>

                <span className="text-border">|</span>

                <span className="font-sans text-[11px]">
                  Customer since {formatDate(customer.created_at, 'dd MMM yyyy')}
                </span>
              </div>

              {customer.notes && (
                <p className="text-xs text-muted-foreground italic pt-0.5">
                  Note: "{customer.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasDue && (
              <Button
                onClick={() => {
                  setTargetPaymentOrder(null);
                  setShowPaymentModal(true);
                }}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 text-xs px-3.5 rounded-lg shadow-xs gap-1.5"
              >
                <HugeiconsIcon icon={SquareLockCheckIcon} size={15} />
                <span>Receive Payment</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate(`/admin/orders/new?customer=${customer.id}`)}
              className="h-9 text-xs font-semibold rounded-lg gap-1.5 border-border/80"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={14} className="text-primary" />
              <span>New Cafe Order</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEditModal(true)}
              className="h-9 w-9 rounded-lg border-border/80 text-muted-foreground hover:text-foreground"
              title="Edit Customer Profile"
              aria-label="Edit Customer Profile"
            >
              <HugeiconsIcon icon={Edit02Icon} size={15} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.location.href = `tel:${customer.phone}`;
              }}
              className="h-9 w-9 rounded-lg border-border/80 text-muted-foreground hover:text-foreground"
              title="Call Customer"
              aria-label="Call Customer"
            >
              <HugeiconsIcon icon={CallIcon} size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Key Financial Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Outstanding Balance */}
        <Card
          className={`border rounded-xl shadow-2xs ${
            hasDue
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-border/80 bg-card'
          }`}
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Outstanding Due
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold font-mono font-heading ${
                    hasDue ? 'text-cinnamon' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(due)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  {hasDue ? `Across ${unpaidOrders.length} unpaid order(s)` : 'All orders settled'}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Wallet01Icon} size={18} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifetime Spend */}
        <Card className="border border-border/80 bg-card rounded-xl shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Lifetime Spend
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono font-heading text-foreground">
                  {formatCurrency(customer.total_spent || 0)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Completed sales value
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={18} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border border-border/80 bg-card rounded-xl shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono font-heading text-foreground">
                  {customer.total_orders || 0}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Cafe transactions
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary text-foreground border border-border/80 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={InvoiceIcon} size={18} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Collected */}
        <Card className="border border-border/80 bg-card rounded-xl shadow-2xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Paid
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono font-heading text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(customer.total_paid || 0)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Recorded payments
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={SquareLockCheckIcon} size={18} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-4">
        <div className="border-b border-border/80 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent h-10 p-0 gap-4 sm:gap-6">
            <TabsTrigger
              value="overview"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cinnamon data-[state=active]:text-foreground rounded-none px-1 pb-2.5 font-bold text-xs shadow-none gap-1.5"
            >
              <HugeiconsIcon icon={UserIcon} size={14} />
              <span>Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cinnamon data-[state=active]:text-foreground rounded-none px-1 pb-2.5 font-bold text-xs shadow-none gap-1.5"
            >
              <HugeiconsIcon icon={ShoppingBag01Icon} size={14} />
              <span>Orders ({orders.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="payments"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cinnamon data-[state=active]:text-foreground rounded-none px-1 pb-2.5 font-bold text-xs shadow-none gap-1.5"
            >
              <HugeiconsIcon icon={InvoiceIcon} size={14} />
              <span>Payments ({payments.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="ledger"
              className="bg-transparent border-b-2 border-transparent data-[state=active]:border-cinnamon data-[state=active]:text-foreground rounded-none px-1 pb-2.5 font-bold text-xs shadow-none gap-1.5"
            >
              <HugeiconsIcon icon={Wallet01Icon} size={14} />
              <span>Credit Ledger</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-5 outline-none">
          {/* Unpaid Orders Section */}
          {hasDue && unpaidOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600 dark:text-amber-400" />
                  <span>Unpaid Cafe Orders ({unpaidOrders.length})</span>
                </h3>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-card overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-amber-500/10">
                    <TableRow className="border-border/80 hover:bg-transparent">
                      <TableHead className="font-bold text-xs text-foreground min-w-[120px]">Order #</TableHead>
                      <TableHead className="font-bold text-xs text-foreground min-w-[120px]">Date</TableHead>
                      <TableHead className="font-bold text-xs text-foreground text-right min-w-[90px]">Total</TableHead>
                      <TableHead className="font-bold text-xs text-foreground text-right min-w-[90px]">Paid</TableHead>
                      <TableHead className="font-bold text-xs text-foreground text-right min-w-[100px]">Due</TableHead>
                      <TableHead className="font-bold text-xs text-foreground text-right min-w-[120px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidOrders.map((ord) => (
                      <TableRow key={ord.id} className="border-border/60 hover:bg-secondary/30">
                        <TableCell className="py-2.5 font-mono text-xs font-bold text-cinnamon">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="hover:underline"
                          >
                            {ord.order_number}
                          </button>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground font-mono">
                          {formatDate(ord.created_at, 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-xs font-semibold">
                          {formatCurrency(ord.total_amount)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(ord.paid_amount || 0)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                          {formatCurrency(ord.due_amount || 0)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <Button
                            size="xs"
                            onClick={() => {
                              setTargetPaymentOrder(ord);
                              setShowPaymentModal(true);
                            }}
                            className="h-7 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs gap-1"
                          >
                            <HugeiconsIcon icon={SquareLockCheckIcon} size={12} />
                            <span>Collect</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Quick Dual History Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Orders Preview */}
            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={14} className="text-cinnamon" />
                  <span>Recent Orders</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-cinnamon hover:underline"
                >
                  View All ({orders.length})
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No orders recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 4).map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrderDetails(ord)}
                      className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between text-xs hover:border-cinnamon/60 cursor-pointer transition-all"
                    >
                      <div>
                        <span className="font-mono font-bold text-cinnamon">{ord.order_number}</span>
                        <span className="text-muted-foreground ml-2 text-[11px]">
                          {formatDate(ord.created_at, 'dd MMM')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(ord.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments Preview */}
            <div className="p-4 rounded-xl bg-card border border-border/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={SquareLockCheckIcon} size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Recent Payments</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="text-xs font-bold text-cinnamon hover:underline"
                >
                  View All ({payments.length})
                </button>
              </div>

              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No payments received yet.</p>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 4).map((pay) => (
                    <div
                      key={pay.id}
                      className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold uppercase text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 mr-2">
                          {pay.payment_method}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {formatDate(pay.created_at, 'dd MMM, hh:mm a')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(pay.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Orders History */}
        <TabsContent value="orders" className="space-y-4 outline-none">
          {isOrdersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-xl border border-border/80 text-muted-foreground space-y-2">
              <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto w-8 h-8 text-muted-foreground/60" />
              <p className="font-bold text-sm text-foreground">No Cafe Orders Found</p>
              <p className="text-xs">This customer hasn't placed any orders yet.</p>
              <Button
                size="sm"
                onClick={() => navigate(`/admin/orders/new?customer=${customer.id}`)}
                className="bg-cinnamon text-white font-bold text-xs rounded-lg mt-2 gap-1.5"
              >
                <HugeiconsIcon icon={ShoppingBag01Icon} size={14} />
                <span>Create Order</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="font-bold text-xs text-foreground min-w-[120px]">Order #</TableHead>
                    <TableHead className="font-bold text-xs text-foreground min-w-[130px]">Date</TableHead>
                    <TableHead className="font-bold text-xs text-foreground text-right min-w-[90px]">Total</TableHead>
                    <TableHead className="font-bold text-xs text-foreground text-right min-w-[90px]">Paid</TableHead>
                    <TableHead className="font-bold text-xs text-foreground text-right min-w-[100px]">Due</TableHead>
                    <TableHead className="font-bold text-xs text-foreground min-w-[110px]">Payment</TableHead>
                    <TableHead className="font-bold text-xs text-foreground min-w-[100px]">Status</TableHead>
                    <TableHead className="font-bold text-xs text-foreground text-right min-w-[90px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((ord) => {
                    const ordDue = Number(ord.due_amount || 0);
                    return (
                      <TableRow key={ord.id} className="border-border/60 hover:bg-secondary/30">
                        <TableCell className="py-3 font-mono text-xs font-bold text-cinnamon">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="hover:underline"
                          >
                            {ord.order_number}
                          </button>
                        </TableCell>
                        <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                          {formatDate(ord.created_at, 'dd MMM yyyy, hh:mm a')}
                        </TableCell>
                        <TableCell className="py-3 text-right font-mono text-xs font-bold text-foreground">
                          {formatCurrency(ord.total_amount)}
                        </TableCell>
                        <TableCell className="py-3 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(ord.paid_amount || 0)}
                        </TableCell>
                        <TableCell className="py-3 text-right font-mono text-xs font-bold">
                          {ordDue > 0 ? (
                            <span className="text-amber-700 dark:text-amber-300">
                              {formatCurrency(ordDue)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-normal">₹0</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={
                              ord.payment_status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold'
                                : ord.payment_status === 'partial'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] uppercase font-bold'
                            }
                          >
                            {ord.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold bg-secondary/50">
                            {ord.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="h-7 text-xs font-semibold rounded-lg gap-1 border-border/80"
                          >
                            <HugeiconsIcon icon={EyeIcon} size={12} />
                            <span>View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Payments History */}
        <TabsContent value="payments" className="space-y-4 outline-none">
          {isPaymentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-xl border border-border/80 text-muted-foreground space-y-2">
              <HugeiconsIcon icon={InvoiceIcon} className="mx-auto w-8 h-8 text-muted-foreground/60" />
              <p className="font-bold text-sm text-foreground">No Payments Recorded Yet</p>
              <p className="text-xs">Payment collections against customer dues will appear here.</p>
              {hasDue && (
                <Button
                  size="sm"
                  onClick={() => {
                    setTargetPaymentOrder(null);
                    setShowPaymentModal(true);
                  }}
                  className="bg-cinnamon text-white font-bold text-xs rounded-lg mt-2 gap-1.5"
                >
                  <HugeiconsIcon icon={SquareLockCheckIcon} size={14} />
                  <span>Receive Payment</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="font-bold text-xs text-foreground min-w-[140px]">Date & Time</TableHead>
                    <TableHead className="font-bold text-xs text-foreground min-w-[100px]">Method</TableHead>
                    <TableHead className="font-bold text-xs text-foreground min-w-[130px]">Linked Order</TableHead>
                    <TableHead className="font-bold text-xs text-foreground">Notes</TableHead>
                    <TableHead className="font-bold text-xs text-foreground text-right min-w-[120px]">
                      Amount Collected
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((pay) => (
                    <TableRow key={pay.id} className="border-border/60 hover:bg-secondary/30">
                      <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                        {formatDate(pay.created_at, 'dd MMM yyyy, hh:mm a')}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="bg-secondary text-foreground text-[10px] font-bold uppercase"
                        >
                          {pay.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 font-mono text-xs">
                        {pay.order_number ? (
                          <span className="font-bold text-cinnamon">{pay.order_number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {pay.notes || '—'}
                      </TableCell>
                      <TableCell className="py-3 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(pay.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Chronological Credit Ledger */}
        <TabsContent value="ledger" className="space-y-4 outline-none">
          <CustomerLedger
            ledger={ledger}
            isLoading={isLedgerLoading}
            onSelectOrder={(orderId) => {
              const ord = orders.find((o) => o.id === orderId);
              if (ord) setSelectedOrderDetails(ord);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Receive Payment Dialog */}
      <ReceivePaymentDialog
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        customer={customer}
        order={targetPaymentOrder}
        onSuccess={() => {
          setTargetPaymentOrder(null);
          setShowPaymentModal(false);
        }}
      />

      {/* Customer Form Modal for Edit */}
      <CustomerFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        customer={customer}
      />

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          open={Boolean(selectedOrderDetails)}
          onOpenChange={(open) => {
            if (!open) setSelectedOrderDetails(null);
          }}
          order={selectedOrderDetails}
        />
      )}
    </div>
  );
}

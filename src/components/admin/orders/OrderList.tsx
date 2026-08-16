import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders, useCancelOrder } from '../../../hooks/useOrders';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useCustomer } from '../../../hooks/useCustomers';
import { OrderSummaryCards } from './OrderSummaryCards';
import { OrderFilters, type OrderFiltersState } from './OrderFilters';
import { OrderTable } from './OrderTable';
import { OrderCard } from './OrderCard';
import { OrderSkeleton } from './OrderSkeleton';
import { OrderEmptyState } from './OrderEmptyState';
import { OrderErrorState } from './OrderErrorState';
import { OrderPagination } from './OrderPagination';
import { OrderDetailsModal } from './OrderDetailsModal';
import { ReceivePaymentDialog } from '../customers/ReceivePaymentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon } from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import { idbGetPendingOfflineOrders } from '../../../lib/offline/db';
import { cancelLocalOfflineOrder } from '../../../lib/offline/offlineOrderService';
import type { Order, OrderSort } from '../../../types';

function getDateRangeForPreset(preset: OrderFiltersState['datePreset'], customDate: string) {
  const now = new Date();
  if (preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'yesterday') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'custom' && customDate) {
    const start = `${customDate}T00:00:00.000Z`;
    const end = `${customDate}T23:59:59.999Z`;
    return { startDate: start, endDate: end };
  }
  return { startDate: undefined, endDate: undefined };
}

export function OrderList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState<Order | null>(null);

  const [filters, setFilters] = useState<OrderFiltersState>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    paymentStatus: searchParams.get('payment_status') || 'all',
    paymentMethod: searchParams.get('method') || 'all',
    datePreset: (searchParams.get('preset') as any) || 'all',
    customDate: searchParams.get('date') || '',
    sort: (searchParams.get('sort') as OrderSort) || 'newest',
  });

  const { printOrder } = useBluetoothPrinter();
  const cancelOrderMutation = useCancelOrder();
  const { data: customerForPayment } = useCustomer(paymentOrder?.customer_id || undefined);

  // Compute date bounds for current preset
  const { startDate, endDate } = getDateRangeForPreset(filters.datePreset, filters.customDate);

  // Sync state to URL search parameters
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (page > 1) newParams.page = String(page);
    if (filters.search) newParams.search = filters.search;
    if (filters.status !== 'all') newParams.status = filters.status;
    if (filters.paymentStatus !== 'all') newParams.payment_status = filters.paymentStatus;
    if (filters.paymentMethod !== 'all') newParams.method = filters.paymentMethod;
    if (filters.datePreset !== 'all') newParams.preset = filters.datePreset;
    if (filters.customDate) newParams.date = filters.customDate;
    if (filters.sort !== 'newest') newParams.sort = filters.sort;
    setSearchParams(newParams, { replace: true });
  }, [page, filters, setSearchParams]);

  // Query database orders via TanStack Query
  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit: 20,
    status: filters.status,
    paymentStatus: filters.paymentStatus,
    paymentMethod: filters.paymentMethod,
    startDate,
    endDate,
    date: filters.datePreset === 'custom' ? filters.customDate : undefined,
    search: filters.search,
    sort: filters.sort,
  });

  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);

  // Load pending offline orders from IndexedDB
  useEffect(() => {
    let isMounted = true;
    idbGetPendingOfflineOrders()
      .then((pending) => {
        if (!isMounted) return;
        const mapped: Order[] = pending.map((po) => ({
          id: po.client_order_id,
          order_number: po.offline_reference,
          client_order_id: po.client_order_id,
          customer_name: po.customer_name,
          customer_id: po.customer_id,
          status: po.status as any,
          subtotal: po.subtotal,
          tax_amount: po.tax_amount,
          discount_amount: po.discount_amount,
          total_amount: po.total_amount,
          payment_method: po.payment_method,
          payment_status: po.payment_status,
          paid_amount: po.payment_status === 'paid' ? po.total_amount : 0,
          due_amount: po.payment_status === 'unpaid' ? po.total_amount : 0,
          is_printed: po.is_printed,
          created_at: po.offline_created_at,
          created_offline: true,
          offline_reference: po.offline_reference,
          items: po.items.map((it) => ({
            item_name: it.item_name,
            unit_price: it.unit_price,
            quantity: it.quantity,
            total_price: it.total_price,
          })),
        }));
        setOfflineOrders(mapped);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [data]);

  // Combine offline pending orders with server orders (offline orders shown at top)
  const combinedOrders = [
    ...offlineOrders.filter(
      (off) => !data?.orders?.some((o) => o.client_order_id === off.id || o.id === off.id)
    ),
    ...(data?.orders || []),
  ];

  const totalPages = Math.ceil(((data?.count || 0) + offlineOrders.length) / 20) || 1;

  const handleFilterChange = (newFilters: OrderFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      paymentMethod: 'all',
      datePreset: 'all',
      customDate: '',
      sort: 'newest',
    });
    setPage(1);
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderTarget) return;
    try {
      if (cancelOrderTarget.created_offline) {
        await cancelLocalOfflineOrder(cancelOrderTarget.id);
        setOfflineOrders((prev) =>
          prev.map((o) => (o.id === cancelOrderTarget.id ? { ...o, status: 'cancelled' } : o))
        );
        toast.add({
          title: 'Offline Order Cancelled',
          description: `Order #${cancelOrderTarget.order_number} marked as cancelled locally.`,
          type: 'info',
        });
      } else {
        await cancelOrderMutation.mutateAsync(cancelOrderTarget.id);
        toast.add({
          title: 'Order Cancelled',
          description: `Order #${cancelOrderTarget.order_number} marked as cancelled.`,
          type: 'info',
        });
      }
      setCancelOrderTarget(null);
    } catch (err: any) {
      toast.add({
        title: 'Failed',
        description: err.message || 'Unable to cancel order.',
        type: 'error',
      });
    }
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.datePreset !== 'all' ||
    Boolean(filters.customDate) ||
    filters.sort !== 'newest';

  return (
    <div className="space-y-5">
      {/* Top Quick Summary Statistics */}
      <OrderSummaryCards startDate={startDate} endDate={endDate} />

      {/* Filter Toolbar */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Order List View State */}
      {isLoading && offlineOrders.length === 0 ? (
        <OrderSkeleton />
      ) : isError && offlineOrders.length === 0 ? (
        <OrderErrorState errorMsg={(error as any)?.message} onRetry={() => refetch()} />
      ) : combinedOrders.length === 0 ? (
        <OrderEmptyState isFiltered={isFiltered} onResetFilters={handleResetFilters} />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block">
            <OrderTable
              orders={combinedOrders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onPrintOrder={(ord) => printOrder(ord)}
              onReceivePayment={(ord) => setPaymentOrder(ord)}
              onCancelOrder={(ord) => setCancelOrderTarget(ord)}
            />
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
            {combinedOrders.map((ord) => (
              <OrderCard
                key={ord.id}
                order={ord}
                onSelectOrder={(o) => setSelectedOrder(o)}
                onPrintOrder={(o) => printOrder(o)}
                onReceivePayment={(o) => setPaymentOrder(o)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <OrderPagination
            page={page}
            totalPages={totalPages}
            totalCount={(data?.count || 0) + offlineOrders.length}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Quick Collect Payment Modal */}
      {paymentOrder && (
        <ReceivePaymentDialog
          open={Boolean(paymentOrder)}
          onOpenChange={(open) => !open && setPaymentOrder(null)}
          customer={
            customerForPayment || {
              id: paymentOrder.customer_id || 'walk-in',
              name: paymentOrder.customer_name || 'Walk-in Customer',
              phone: '',
              is_active: true,
              created_at: '',
              updated_at: '',
              total_due: Number(paymentOrder.due_amount || 0),
            }
          }
          order={paymentOrder}
          onSuccess={() => setPaymentOrder(null)}
        />
      )}

      {/* Row Cancel Order Confirmation Dialog */}
      <AlertDialog
        open={Boolean(cancelOrderTarget)}
        onOpenChange={(open) => !open && setCancelOrderTarget(null)}
      >
        <AlertDialogContent className="max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-1">
              <HugeiconsIcon icon={CancelCircleIcon} size={20} />
            </div>
            <AlertDialogTitle className="font-heading text-lg font-bold text-foreground">
              Cancel Order #{cancelOrderTarget?.order_number}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will mark the order as cancelled in reports and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelOrderMutation.isPending}
              className="h-9 text-xs bg-destructive text-white hover:bg-destructive/90 font-bold rounded-lg"
            >
              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

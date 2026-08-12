import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { OrderSummaryCards } from './OrderSummaryCards';
import { OrderFilters, type OrderFiltersState } from './OrderFilters';
import { OrderTable } from './OrderTable';
import { OrderCard } from './OrderCard';
import { OrderSkeleton } from './OrderSkeleton';
import { OrderEmptyState } from './OrderEmptyState';
import { OrderErrorState } from './OrderErrorState';
import { OrderPagination } from './OrderPagination';
import { OrderDetailsModal } from './OrderDetailsModal';
import type { Order } from '../../../types';

function getDateRangeForPreset(preset: OrderFiltersState['datePreset'], customDate: string) {
  const now = new Date();
  if (preset === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'yesterday') {
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(now.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
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

  const [filters, setFilters] = useState<OrderFiltersState>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    paymentMethod: searchParams.get('payment') || 'all',
    datePreset: (searchParams.get('preset') as any) || 'all',
    customDate: searchParams.get('date') || '',
  });

  const { printOrder } = useBluetoothPrinter();

  // Compute date bounds for current preset
  const { startDate, endDate } = getDateRangeForPreset(filters.datePreset, filters.customDate);

  // Sync state to URL search parameters
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (page > 1) newParams.page = String(page);
    if (filters.search) newParams.search = filters.search;
    if (filters.status !== 'all') newParams.status = filters.status;
    if (filters.paymentMethod !== 'all') newParams.payment = filters.paymentMethod;
    if (filters.datePreset !== 'all') newParams.preset = filters.datePreset;
    if (filters.customDate) newParams.date = filters.customDate;
    setSearchParams(newParams, { replace: true });
  }, [page, filters, setSearchParams]);

  // Query database orders via TanStack Query
  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit: 20,
    status: filters.status,
    paymentMethod: filters.paymentMethod,
    startDate,
    endDate,
    date: filters.datePreset === 'custom' ? filters.customDate : undefined,
    search: filters.search,
  });

  const totalPages = Math.ceil((data?.count || 0) / 20) || 1;

  const handleFilterChange = (newFilters: OrderFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentMethod: 'all',
      datePreset: 'all',
      customDate: '',
    });
    setPage(1);
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.datePreset !== 'all' ||
    Boolean(filters.customDate);

  return (
    <div className="space-y-6">
      {/* Top Quick Summary Statistics */}
      <OrderSummaryCards />

      {/* Filter Toolbar */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Order List View State */}
      {isLoading ? (
        <OrderSkeleton />
      ) : isError ? (
        <OrderErrorState errorMsg={(error as any)?.message} onRetry={() => refetch()} />
      ) : !data?.orders || data.orders.length === 0 ? (
        <OrderEmptyState isFiltered={isFiltered} onResetFilters={handleResetFilters} />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block">
            <OrderTable
              orders={data.orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onPrintOrder={(ord) => printOrder(ord)}
            />
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3.5">
            {data.orders.map((ord) => (
              <OrderCard
                key={ord.id}
                order={ord}
                onSelectOrder={(o) => setSelectedOrder(o)}
                onPrintOrder={(o) => printOrder(o)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <OrderPagination
            page={page}
            totalPages={totalPages}
            totalCount={data.count || 0}
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
    </div>
  );
}

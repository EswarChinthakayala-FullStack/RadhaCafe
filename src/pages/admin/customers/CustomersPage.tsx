import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useCustomers,
  useCustomerOperationalSummary,
} from '../../../hooks/useCustomers';
import { CustomerSummaryCards } from '../../../components/admin/customers/CustomerSummaryCards';
import {
  CustomerToolbar,
  type CustomerToolbarFilters,
} from '../../../components/admin/customers/CustomerToolbar';
import { CustomerTable } from '../../../components/admin/customers/CustomerTable';
import { CustomerMobileCard } from '../../../components/admin/customers/CustomerMobileCard';
import { CustomerFormModal } from '../../../components/admin/customers/CustomerFormModal';
import { ReceivePaymentDialog } from '../../../components/admin/customers/ReceivePaymentDialog';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  UserAdd01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { Customer, CustomerSort } from '../../../types';

const PAGE_SIZE = 20;

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomerTarget, setEditCustomerTarget] = useState<Customer | null>(null);
  const [paymentCustomerTarget, setPaymentCustomerTarget] = useState<Customer | null>(null);

  const [filters, setFilters] = useState<CustomerToolbarFilters>({
    search: searchParams.get('search') || '',
    statusFilter: (searchParams.get('status') as any) || 'all',
    sortBy: (searchParams.get('sort') as CustomerSort) || 'highest_due',
  });

  // Sync filters to URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
    if (filters.sortBy !== 'highest_due') params.set('sort', filters.sortBy);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  const { data: summaryData, isLoading: isSummaryLoading } = useCustomerOperationalSummary();

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isError,
    error,
    refetch,
  } = useCustomers({
    page,
    limit: PAGE_SIZE,
    search: filters.search,
    statusFilter: filters.statusFilter,
    sortBy: filters.sortBy,
  });

  const customers = customersData?.customers || [];
  const totalCount = customersData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const handleFilterChange = (newFilters: CustomerToolbarFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      statusFilter: 'all',
      sortBy: 'highest_due',
    });
    setPage(1);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={UserGroupIcon} size={20} />
            </div>
            <span>Cafe Customers & Credit Ledger</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer profiles, order history, and Pay-Later outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditCustomerTarget(null);
              setShowAddModal(true);
            }}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs px-4 rounded-lg shadow-xs gap-2 shrink-0"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={16} />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Operational KPI Summary Cards */}
      <CustomerSummaryCards
        summary={summaryData}
        isLoading={isSummaryLoading}
        activeStatusFilter={filters.statusFilter}
        onSelectStatusFilter={(status) => handleFilterChange({ ...filters, statusFilter: status })}
      />

      {/* Search, Filter & Sort Toolbar */}
      <CustomerToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Customers Content Area */}
      {isCustomersLoading ? (
        <div className="space-y-3">
          <div className="hidden md:block rounded-xl border border-border/80 bg-card p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-10 text-center bg-card rounded-xl border border-destructive/20 text-destructive space-y-3 shadow-2xs">
          <p className="font-bold text-sm">Unable to Load Cafe Customers</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {error?.message || 'A network error occurred while retrieving customer records.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg text-foreground"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
            <span>Retry</span>
          </Button>
        </div>
      ) : customers.length === 0 ? (
        <Card className="border border-border/80 bg-card rounded-xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground font-heading">
              {filters.search || filters.statusFilter !== 'all'
                ? 'No matching customers found'
                : 'No Cafe Customers Yet'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {filters.search || filters.statusFilter !== 'all'
                ? 'Try adjusting your search query or removing active status filters.'
                : 'Create customer profiles to track Pay-Later credit, order history, and payments.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            {filters.search || filters.statusFilter !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditCustomerTarget(null);
                  setShowAddModal(true);
                }}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 text-xs px-4 rounded-lg shadow-xs gap-1.5"
              >
                <HugeiconsIcon icon={UserAdd01Icon} size={15} />
                <span>Add Customer</span>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block">
            <CustomerTable
              customers={customers}
              onReceivePayment={(c) => setPaymentCustomerTarget(c)}
              onEditCustomer={(c) => {
                setEditCustomerTarget(c);
                setShowAddModal(true);
              }}
            />
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customers.map((customer) => (
              <CustomerMobileCard
                key={customer.id}
                customer={customer}
                onReceivePayment={(c) => setPaymentCustomerTarget(c)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <span className="text-muted-foreground">
                Showing{' '}
                <strong className="font-mono font-bold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}
                </strong>{' '}
                to{' '}
                <strong className="font-mono font-bold text-foreground">
                  {Math.min(page * PAGE_SIZE, totalCount)}
                </strong>{' '}
                of{' '}
                <strong className="font-mono font-bold text-foreground">{totalCount}</strong>{' '}
                customers
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs font-semibold rounded-lg gap-1"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                  <span>Previous</span>
                </Button>

                <span className="font-mono font-bold text-foreground px-2 text-xs">
                  Page {page} of {totalPages}
                </span>

                <Button
                  size="xs"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 text-xs font-semibold rounded-lg gap-1"
                >
                  <span>Next</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Form Modal (Create or Edit) */}
      <CustomerFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        customer={editCustomerTarget}
      />

      {/* Receive Payment Dialog */}
      {paymentCustomerTarget && (
        <ReceivePaymentDialog
          open={Boolean(paymentCustomerTarget)}
          onOpenChange={(open) => {
            if (!open) setPaymentCustomerTarget(null);
          }}
          customer={paymentCustomerTarget}
          onSuccess={() => setPaymentCustomerTarget(null)}
        />
      )}
    </div>
  );
}

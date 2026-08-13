import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../../../hooks/useCustomers';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import type { Customer } from '../../../types';
import { CustomerFormModal } from '../../../components/admin/customers/CustomerFormModal';
import { ReceivePaymentDialog } from '../../../components/admin/customers/ReceivePaymentDialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  UserAdd01Icon,
  Search01Icon,
  AlertCircleIcon,
  EyeIcon,
  SquareLockCheckIcon,
  SmartPhoneIcon,
  Clock01Icon,
  InvoiceIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'clear'>('all');
  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayCustomer, setSelectedPayCustomer] = useState<Customer | null>(null);

  const { data, isLoading, isError, error } = useCustomers({
    page,
    limit: 50,
    search: searchQuery,
    hasDue: filterType === 'due',
  });

  const rawCustomers = data?.customers || [];
  const totalCount = data?.count || 0;

  // Filter local array if filterType is clear
  const displayedCustomers = rawCustomers.filter((c) => {
    if (filterType === 'clear') return (c.total_due || 0) === 0;
    return true;
  });

  // Calculate summary metrics
  const totalCustomers = totalCount;
  const customersWithDue = rawCustomers.filter((c) => (c.total_due || 0) > 0).length;
  const totalOutstandingAmount = rawCustomers.reduce((sum, c) => sum + (c.total_due || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={UserGroupIcon} size={22} />
            </div>
            <span>Customers & Credit Ledger</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage customer profiles, order transaction history, and Pay-Later credit balances.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs px-4 rounded-md shadow-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={UserAdd01Icon} size={16} />
          <span>Add Customer</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/80 bg-card rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</p>
              <p className="text-2xl font-bold text-foreground font-heading">{totalCustomers}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-secondary/80 text-foreground flex items-center justify-center">
              <HugeiconsIcon icon={UserGroupIcon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">With Outstanding</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-heading">{customersWithDue}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <HugeiconsIcon icon={InvoiceIcon} size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-cinnamon/30 bg-cinnamon/5 rounded-md shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-cinnamon uppercase tracking-wider">Total Credit Due</p>
              <p className="text-2xl font-bold text-cinnamon font-heading">{formatCurrency(totalOutstandingAmount)}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-cinnamon/15 text-cinnamon flex items-center justify-center border border-cinnamon/20">
              <HugeiconsIcon icon={Wallet01Icon} size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-md shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 text-xs pl-9 bg-background rounded-md"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'due', 'clear'] as const).map((type) => {
            const isSelected = filterType === type;
            const label = type === 'all' ? 'All Customers' : type === 'due' ? 'With Outstanding' : 'Paid Clean';
            return (
              <Button
                key={type}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="xs"
                className={
                  isSelected
                    ? 'bg-cinnamon text-white font-bold text-xs h-8 rounded-lg shadow-2xs px-3 whitespace-nowrap'
                    : 'text-xs h-8 text-foreground/80 rounded-lg px-3 whitespace-nowrap'
                }
                onClick={() => {
                  setFilterType(type);
                  setPage(1);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Customers List View */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive space-y-2">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-8 h-8" />
          <p className="font-bold text-sm">Failed to load customer profiles</p>
          <p className="text-xs text-muted-foreground">{(error as any)?.message || 'Check database connection'}</p>
        </div>
      ) : displayedCustomers.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/50">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <p className="font-bold text-sm text-foreground">No customer profiles found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery ? `No customer matches "${searchQuery}".` : 'Add customer profiles to start recording Pay-Later credit orders.'}
          </p>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs"
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={15} />
            <span>Create First Customer</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-border/80 rounded-md bg-card shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/80">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5 text-center">Orders</th>
                  <th className="p-3.5 text-right">Total Purchased</th>
                  <th className="p-3.5 text-right">Outstanding Credit</th>
                  <th className="p-3.5">Last Order</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {displayedCustomers.map((cust) => {
                  const due = Number(cust.total_due || 0);
                  const hasDue = due > 0;
                  return (
                    <tr key={cust.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5 font-bold">
                        <button
                          onClick={() => navigate(`/admin/customers/${cust.id}`)}
                          className="hover:text-cinnamon transition-colors text-left"
                        >
                          {cust.name}
                        </button>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">{cust.phone}</td>
                      <td className="p-3.5 text-center font-bold">{cust.total_orders || 0}</td>
                      <td className="p-3.5 text-right font-semibold">{formatCurrency(cust.total_spent || 0)}</td>
                      <td className="p-3.5 text-right font-bold">
                        {hasDue ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 font-mono font-bold">
                            {formatCurrency(due)}
                          </Badge>
                        ) : (
                          <span className="text-emerald-500 font-semibold">{formatCurrency(0)}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-muted-foreground text-[11px]">
                        {cust.last_order_at ? formatDate(cust.last_order_at) : 'No orders'}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {hasDue && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setSelectedPayCustomer(cust)}
                            className="h-7 text-[11px] gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-bold rounded-md"
                          >
                            <HugeiconsIcon icon={SquareLockCheckIcon} size={13} />
                            <span>Collect</span>
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => navigate(`/admin/customers/${cust.id}`)}
                          className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground rounded-md"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={13} />
                          <span>View</span>
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
            {displayedCustomers.map((cust) => {
              const due = Number(cust.total_due || 0);
              const hasDue = due > 0;
              return (
                <Card key={cust.id} className="border border-border/80 bg-card rounded-md shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{cust.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <HugeiconsIcon icon={SmartPhoneIcon} size={12} />
                          <span>{cust.phone}</span>
                        </p>
                      </div>
                      {hasDue ? (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 font-mono font-bold">
                          Due: {formatCurrency(due)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-500 text-xs border-emerald-500/30 font-semibold">
                          Clean
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Orders</p>
                        <p className="font-bold text-foreground">{cust.total_orders || 0} orders</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Purchased</p>
                        <p className="font-bold text-cinnamon">{formatCurrency(cust.total_spent || 0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <HugeiconsIcon icon={Clock01Icon} size={12} />
                        <span>{cust.last_order_at ? formatDate(cust.last_order_at) : 'No orders'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {hasDue && (
                          <Button
                            size="xs"
                            onClick={() => setSelectedPayCustomer(cust)}
                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 rounded-md shadow-xs"
                          >
                            <HugeiconsIcon icon={SquareLockCheckIcon} size={14} />
                            <span>Collect Payment</span>
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => navigate(`/admin/customers/${cust.id}`)}
                          className="h-8 text-xs font-semibold rounded-md border-border/80"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      <CustomerFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      {/* Receive Payment Modal */}
      {selectedPayCustomer && (
        <ReceivePaymentDialog
          open={Boolean(selectedPayCustomer)}
          onOpenChange={(open) => {
            if (!open) setSelectedPayCustomer(null);
          }}
          customer={selectedPayCustomer}
        />
      )}
    </div>
  );
}

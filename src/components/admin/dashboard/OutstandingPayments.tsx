import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCafeOutstandingCustomers } from '../../../hooks/useAnalytics';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { ReceivePaymentDialog } from '../customers/ReceivePaymentDialog';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  ArrowRight01Icon,
  Coins01Icon,
  UserIcon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import type { Customer, OutstandingCustomerSummary } from '../../../types';

export function OutstandingPayments() {
  const { data: outstanding, isLoading } = useCafeOutstandingCustomers(5);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleOpenPayment = (summary: OutstandingCustomerSummary) => {
    // Construct a lightweight Customer object for ReceivePaymentDialog
    const customerObj: Customer = {
      id: summary.customer_id,
      name: summary.customer_name,
      phone: summary.phone || '',
      total_due: summary.total_due,
      total_orders: summary.orders_count,
      total_spent: summary.total_due,
      total_paid: 0,
      is_active: true,
      created_at: summary.oldest_due_date || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSelectedCustomer(customerObj);
    setIsPaymentOpen(true);
  };

  const hasDues = outstanding && outstanding.length > 0;

  return (
    <>
      <Card className="border border-border/80 bg-card rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
              <HugeiconsIcon icon={Clock01Icon} size={16} />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                Outstanding Customer Dues
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Pay Later accounts requiring collection follow-up
              </p>
            </div>
          </div>

          <Link
            to={ROUTES.ADMIN.CUSTOMERS}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>All Customers</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
          </Link>
        </CardHeader>

        <CardContent className="pt-4 flex-1 flex flex-col justify-center">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg bg-muted" />
              ))}
            </div>
          ) : !hasDues ? (
            <div className="h-44 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} />
              </div>
              <p className="text-xs font-bold text-foreground">All customer credit is fully settled</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                There are currently zero outstanding balances on completed cafe orders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {outstanding.map((item) => (
                <div
                  key={item.customer_id}
                  className="p-3 rounded-lg border border-border/70 bg-card/60 hover:bg-secondary/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <HugeiconsIcon icon={UserIcon} size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{item.customer_name}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {item.phone && <span>Ph: {item.phone}</span>}
                      {item.oldest_due_date && (
                        <span>Due since {formatDate(item.oldest_due_date)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-rose-600 block">
                        Due Amount
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        {formatCurrency(item.total_due)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenPayment(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 gap-1 shadow-2xs"
                    >
                      <HugeiconsIcon icon={Coins01Icon} size={13} />
                      <span>Collect</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reusable Payment Receipt Modal */}
      {selectedCustomer && (
        <ReceivePaymentDialog
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          customer={selectedCustomer}
        />
      )}
    </>
  );
}

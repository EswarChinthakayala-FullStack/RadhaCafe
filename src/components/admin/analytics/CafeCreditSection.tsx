import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import type { CafeCreditAnalytics } from '../../../types';

interface CafeCreditSectionProps {
  creditData?: CafeCreditAnalytics;
  isLoading: boolean;
}

export function CafeCreditSection({ creditData, isLoading }: CafeCreditSectionProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-5 w-44 bg-muted/60" />
          <Skeleton className="h-3 w-64 bg-muted/40" />
        </CardHeader>
        <CardContent className="p-6 h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const debtors = creditData?.top_debtors || [];
  const currentOutstanding = creditData?.current_outstanding || 0;
  const customersCount = creditData?.customers_with_dues_count || 0;
  const ordersCount = creditData?.outstanding_orders_count || 0;
  const collectionsFromCredit = creditData?.period_collections_from_credit || 0;

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <HugeiconsIcon icon={UserGroupIcon} size={16} />
            </div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Customer Credit & Outstanding Exposure
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Monitor active Pay Later balances and payment follow-up requirements
          </CardDescription>
        </div>

        <Link
          to={ROUTES.ADMIN.CUSTOMERS}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cinnamon bg-cinnamon/10 hover:bg-cinnamon/20 rounded-lg transition-colors border border-cinnamon/20 shrink-0 self-start sm:self-auto"
        >
          <span>Manage Customers</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Outstanding
            </span>
            <p className="text-lg sm:text-xl font-extrabold font-heading text-amber-700 dark:text-amber-400">
              {formatCurrency(currentOutstanding)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Customers with Dues
            </span>
            <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
              {customersCount}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Unpaid / Partial Orders
            </span>
            <p className="text-lg sm:text-xl font-extrabold font-heading text-foreground">
              {ordersCount}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Period Debt Collections
            </span>
            <p className="text-lg sm:text-xl font-extrabold font-heading text-emerald-600">
              {formatCurrency(collectionsFromCredit)}
            </p>
          </div>
        </div>

        {/* Top Debtors Table / List */}
        {debtors.length > 0 ? (
          <div className="space-y-2.5 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              <span>Top Outstanding Customers</span>
              <span>Action</span>
            </div>

            <div className="space-y-2">
              {debtors.map((debtor) => (
                <div
                  key={debtor.customer_id}
                  className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/60 flex items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <HugeiconsIcon icon={UserIcon} size={15} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground truncate">{debtor.customer_name}</span>
                        {debtor.phone && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {debtor.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {debtor.orders_count} unpaid {debtor.orders_count === 1 ? 'order' : 'orders'} • oldest{' '}
                        {debtor.oldest_due_date ? formatDate(debtor.oldest_due_date, 'dd MMM yyyy') : 'recent'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold font-mono text-amber-700 dark:text-amber-400 text-xs">
                        {formatCurrency(debtor.total_due)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">Due Balance</p>
                    </div>

                    <Button
                      render={
                        <Link
                          to={ROUTES.ADMIN.CUSTOMERS}
                          className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-card border border-border/80 hover:bg-secondary/60 text-foreground shadow-2xs inline-flex items-center gap-1"
                        />
                      }
                    >
                      <span className="hidden sm:inline">Ledger</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
            </div>
            <h4 className="font-bold text-foreground text-sm">All Customer Balances Settled</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no outstanding Pay Later credit dues across RadhaCafe.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

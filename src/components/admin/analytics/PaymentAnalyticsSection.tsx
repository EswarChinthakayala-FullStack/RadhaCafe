import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CreditCardIcon,
  Wallet01Icon,
  QrCodeIcon,
  Invoice01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import type { CafePaymentSummary, DateRangeBounds } from '../../../types';

interface PaymentAnalyticsSectionProps {
  summary?: CafePaymentSummary;
  isLoading: boolean;
  bounds: DateRangeBounds;
}

export function PaymentAnalyticsSection({ summary, isLoading, bounds }: PaymentAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/80 bg-card rounded-2xl shadow-2xs p-6 h-72">
          <Skeleton className="h-full w-full bg-muted/30 rounded-xl" />
        </Card>
        <Card className="border-border/80 bg-card rounded-2xl shadow-2xs p-6 h-72">
          <Skeleton className="h-full w-full bg-muted/30 rounded-xl" />
        </Card>
      </div>
    );
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return QrCodeIcon;
      case 'cash':
        return Wallet01Icon;
      case 'card':
        return CreditCardIcon;
      default:
        return Invoice01Icon;
    }
  };

  const methods = summary?.methods || [];
  const statuses = summary?.statuses || [];
  const totalCollected = summary?.total_collected || 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      {/* Card 1: Payment Methods Inflows */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <HugeiconsIcon icon={CreditCardIcon} size={16} />
                </div>
                <div>
                  <CardTitle className="text-base font-bold font-heading text-foreground">
                    Collections by Payment Method
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Actual inflows recorded in payment ledger ({bounds.label})
                  </CardDescription>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Collected
                </span>
                <span className="font-bold font-mono text-emerald-600 text-sm">
                  {formatCurrency(totalCollected)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5 pt-4 text-xs">
            {methods.length > 0 ? (
              methods.map((m) => {
                const IconComponent = getMethodIcon(m.method);
                return (
                  <div
                    key={m.method}
                    className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
                          <HugeiconsIcon icon={IconComponent} size={14} />
                        </div>
                        <span className="font-bold text-foreground">{m.label}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono text-muted-foreground border-border/60"
                        >
                          {m.count} {m.count === 1 ? 'tx' : 'txs'}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono text-foreground text-xs">
                          {formatCurrency(m.amount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                          ({m.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden border border-border/40">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, m.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-4 text-center">
                <HugeiconsIcon icon={CreditCardIcon} size={24} className="text-muted-foreground/40 mb-1" />
                <p className="font-semibold text-foreground">No payments recorded</p>
                <p className="text-[11px] text-muted-foreground">
                  Payment inflows will appear here as orders and collections are processed.
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Card 2: Order Payment Status Composition */}
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
        <div>
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
                <HugeiconsIcon icon={Invoice01Icon} size={16} />
              </div>
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Order Payment Status
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Paid in full vs partially paid vs Pay Later credit
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3.5 pt-4 text-xs">
            {statuses.length > 0 ? (
              statuses.map((st) => {
                const isPaid = st.status === 'paid';
                const isPartial = st.status === 'partial';
                const isUnpaid = st.status === 'unpaid';

                return (
                  <div
                    key={st.status}
                    className={`p-3 rounded-xl border space-y-2 ${
                      isPaid
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isPartial
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded-md ${
                            isPaid
                              ? 'text-emerald-600 bg-emerald-500/15'
                              : isPartial
                              ? 'text-amber-600 bg-amber-500/15'
                              : 'text-rose-600 bg-rose-500/15'
                          }`}
                        >
                          <HugeiconsIcon
                            icon={isPaid ? CheckmarkCircle02Icon : AlertCircleIcon}
                            size={14}
                          />
                        </div>
                        <span className="font-bold text-foreground">{st.label}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono text-muted-foreground border-border/60"
                        >
                          {st.order_count} {st.order_count === 1 ? 'order' : 'orders'}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono text-foreground text-xs">
                          {formatCurrency(st.total_amount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                          ({st.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Detailed dues info if unpaid or partial */}
                    {(isPartial || isUnpaid) && st.due_amount > 0 && (
                      <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/40">
                        <span>Paid: {formatCurrency(st.paid_amount)}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          Due: {formatCurrency(st.due_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-4 text-center">
                <HugeiconsIcon icon={Invoice01Icon} size={24} className="text-muted-foreground/40 mb-1" />
                <p className="font-semibold text-foreground">No order statuses recorded</p>
                <p className="text-[11px] text-muted-foreground">
                  Order status breakdown will display here as orders are finalized.
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

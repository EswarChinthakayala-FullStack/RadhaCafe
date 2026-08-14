import { usePaymentMethodBreakdown } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CreditCardIcon,
  Coins01Icon,
  QrCodeIcon,
  Clock01Icon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface PaymentBreakdownProps {
  range: AnalyticsDateRange;
}

export function PaymentBreakdown({ range }: PaymentBreakdownProps) {
  const { data: breakdown, isLoading } = usePaymentMethodBreakdown(range);

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return Coins01Icon;
      case 'upi':
        return QrCodeIcon;
      case 'card':
        return CreditCardIcon;
      case 'pay_later':
        return Clock01Icon;
      default:
        return ShoppingBag01Icon;
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'upi':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'card':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'pay_later':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      default:
        return 'bg-secondary text-muted-foreground border-border/40';
    }
  };

  const hasData = breakdown && breakdown.length > 0 && breakdown.some((b) => b.order_count > 0);

  return (
    <Card className="border border-border/80 bg-card rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
            <HugeiconsIcon icon={CreditCardIcon} size={16} />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Sales by Payment Method
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Revenue distribution across settlement types
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="h-56 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
              <HugeiconsIcon icon={CreditCardIcon} size={20} />
            </div>
            <p className="text-xs font-bold text-foreground">No payments recorded yet</p>
            <p className="text-[11px] text-muted-foreground">
              Payment channels will automatically display when transactions occur.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {breakdown.map((item) => {
              const Icon = getMethodIcon(item.method);
              const badgeClass = getMethodBadgeColor(item.method);

              return (
                <div key={item.method} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shrink-0 ${badgeClass}`}
                      >
                        <HugeiconsIcon icon={Icon} size={11} />
                        <span>{item.label}</span>
                      </Badge>
                      <span className="text-muted-foreground font-medium text-[11px] truncate">
                        {item.order_count} {item.order_count === 1 ? 'order' : 'orders'} ({item.percentage}%)
                      </span>
                    </div>

                    <span className="font-bold text-foreground shrink-0 text-right">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

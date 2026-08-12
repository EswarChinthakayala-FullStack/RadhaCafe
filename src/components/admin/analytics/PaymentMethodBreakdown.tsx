import { usePaymentMethodBreakdown } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Loader } from '../../shared/Loader';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditCardIcon, Wallet01Icon, QrCodeIcon, Invoice01Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface PaymentMethodBreakdownProps {
  range: AnalyticsDateRange;
  customStart?: string;
  customEnd?: string;
}

export function PaymentMethodBreakdown({ range, customStart, customEnd }: PaymentMethodBreakdownProps) {
  const { data: breakdown, isLoading, isError } = usePaymentMethodBreakdown(range, customStart, customEnd);

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-xs h-80 flex items-center justify-center">
        <Loader label="Loading payment method metrics..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/80 bg-card shadow-xs p-6 text-center text-xs text-destructive">
        Unable to load payment breakdown.
      </Card>
    );
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return Wallet01Icon;
      case 'upi':
        return QrCodeIcon;
      case 'card':
        return CreditCardIcon;
      default:
        return Invoice01Icon;
    }
  };

  const hasData = breakdown && breakdown.some((b) => b.order_count > 0);

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={CreditCardIcon} size={18} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Payment Method Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Revenue distribution and order count by payment mode.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-xs">
        {hasData ? (
          <div className="space-y-3.5">
            {breakdown?.map((item) => {
              const IconComponent = getMethodIcon(item.method);
              return (
                <div key={item.method} className="space-y-1.5 p-3 rounded-md bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
                        <HugeiconsIcon icon={IconComponent} size={14} />
                      </div>
                      <span className="font-bold text-foreground capitalize">{item.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/60">
                        {item.order_count} {item.order_count === 1 ? 'order' : 'orders'}
                      </Badge>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-cinnamon text-xs">{formatCurrency(item.revenue)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-semibold">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cinnamon h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/80 rounded-md text-xs text-muted-foreground p-6 text-center space-y-2">
            <HugeiconsIcon icon={CreditCardIcon} size={28} className="text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No completed payments</p>
            <p className="text-[11px] text-muted-foreground">
              Payment distribution will plot here automatically as completed orders are processed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

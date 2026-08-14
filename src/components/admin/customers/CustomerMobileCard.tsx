import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SmartPhoneIcon,
  Copy01Icon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
  SquareLockCheckIcon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import type { Customer } from '../../../types';

interface CustomerMobileCardProps {
  customer: Customer;
  onReceivePayment: (customer: Customer) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function CustomerMobileCard({
  customer,
  onReceivePayment,
}: CustomerMobileCardProps) {
  const navigate = useNavigate();
  const due = Number(customer.total_due || 0);
  const hasDue = due > 0;
  const initials = getInitials(customer.name);
  const orderCount = customer.total_orders || 0;

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    toast.add({
      title: 'Copied',
      description: `Phone ${phone} copied.`,
      type: 'success',
    });
  };

  return (
    <Card
      onClick={() => navigate(`/admin/customers/${customer.id}`)}
      className="border border-border/80 bg-card rounded-xl shadow-2xs hover:border-cinnamon/60 transition-all cursor-pointer overflow-hidden"
    >
      <CardContent className="p-4 space-y-3">
        {/* Top Row: Avatar + Name + Outstanding Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate">
                {customer.name}
              </h3>
              <div
                className="flex items-center gap-1 font-mono text-xs text-muted-foreground mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`tel:${customer.phone}`}
                  className="hover:text-cinnamon flex items-center gap-1"
                >
                  <HugeiconsIcon icon={SmartPhoneIcon} size={12} />
                  <span>{customer.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={(e) => handleCopyPhone(customer.phone, e)}
                  className="p-0.5 hover:text-foreground transition-colors"
                  aria-label="Copy phone number"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Outstanding Due Highlight */}
          <div className="text-right shrink-0">
            {hasDue ? (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold font-mono px-2 py-0.5">
                {formatCurrency(due)} due
              </Badge>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                No dues
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Orders</span>
            <span className="font-semibold text-foreground">
              {orderCount} {orderCount === 1 ? 'order' : 'orders'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Lifetime Spend</span>
            <span className="font-mono font-semibold text-foreground">
              {formatCurrency(customer.total_spent || 0)}
            </span>
          </div>
        </div>

        {/* Last Order Note */}
        {customer.last_order_at && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-cinnamon shrink-0" />
            <span>Last order: {formatDate(customer.last_order_at, 'dd MMM yyyy')}</span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
          {hasDue && (
            <Button
              size="xs"
              onClick={() => onReceivePayment(customer)}
              className="h-8 flex-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg gap-1.5 shadow-2xs"
            >
              <HugeiconsIcon icon={SquareLockCheckIcon} size={13} />
              <span>Collect {formatCurrency(due)}</span>
            </Button>
          )}

          <Button
            size="xs"
            variant="outline"
            onClick={() => navigate(`/admin/orders/new?customer=${customer.id}`)}
            className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-border/80"
            title="New Order"
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={13} className="text-primary" />
            <span className="hidden xs:inline">New Order</span>
          </Button>

          <Button
            size="xs"
            variant="outline"
            onClick={() => navigate(`/admin/customers/${customer.id}`)}
            className="h-8 flex-1 text-xs font-bold rounded-lg gap-1 border-border/80 hover:bg-secondary"
          >
            <span>View Ledger</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Badge } from '../../ui/badge';
import type { OrderStatus } from '../../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const normalized = (status || 'pending').toLowerCase() as OrderStatus;

  const styles: Record<OrderStatus, string> = {
    pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    preparing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 line-through opacity-80',
  };

  const badgeStyle = styles[normalized] || 'bg-secondary text-muted-foreground border-border/80';

  return (
    <Badge
      className={`uppercase font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-md ${badgeStyle} ${className}`}
    >
      {normalized}
    </Badge>
  );
}

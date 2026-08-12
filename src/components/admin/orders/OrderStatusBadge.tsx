import { Badge } from '../../ui/badge';
import type { OrderStatus } from '../../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-warning/20 text-warning border-warning/30',
    preparing: 'bg-primary/20 text-primary border-primary/30',
    completed: 'bg-success/20 text-success border-success/30',
    cancelled: 'bg-danger/20 text-danger border-danger/30',
  };

  return (
    <Badge variant="outline" className={`capitalize font-semibold text-xs ${styles[status]}`}>
      {status}
    </Badge>
  );
}

import { Badge } from '../../ui/badge';
import type { PaymentStatus } from '../../../types';

interface PaymentStatusBadgeProps {
  status?: PaymentStatus | string | null;
  dueAmount?: number;
  className?: string;
}

export function PaymentStatusBadge({ status, dueAmount, className = '' }: PaymentStatusBadgeProps) {
  const isDue = dueAmount !== undefined ? dueAmount > 0 : status === 'unpaid' || status === 'outstanding';
  const isPartial = status === 'partial' || (dueAmount !== undefined && dueAmount > 0 && status !== 'unpaid');
  const isPaid = !isDue && (status === 'paid' || dueAmount === 0);

  if (isPaid) {
    return (
      <Badge
        className={`bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${className}`}
      >
        PAID
      </Badge>
    );
  }

  if (isPartial) {
    return (
      <Badge
        className={`bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${className}`}
      >
        PARTIAL
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${className}`}
    >
      OUTSTANDING
    </Badge>
  );
}

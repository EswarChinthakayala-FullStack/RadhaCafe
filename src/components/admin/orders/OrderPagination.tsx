import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface OrderPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export function OrderPagination({ page, totalPages, totalCount, onPageChange }: OrderPaginationProps) {
  if (totalCount === 0) return null;

  return (
    <div className="p-3.5 rounded-md border border-border/80 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
      <span className="text-muted-foreground">
        Total Orders: <strong className="font-mono font-bold text-foreground">{totalCount}</strong>
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="xs"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-8 text-xs font-semibold rounded-md gap-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
          <span>Previous</span>
        </Button>

        <span className="font-mono font-bold text-foreground px-2 text-xs">
          Page {page} of {totalPages}
        </span>

        <Button
          size="xs"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 text-xs font-semibold rounded-md gap-1"
        >
          <span>Next</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </Button>
      </div>
    </div>
  );
}

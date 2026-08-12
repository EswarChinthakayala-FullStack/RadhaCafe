import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, PlusSignIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

interface OrderEmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
}

export function OrderEmptyState({ isFiltered, onResetFilters }: OrderEmptyStateProps) {
  return (
    <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-4 my-4 shadow-xs">
      <div className="w-12 h-12 mx-auto rounded-md bg-cinnamon/10 text-cinnamon flex items-center justify-center border border-cinnamon/20 shadow-xs">
        <HugeiconsIcon icon={Coffee02Icon} size={24} />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-foreground font-heading">
          {isFiltered ? 'No Orders Match Your Filters' : 'No Order History Yet'}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isFiltered
            ? 'Try clearing or adjusting your search term, status, payment method, or date filter.'
            : 'No orders have been placed in the cafe yet. Create a new POS order to get started.'}
        </p>
      </div>

      <div className="flex justify-center gap-2.5 pt-2">
        {isFiltered ? (
          <Button
            size="sm"
            onClick={onResetFilters}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-9 px-4 rounded-md gap-1.5 shadow-xs"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
            <span>Clear Filters</span>
          </Button>
        ) : (
          <Link
            to={ROUTES.ADMIN.NEW_ORDER}
            className="inline-flex items-center gap-1.5 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-9 px-4 rounded-md shadow-xs transition-all"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Create New Order</span>
          </Link>
        )}
      </div>
    </div>
  );
}

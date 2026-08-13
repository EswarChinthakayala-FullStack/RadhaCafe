import { NewOrderForm } from '../../components/admin/orders/NewOrderForm';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon, Invoice01Icon } from '@hugeicons/core-free-icons';

export function NewOrderPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={22} />
            </div>
            <span>New Order POS Checkout</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select items from the menu, customize quantities, and place orders atomically.
          </p>
        </div>

        <Link
          to={ROUTES.ADMIN.ORDERS}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border/80 bg-card px-4 h-10 text-xs font-semibold text-foreground hover:bg-secondary/40 transition-all shadow-xs shrink-0"
        >
          <HugeiconsIcon icon={Invoice01Icon} size={15} />
          <span>View Order History</span>
        </Link>
      </div>

      <NewOrderForm />
    </div>
  );
}

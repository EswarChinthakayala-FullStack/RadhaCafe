import { OrderList } from '../../components/admin/orders/OrderList';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Invoice01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

export function OrdersPage() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Responsive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Invoice01Icon} size={22} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              Cafe Orders
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-0.5">
            View, search and manage RadhaCafe orders.
          </p>
        </div>

        <Link
          to={ROUTES.ADMIN.NEW_ORDER}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cinnamon px-5 h-10 text-xs font-bold text-white hover:bg-cinnamon/90 transition-all shadow-md shrink-0 w-full sm:w-auto"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          <span>New Order</span>
        </Link>
      </div>

      {/* Main Orders Content */}
      <OrderList />
    </div>
  );
}

import { OrderList } from '../../components/admin/orders/OrderList';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Invoice01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

export function OrdersPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Invoice01Icon} size={22} />
            </div>
            <span>Order History</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Inspect, filter, and reprint receipts for completed & historical cafe orders.
          </p>
        </div>

        <Link
          to={ROUTES.ADMIN.NEW_ORDER}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-cinnamon px-5 h-10 text-xs font-bold text-white hover:bg-cinnamon/90 transition-all shadow-md shrink-0"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          <span>New Order POS</span>
        </Link>
      </div>

      <OrderList />
    </div>
  );
}

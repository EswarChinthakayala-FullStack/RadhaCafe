import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { Card, CardContent } from '../../ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  ShoppingBag01Icon,
  UserGroupIcon,
  Restaurant01Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons';

export function DashboardQuickActions() {
  const actions = [
    {
      label: 'New Order',
      description: 'Open POS counter',
      to: ROUTES.ADMIN.NEW_ORDER,
      icon: PlusSignIcon,
      highlight: true,
    },
    {
      label: 'Order History',
      description: 'Filter all receipts',
      to: ROUTES.ADMIN.ORDERS,
      icon: ShoppingBag01Icon,
      highlight: false,
    },
    {
      label: 'Customer Dues',
      description: 'Manage accounts',
      to: ROUTES.ADMIN.CUSTOMERS,
      icon: UserGroupIcon,
      highlight: false,
    },
    {
      label: 'Menu Catalog',
      description: 'Update availability',
      to: ROUTES.ADMIN.MENU,
      icon: Restaurant01Icon,
      highlight: false,
    },
    {
      label: 'Full Analytics',
      description: 'Detailed reporting',
      to: ROUTES.ADMIN.ANALYTICS,
      icon: Analytics01Icon,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.label}
            to={action.to}
            className="group block focus:outline-none"
          >
            <Card
              className={`rounded-xl p-3.5 h-full transition-all duration-200 ${
                action.highlight
                  ? 'bg-cinnamon/10 border-cinnamon/30 hover:bg-cinnamon/15 hover:border-cinnamon/50 shadow-xs'
                  : 'bg-card border-border/80 hover:border-border hover:bg-secondary/40 shadow-2xs'
              }`}
            >
              <CardContent className="p-0 flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${
                    action.highlight
                      ? 'bg-cinnamon text-white'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <HugeiconsIcon icon={Icon} size={16} />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div
                    className={`text-xs font-bold truncate ${
                      action.highlight ? 'text-cinnamon' : 'text-foreground'
                    }`}
                  >
                    {action.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate font-medium">
                    {action.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '../../constants/routes';
import { StatsCards } from '../../components/admin/dashboard/StatsCards';
import { RecentOrders } from '../../components/admin/dashboard/RecentOrders';
import { RevenueChart } from '../../components/admin/dashboard/RevenueChart';
import { TopItemsChart } from '../../components/admin/dashboard/TopItemsChart';
import { Button } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, RefreshIcon, DashboardSquare01Icon } from '@hugeicons/core-free-icons';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
                <HugeiconsIcon icon={DashboardSquare01Icon} size={22} />
              </div>
              <span>Dashboard</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cinnamon/10 text-cinnamon font-bold border border-cinnamon/20">
              {todayFormatted}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Overview of today&apos;s cafe performance, live sales, revenue analytics, and recent orders.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.NEW_ORDER)}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <StatsCards />

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />
        <TopItemsChart />
      </div>

      {/* Recent Orders List */}
      <RecentOrders />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { Button } from '../../ui/button';
import { LiveCafeTime } from '../../contact/LiveCafeTime';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  RefreshIcon,
  Calendar01Icon,
  DashboardSquare01Icon,
} from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange } from '../../../types';

interface DashboardHeaderProps {
  selectedRange: AnalyticsDateRange;
  onRangeChange: (range: AnalyticsDateRange) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function DashboardHeader({
  selectedRange,
  onRangeChange,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  // Contextual greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & Contextual Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
              <HugeiconsIcon icon={DashboardSquare01Icon} size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              Cafe Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold border border-border/60">
              <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-primary" />
              {todayFormatted}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            <span className="font-semibold text-foreground/90">{greeting}.</span> Here&apos;s how RadhaCafe is performing today.
          </p>
        </div>

        {/* Right: Live IST Clock & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Live Cafe Clock Widget */}
          <div className="hidden lg:flex items-center bg-card border border-border/80 rounded-lg px-3 py-1.5 shadow-2xs">
            <LiveCafeTime />
          </div>

          {/* Manual Refresh */}
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold gap-1.5 h-9 bg-card border-border/80 hover:bg-secondary"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}
            />
            <span className="hidden xs:inline">Refresh</span>
          </Button>

          {/* Strong Primary CTA: New Order */}
          <Button
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.NEW_ORDER)}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 px-4 shadow-sm transition-all"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* Sub-Header: Mobile Date and Chart Range Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-cinnamon" />
          <span>{todayFormatted}</span>
        </div>

        {/* Analytics Range Selector Pills */}
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/60 ml-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 hidden sm:inline">
            Chart Range:
          </span>
          {(['today', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedRange === r
                  ? 'bg-card text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'today' ? 'Today' : r === 'week' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

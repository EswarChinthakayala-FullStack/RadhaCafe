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
    <div className="space-y-4 border-b border-border/70 pb-4">
      {/* ── Row 1: Title, Branding, Live Clock & Main CTAs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Title & Date */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
            <HugeiconsIcon icon={DashboardSquare01Icon} size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight whitespace-nowrap">
            Cafe Dashboard
          </h1>
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold border border-border/60">
            <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-primary shrink-0" />
            <span>{todayFormatted}</span>
          </span>
        </div>

        {/* Right Live Clock & Order Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end">
          {/* Live Cafe Clock Widget */}
          <div className="shrink-0">
            <LiveCafeTime />
          </div>

          <div className="flex items-center gap-2">
            {/* Manual Refresh */}
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs font-semibold gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 bg-card border-border/80 hover:bg-secondary shrink-0"
              title="Refresh Dashboard Data"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={14}
                className={isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'}
              />
              <span className="hidden md:inline">Refresh</span>
            </Button>

            {/* Strong Primary CTA: New Order */}
            <Button
              size="sm"
              onClick={() => navigate(ROUTES.ADMIN.NEW_ORDER)}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-8 sm:h-9 px-3.5 sm:px-4 shadow-sm transition-all shrink-0"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span>New Order</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Contextual Greeting & Synchronized Range Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
        <p className="text-xs text-muted-foreground font-medium">
          <span className="font-semibold text-foreground/90">{greeting}.</span> Here&apos;s how RadhaCafe is performing today.
        </p>

        {/* Chart Range Selector Pills */}
        <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-lg border border-border/60 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1.5 hidden xs:inline">
            Range:
          </span>
          {(['today', 'week', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedRange === r
                  ? 'bg-card text-foreground shadow-2xs border border-border/60'
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

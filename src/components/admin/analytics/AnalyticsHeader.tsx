import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { AnalyticsDateRangeSelector } from './AnalyticsDateRangeSelector';
import { AnalyticsExportMenu } from './AnalyticsExportMenu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Analytics01Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange, DateRangeBounds } from '../../../types';

interface AnalyticsHeaderProps {
  bounds: DateRangeBounds;
  onSelectPreset: (preset: AnalyticsDateRange) => void;
  onSelectCustomRange: (start: string, end: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AnalyticsHeader({
  bounds,
  onSelectPreset,
  onSelectCustomRange,
  onRefresh,
  isRefreshing,
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      {/* Top Row: Page Title + Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
                <HugeiconsIcon icon={Analytics01Icon} size={20} />
              </div>
              <span>Cafe Analytics</span>
            </h1>

            <Badge variant="outline" className="text-[11px] font-semibold text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2.5 py-0.5">
              {bounds.label}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Understand RadhaCafe sales, orders, products and payment performance.
          </p>
        </div>

        {/* Top Right Actions: Refresh & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs font-semibold rounded-lg gap-1.5 bg-card border-border/80 text-foreground hover:bg-secondary/60 shadow-2xs"
            title="Refresh analytics metrics"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={isRefreshing ? 'animate-spin text-cinnamon' : 'text-muted-foreground'}
            />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          <AnalyticsExportMenu bounds={bounds} />
        </div>
      </div>

      {/* Bottom Row: Global Date Range Selector Bar */}
      <div className="pt-1">
        <AnalyticsDateRangeSelector
          bounds={bounds}
          onSelectPreset={onSelectPreset}
          onSelectCustomRange={onSelectCustomRange}
        />
      </div>
    </div>
  );
}

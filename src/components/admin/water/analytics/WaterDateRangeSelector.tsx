import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WaterAnalyticsDateRange } from '@/types/water.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, FilterIcon } from '@hugeicons/core-free-icons';

interface WaterDateRangeSelectorProps {
  range: WaterAnalyticsDateRange;
  setRange: (r: WaterAnalyticsDateRange) => void;
  customStart?: string;
  setCustomStart?: (s: string) => void;
  customEnd?: string;
  setCustomEnd?: (e: string) => void;
}

const PRESETS: { value: WaterAnalyticsDateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'days_30', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Previous Month' },
  { value: 'custom', label: 'Custom Range' },
];

export const WaterDateRangeSelector: React.FC<WaterDateRangeSelectorProps> = ({
  range,
  setRange,
  customStart = '',
  setCustomStart,
  customEnd = '',
  setCustomEnd,
}) => {
  return (
    <div className="bg-card border border-border/80 p-3 sm:p-4 rounded-md shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground font-heading shrink-0">
          <div className="p-1.5 rounded-md bg-cinnamon/10 text-cinnamon border border-cinnamon/20">
            <HugeiconsIcon icon={FilterIcon} size={15} />
          </div>
          <span>Date Range Filter:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 no-scrollbar w-full md:w-auto">
          {PRESETS.map((p) => {
            const isSelected = range === p.value;
            return (
              <Button
                key={p.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="xs"
                className={
                  isSelected
                    ? 'bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-8 rounded-lg shadow-2xs px-3 whitespace-nowrap shrink-0'
                    : 'text-xs h-8 text-foreground/80 rounded-lg px-3 whitespace-nowrap shrink-0'
                }
                onClick={() => setRange(p.value)}
              >
                {p.label}
              </Button>
            );
          })}
        </div>
      </div>

      {range === 'custom' && (
        <div className="flex flex-col sm:flex-row items-end gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="space-y-1 w-full sm:w-44">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-cinnamon" />
              <span>Start Date</span>
            </Label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart?.(e.target.value)}
              className="h-8 text-xs bg-background rounded-md"
            />
          </div>

          <div className="space-y-1 w-full sm:w-44">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-cinnamon" />
              <span>End Date</span>
            </Label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd?.(e.target.value)}
              className="h-8 text-xs bg-background rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

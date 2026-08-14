import { useState } from 'react';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import type { AnalyticsDateRange, DateRangeBounds } from '../../../types';

interface AnalyticsDateRangeSelectorProps {
  bounds: DateRangeBounds;
  onSelectPreset: (preset: AnalyticsDateRange) => void;
  onSelectCustomRange: (start: string, end: string) => void;
}

const PRESETS: Array<{ label: string; value: AnalyticsDateRange }> = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
  { label: 'Previous Month', value: 'prev_month' },
];

export function AnalyticsDateRangeSelector({
  bounds,
  onSelectPreset,
  onSelectCustomRange,
}: AnalyticsDateRangeSelectorProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState<string>(bounds.customStart || '');
  const [customEnd, setCustomEnd] = useState<string>(bounds.customEnd || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      setErrorMsg('Please select both start and end dates.');
      return;
    }

    if (new Date(customStart) > new Date(customEnd)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }

    setErrorMsg(null);
    onSelectCustomRange(customStart, customEnd);
    setIsCustomOpen(false);
  };

  const isCustomActive = bounds.range === 'custom';

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
      {/* Preset Buttons */}
      {PRESETS.map((preset) => {
        const isSelected = bounds.range === preset.value;
        return (
          <Button
            key={preset.value}
            type="button"
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelectPreset(preset.value)}
            className={`h-8 px-3 text-xs font-semibold rounded-lg shrink-0 transition-all ${
              isSelected
                ? 'bg-cinnamon hover:bg-cinnamon/90 text-white shadow-2xs font-bold'
                : 'bg-card hover:bg-secondary/60 text-foreground border-border/80'
            }`}
          >
            {preset.label}
          </Button>
        );
      })}

      {/* Custom Range Popover */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant={isCustomActive ? 'default' : 'outline'}
              className={`h-8 px-3 text-xs font-semibold rounded-lg shrink-0 gap-1.5 transition-all ${
                isCustomActive
                  ? 'bg-cinnamon hover:bg-cinnamon/90 text-white shadow-2xs font-bold'
                  : 'bg-card hover:bg-secondary/60 text-foreground border-border/80'
              }`}
            />
          }
        >
          <HugeiconsIcon icon={Calendar01Icon} size={13} />
          <span>
            {isCustomActive && bounds.customStart && bounds.customEnd
              ? `${formatDate(bounds.customStart, 'dd MMM')} - ${formatDate(bounds.customEnd, 'dd MMM')}`
              : 'Custom Range'}
          </span>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-auto p-4 bg-card border-border/80 rounded-xl shadow-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">Select Custom Date Range</h4>
            <p className="text-[11px] text-muted-foreground">Pick a custom timeframe to analyze Cafe performance.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Start Date Calendar Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Start Date</label>
              <div className="border border-border/70 rounded-lg p-1 bg-background">
                <Calendar
                  mode="single"
                  selected={customStart ? new Date(customStart + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setCustomStart(`${yyyy}-${mm}-${dd}`);
                      setErrorMsg(null);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />
              </div>
            </div>

            {/* End Date Calendar Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">End Date</label>
              <div className="border border-border/70 rounded-lg p-1 bg-background">
                <Calendar
                  mode="single"
                  selected={customEnd ? new Date(customEnd + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setCustomEnd(`${yyyy}-${mm}-${dd}`);
                      setErrorMsg(null);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />
              </div>
            </div>
          </div>

          {errorMsg && <p className="text-[11px] text-destructive font-semibold">{errorMsg}</p>}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="text-[11px] text-muted-foreground font-mono">
              {customStart && customEnd ? `${customStart} → ${customEnd}` : 'Select dates above'}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomOpen(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCustom}
                disabled={!customStart || !customEnd}
                className="h-8 px-3.5 text-xs font-bold bg-cinnamon hover:bg-cinnamon/90 text-white rounded-lg shadow-2xs gap-1.5"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                <span>Apply Range</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

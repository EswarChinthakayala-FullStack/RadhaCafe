import { useRef, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  SparklesIcon,
  CheckmarkCircle02Icon,
  ArrowUpRight01Icon,
  FilterIcon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons';
import type { ChangelogCategory, ChangelogFiltersState } from '../../../features/changelog/types';

interface ChangelogToolbarProps {
  filters: ChangelogFiltersState;
  onFilterChange: (filters: ChangelogFiltersState) => void;
  onResetFilters: () => void;
  availableAreas: string[];
  availableReleases: { id: string; title: string; count: number; isLatest?: boolean }[];
  totalFilteredEntries: number;
  totalEntries: number;
  isFiltered: boolean;
  activeFilterCount: number;
  onJumpToRelease: (releaseId: string) => void;
}

const CATEGORY_TABS: { id: 'all' | ChangelogCategory; label: string; icon?: any }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New', icon: SparklesIcon },
  { id: 'improved', label: 'Improved', icon: ArrowUpRight01Icon },
  { id: 'fixed', label: 'Fixed', icon: CheckmarkCircle02Icon },
];

export function ChangelogToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  availableAreas,
  availableReleases,
  totalFilteredEntries,
  totalEntries,
  isFiltered,
  activeFilterCount,
  onJumpToRelease,
}: ChangelogToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Changelog filters and search"
      className="sticky -top-4 md:-top-6 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-y border-border/80 shadow-xs w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] transition-all"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full min-w-0 max-w-7xl mx-auto">
        {/* ── Search Input & Mobile Area Dropdown ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Search Input (Standard h-9 height) */}
          <div className="relative flex-1 min-w-0 max-w-full sm:max-w-xs md:max-w-sm">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              ref={searchInputRef}
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search updates..."
              className="h-9 pl-9 pr-12 text-xs rounded-xl bg-card border-border/80 shadow-2xs focus-visible:ring-cinnamon/20"
              aria-label="Search changelog updates"
            />

            {/* Clear Button or Keyboard Shortcut */}
            {filters.search ? (
              <button
                type="button"
                onClick={() => {
                  onFilterChange({ ...filters, search: '' });
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-secondary/80 rounded border border-border/60 pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* Area Filter on Mobile (Matched h-9 height inline with search) */}
          <div className="sm:hidden w-32 shrink-0">
            <Select
              value={filters.area}
              onValueChange={(val: any) => onFilterChange({ ...filters, area: val || 'all' })}
            >
              <SelectTrigger
                size="sm"
                className="h-9 text-xs font-medium rounded-xl bg-card border-border/80 shadow-2xs px-2.5"
                aria-label="Filter by product area"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={FilterIcon} size={12} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{filters.area === 'all' ? 'All Areas' : filters.area}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 rounded-xl text-xs shadow-xl max-h-60">
                <SelectItem value="all">All Areas</SelectItem>
                {availableAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Category Chips & Desktop Controls (All h-9 height aligned) ── */}
        <div className="flex items-center gap-2 justify-between sm:justify-end overflow-x-auto no-scrollbar py-0.5 sm:py-0">
          {/* Category Segmented Bar (h-9 height with h-7.5 internal tabs) */}
          <div className="flex items-center p-0.5 h-9 rounded-xl bg-secondary/50 border border-border/70 text-xs font-semibold shadow-2xs shrink-0">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = filters.category === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, category: tab.id })}
                  className={`h-7.5 px-3 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs font-bold border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {Icon && <HugeiconsIcon icon={Icon} size={12} className="shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Area Filter Dropdown on Tablet & Desktop (Matched h-9 height) */}
          <div className="hidden sm:block w-32 md:w-36 shrink-0">
            <Select
              value={filters.area}
              onValueChange={(val: any) => onFilterChange({ ...filters, area: val || 'all' })}
            >
              <SelectTrigger
                size="sm"
                className="h-9 text-xs font-medium rounded-xl bg-card border-border/80 shadow-2xs px-3"
                aria-label="Filter by product area"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={FilterIcon} size={12} className="text-muted-foreground shrink-0" />
                  <SelectValue placeholder="All Areas" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 rounded-xl text-xs shadow-xl max-h-60">
                <SelectItem value="all">All Areas</SelectItem>
                {availableAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jump to Date Selector (Desktop Only, Matched h-9 height) */}
          {availableReleases.length > 1 && (
            <div className="hidden lg:block w-32 shrink-0">
              <Select
                onValueChange={(val: any) => {
                  if (typeof val === 'string' && val) {
                    onJumpToRelease(val);
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-9 text-xs font-medium rounded-xl bg-card border-border/80 shadow-2xs px-3"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-muted-foreground shrink-0" />
                    <span>Jump to Date</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/80 rounded-xl text-xs shadow-xl max-h-60">
                  {availableReleases.map((rel) => (
                    <SelectItem key={rel.id} value={rel.id}>
                      {rel.title} ({rel.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Clear Filters Action (Matched h-9 height) */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onResetFilters}
              className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 gap-1 rounded-xl shrink-0 cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
              <span className="hidden sm:inline">Clear</span>
              <span>({activeFilterCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Filter Sub-Bar */}
      {isFiltered && (
        <div className="pt-1.5 mt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground max-w-7xl mx-auto">
          <span className="truncate pr-2">
            {filters.search
              ? `${totalFilteredEntries} result${totalFilteredEntries === 1 ? '' : 's'} for "${filters.search}"`
              : `${totalFilteredEntries} of ${totalEntries} updates match filters`}
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-cinnamon hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}
    </nav>
  );
}

// Backwards compatibility re-exports
export const ChangelogStickyHeader = ChangelogToolbar;
export const ChangelogHeader = ChangelogToolbar;

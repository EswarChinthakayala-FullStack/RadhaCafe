import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  StarIcon,
  FilterIcon,
  Sorting05Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import type { ReviewSortOption } from '../../lib/supabase/queries/discussion';

interface ReviewToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedRating: number | 'all';
  onSelectRating: (rating: number | 'all') => void;
  hasResponseOnly: boolean;
  onToggleResponseOnly: (val: boolean) => void;
  sort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
  totalFilteredCount?: number;
  totalAllCount?: number;
  className?: string;
}

export function ReviewToolbar({
  search,
  onSearchChange,
  selectedRating,
  onSelectRating,
  hasResponseOnly,
  onToggleResponseOnly,
  sort,
  onSortChange,
  totalFilteredCount,
  totalAllCount,
  className = '',
}: ReviewToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Sync external search reset
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedRating !== 'all' ||
    hasResponseOnly ||
    sort !== 'relevant';

  const handleClearAll = () => {
    setLocalSearch('');
    onSearchChange('');
    onSelectRating('all');
    onToggleResponseOnly(false);
    onSortChange('relevant');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls Row: Search + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#E5A88B]/60">
            <HugeiconsIcon icon={Search01Icon} size={15} />
          </div>
          <Input
            placeholder="Search reviews by guest name or message..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-11 pl-9 pr-8 text-xs bg-[#1D100A] border-[#3E2519]/80 text-cream placeholder:text-[#EAD5C3]/40 rounded-xl focus:border-[#E5A88B] focus:ring-1 focus:ring-[#E5A88B]"
            aria-label="Search reviews"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-cream/50 hover:text-cream cursor-pointer"
              aria-label="Clear search text"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-cream/60 font-semibold">
            <HugeiconsIcon icon={Sorting05Icon} size={14} className="text-[#E5A88B]" />
            <span>Sort by:</span>
          </div>
          <Select value={sort} onValueChange={(v) => onSortChange(v as ReviewSortOption)}>
            <SelectTrigger className="h-11 min-w-[170px] text-xs bg-[#1D100A] border-[#3E2519]/80 text-cream rounded-xl focus:border-[#E5A88B]">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Sorting05Icon} size={13} className="text-[#E5A88B] lg:hidden" />
                <SelectValue placeholder="Sort Reviews" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1F120C] border-[#3E2519] text-cream">
              <SelectItem value="relevant">Most Relevant</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-cream/60 mr-1 uppercase tracking-wider">
            <HugeiconsIcon icon={FilterIcon} size={12} className="text-[#E5A88B]" />
            <span>Filters:</span>
          </div>

          {/* All Filter Pill */}
          <button
            type="button"
            onClick={() => onSelectRating('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedRating === 'all'
                ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                : 'bg-[#1D100A] text-cream/70 hover:text-cream border border-[#3E2519]/70 hover:border-[#E5A88B]/40'
            }`}
          >
            All {totalAllCount !== undefined && totalAllCount > 0 ? `(${totalAllCount})` : ''}
          </button>

          {/* Star Filter Pills */}
          {[5, 4, 3, 2, 1].map((star) => {
            const isSelected = selectedRating === star;
            return (
              <button
                type="button"
                key={star}
                onClick={() => onSelectRating(isSelected ? 'all' : star)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                    : 'bg-[#1D100A] text-cream/70 hover:text-cream border border-[#3E2519]/70 hover:border-[#E5A88B]/40'
                }`}
                aria-label={`Filter ${star} stars`}
              >
                <span>{star}</span>
                <HugeiconsIcon
                  icon={StarIcon}
                  size={11}
                  className={isSelected ? 'fill-[#140A06] text-[#140A06]' : 'fill-amber-400 text-amber-400'}
                />
              </button>
            );
          })}

          {/* With Owner Response Pill */}
          <button
            type="button"
            onClick={() => onToggleResponseOnly(!hasResponseOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              hasResponseOnly
                ? 'bg-[#E5A88B] text-[#140A06] shadow-sm'
                : 'bg-[#1D100A] text-cream/70 hover:text-cream border border-[#3E2519]/70 hover:border-[#E5A88B]/40'
            }`}
          >
            <HugeiconsIcon icon={Message01Icon} size={12} className={hasResponseOnly ? 'text-[#140A06]' : 'text-[#E5A88B]'} />
            <span>With Owner Reply</span>
          </button>
        </div>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[#E5A88B] hover:text-[#EEB89D] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={13} />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Results Count Meta */}
      {totalFilteredCount !== undefined && (
        <div className="text-[11px] text-cream/60 font-medium pt-1">
          Showing <span className="text-cream font-bold">{totalFilteredCount}</span> {totalFilteredCount === 1 ? 'review' : 'reviews'}
          {hasActiveFilters && <span> matching your criteria</span>}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  FilterIcon,
} from '@hugeicons/core-free-icons';

export interface ReviewsToolbarFilters {
  search: string;
  status: 'all' | 'pending' | 'approved';
  rating: number | 'all';
  reply: 'all' | 'needed' | 'replied';
  sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

interface ReviewsToolbarProps {
  filters: ReviewsToolbarFilters;
  onChange: (filters: ReviewsToolbarFilters) => void;
  onReset: () => void;
  pendingCount?: number;
  approvedCount?: number;
  totalCount?: number;
}

export function ReviewsToolbar({
  filters,
  onChange,
  onReset,
  pendingCount = 0,
  approvedCount = 0,
  totalCount = 0,
}: ReviewsToolbarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounced search sync
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange({ ...filters, search: localSearch });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, filters, onChange]);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== 'all' ||
    filters.rating !== 'all' ||
    filters.reply !== 'all' ||
    filters.sort !== 'newest';

  // Format Select Trigger Labels
  const getRatingLabel = () => {
    if (filters.rating === 'all') return 'Rating: All';
    return `${filters.rating} Stars`;
  };

  const getReplyLabel = () => {
    if (filters.reply === 'needed') return 'Reply: Needs Reply';
    if (filters.reply === 'replied') return 'Reply: With Reply';
    return 'Reply: All';
  };

  const getSortLabel = () => {
    switch (filters.sort) {
      case 'oldest':
        return 'Sort: Oldest';
      case 'highest':
        return 'Sort: Highest';
      case 'lowest':
        return 'Sort: Lowest';
      case 'helpful':
        return 'Sort: Helpful';
      case 'newest':
      default:
        return 'Sort: Newest';
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Status Filter Buttons (Responsive Grid on mobile, Flex on tablet/desktop) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full lg:w-auto">
          {/* Pending Button */}
          <Button
            size="sm"
            type="button"
            variant={filters.status === 'pending' ? 'default' : 'outline'}
            onClick={() => onChange({ ...filters, status: 'pending' })}
            className={`h-9 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all justify-center ${
              filters.status === 'pending'
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-2xs'
                : 'border-border/80 bg-background hover:bg-secondary text-foreground'
            }`}
          >
            <span className="truncate">Pending</span>
            <span className="ml-1 sm:ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono shrink-0">
              {pendingCount}
            </span>
          </Button>

          {/* Approved Button */}
          <Button
            size="sm"
            type="button"
            variant={filters.status === 'approved' ? 'default' : 'outline'}
            onClick={() => onChange({ ...filters, status: 'approved' })}
            className={`h-9 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all justify-center ${
              filters.status === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
                : 'border-border/80 bg-background hover:bg-secondary text-foreground'
            }`}
          >
            <span className="truncate">Approved</span>
            <span className="ml-1 sm:ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono shrink-0">
              {approvedCount}
            </span>
          </Button>

          {/* All Reviews Button */}
          <Button
            size="sm"
            type="button"
            variant={filters.status === 'all' ? 'default' : 'outline'}
            onClick={() => onChange({ ...filters, status: 'all' })}
            className={`h-9 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all justify-center ${
              filters.status === 'all'
                ? 'bg-cinnamon hover:bg-cinnamon/90 text-white border-cinnamon shadow-2xs'
                : 'border-border/80 bg-background hover:bg-secondary text-foreground'
            }`}
          >
            <span className="truncate">All Reviews</span>
            <span className="ml-1 sm:ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono shrink-0">
              {totalCount}
            </span>
          </Button>
        </div>

        {/* Dropdown Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            {/* Rating Dropdown */}
            <Select
              value={String(filters.rating)}
              onValueChange={(val) =>
                onChange({
                  ...filters,
                  rating: val === 'all' ? 'all' : (Number(val) as 1 | 2 | 3 | 4 | 5),
                })
              }
            >
              <SelectTrigger className="!h-9 w-full sm:w-32 text-xs rounded-lg border-border/80 bg-background font-medium px-3 shadow-2xs truncate">
                <SelectValue>{getRatingLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-xs">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {/* Reply Status Dropdown */}
            <Select
              value={filters.reply}
              onValueChange={(val) =>
                onChange({ ...filters, reply: val as 'all' | 'needed' | 'replied' })
              }
            >
              <SelectTrigger className="!h-9 w-full sm:w-36 text-xs rounded-lg border-border/80 bg-background font-medium px-3 shadow-2xs truncate">
                <SelectValue>{getReplyLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-xs">
                <SelectItem value="all">All Replies</SelectItem>
                <SelectItem value="needed">Needs Reply</SelectItem>
                <SelectItem value="replied">With Reply</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Dropdown */}
            <Select
              value={filters.sort}
              onValueChange={(val) =>
                onChange({
                  ...filters,
                  sort: val as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful',
                })
              }
            >
              <SelectTrigger className="!h-9 w-full sm:w-36 text-xs rounded-lg border-border/80 bg-background font-medium px-3 shadow-2xs truncate">
                <SelectValue>{getSortLabel()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-xs">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} size={14} />
            </div>
            <Input
              placeholder="Search customer or text..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="!h-9 pl-8 pr-7 text-xs bg-background rounded-lg border-border/80 shadow-2xs w-full"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onChange({ ...filters, search: '' });
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                title="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
            <HugeiconsIcon icon={FilterIcon} size={12} />
            <span>Active filters:</span>
          </span>

          {filters.status !== 'all' && (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 bg-secondary/60 border-border rounded-md font-medium cursor-pointer hover:bg-secondary"
              onClick={() => onChange({ ...filters, status: 'all' })}
            >
              <span>Status: {filters.status}</span>
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </Badge>
          )}

          {filters.rating !== 'all' && (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 bg-secondary/60 border-border rounded-md font-medium cursor-pointer hover:bg-secondary"
              onClick={() => onChange({ ...filters, rating: 'all' })}
            >
              <span>{filters.rating} Stars</span>
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </Badge>
          )}

          {filters.reply !== 'all' && (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 bg-secondary/60 border-border rounded-md font-medium cursor-pointer hover:bg-secondary"
              onClick={() => onChange({ ...filters, reply: 'all' })}
            >
              <span>Reply: {filters.reply === 'needed' ? 'Needs Reply' : 'Replied'}</span>
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </Badge>
          )}

          {filters.search.trim() && (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 bg-secondary/60 border-border rounded-md font-medium cursor-pointer hover:bg-secondary"
              onClick={() => {
                setLocalSearch('');
                onChange({ ...filters, search: '' });
              }}
            >
              <span>Search: "{filters.search}"</span>
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </Badge>
          )}

          {filters.sort !== 'newest' && (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 bg-secondary/60 border-border rounded-md font-medium cursor-pointer hover:bg-secondary"
              onClick={() => onChange({ ...filters, sort: 'newest' })}
            >
              <span>Sort: {filters.sort}</span>
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="h-6 text-[11px] text-cinnamon hover:text-cinnamon/80 font-bold px-2 ml-1"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

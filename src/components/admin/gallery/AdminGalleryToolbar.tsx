import { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Cancel01Icon,
  Sorting01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export type GallerySortOption =
  | 'display_order'
  | 'views'
  | 'newest'
  | 'oldest'
  | 'caption_asc';

interface AdminGalleryToolbarProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: GallerySortOption;
  onSortChange: (sort: GallerySortOption) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isReorderMode: boolean;
  onToggleReorderMode: () => void;
}

export function AdminGalleryToolbar({
  totalCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  isReorderMode,
  onToggleReorderMode,
}: AdminGalleryToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const getSortLabel = (s: GallerySortOption) => {
    switch (s) {
      case 'views':
        return 'Top Viewed First';
      case 'newest':
        return 'Newest Uploaded';
      case 'oldest':
        return 'Oldest Uploaded';
      case 'caption_asc':
        return 'Caption (A–Z)';
      case 'display_order':
      default:
        return 'Display Order (Public)';
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Main Toolbar Controls */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Left Side: Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </div>
          <Input
            placeholder="Search captions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 pr-8 text-xs bg-background h-9 rounded-lg w-full"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} />
            </button>
          )}
        </div>

        {/* Right Side: Sort & Modes */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* Browsing Sort Select */}
          <Select
            value={sortBy}
            onValueChange={(val: string | null) =>
              onSortChange((val || 'display_order') as GallerySortOption)
            }
          >
            <SelectTrigger className="h-9 text-xs bg-background rounded-lg min-w-[150px]">
              <SelectValue placeholder="Sort">
                <span className="flex items-center gap-1.5 truncate">
                  <HugeiconsIcon icon={Sorting01Icon} size={13} className="text-muted-foreground shrink-0" />
                  <span>{getSortLabel(sortBy)}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              <SelectItem value="display_order">Display Order (Public)</SelectItem>
              <SelectItem value="views">Top Viewed First</SelectItem>
              <SelectItem value="newest">Newest Uploaded</SelectItem>
              <SelectItem value="oldest">Oldest Uploaded</SelectItem>
              <SelectItem value="caption_asc">Caption (A–Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Reorder Mode Button (only visible when in display_order sort) */}
          {sortBy === 'display_order' && totalCount > 1 && (
            <Button
              size="sm"
              variant={isReorderMode ? 'default' : 'outline'}
              onClick={onToggleReorderMode}
              className={`h-9 text-xs font-semibold rounded-lg gap-1.5 px-3 ${
                isReorderMode
                  ? 'bg-cinnamon text-white hover:bg-cinnamon/90'
                  : 'border-border/80 text-foreground'
              }`}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="rotate-90 sm:rotate-0" />
              <span>{isReorderMode ? 'Done' : 'Reorder'}</span>
            </Button>
          )}

          {/* Select Toggle Button */}
          {totalCount > 0 && (
            <Button
              size="sm"
              variant={isSelectionMode ? 'default' : 'outline'}
              onClick={onToggleSelectionMode}
              className={`h-9 text-xs font-semibold rounded-lg gap-1.5 px-3 ${
                isSelectionMode
                  ? 'bg-cinnamon text-white hover:bg-cinnamon/90'
                  : 'border-border/80 text-foreground'
              }`}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
              <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contextual Multi-Selection Sticky Bar */}
      {isSelectionMode && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-cinnamon/10 border border-cinnamon/25 flex items-center justify-between gap-2 text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Badge className="bg-cinnamon text-white font-mono text-[11px] h-6 px-2 rounded-lg">
              {selectedCount} selected
            </Badge>
            <Button
              size="xs"
              variant="ghost"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="text-xs font-semibold text-foreground hover:bg-cinnamon/15 h-7 px-2.5 rounded-md"
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedCount > 0 && (
              <Button
                size="xs"
                variant="destructive"
                onClick={onDeleteSelected}
                className="h-7 text-xs font-bold gap-1 px-3 rounded-md shadow-2xs"
              >
                <HugeiconsIcon icon={Delete02Icon} size={13} />
                <span>Delete ({selectedCount})</span>
              </Button>
            )}
            <Button
              size="xs"
              variant="outline"
              onClick={onToggleSelectionMode}
              className="h-7 text-xs rounded-md border-border/80"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

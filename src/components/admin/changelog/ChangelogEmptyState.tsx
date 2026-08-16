import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface ChangelogEmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
}

export function ChangelogEmptyState({
  isFiltered,
  onResetFilters,
}: ChangelogEmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-secondary/15 max-w-lg mx-auto my-6 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground shadow-2xs">
        <HugeiconsIcon icon={Search01Icon} size={22} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold font-heading text-foreground">
          {isFiltered ? 'No updates match your filters' : 'No updates recorded yet'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {isFiltered
            ? 'Try adjusting your search terms or category filters to find what you are looking for.'
            : 'Product release notes generated from repository commits will appear here.'}
        </p>
      </div>

      {isFiltered && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8.5 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={13} />
            <span>Clear Filters</span>
          </Button>
        </div>
      )}
    </div>
  );
}

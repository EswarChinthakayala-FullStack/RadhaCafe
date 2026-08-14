import { Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  Globe02Icon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';

interface ReviewsPageHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ReviewsPageHeader({
  onRefresh,
  isRefreshing = false,
}: ReviewsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
            <HugeiconsIcon icon={Comment01Icon} size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground tracking-tight">
            Reviews & Reputation
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Moderate customer feedback, approve ratings, and respond officially as RadhaCafe.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs border-border/80 bg-background text-foreground gap-1.5 rounded-lg"
            title="Refresh reviews data"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        <Link
          to="/reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-9 px-3.5 text-xs bg-cinnamon/10 hover:bg-cinnamon/20 text-cinnamon border border-cinnamon/30 font-semibold gap-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <HugeiconsIcon icon={Globe02Icon} size={14} />
          <span>View Public Reviews</span>
        </Link>
      </div>
    </div>
  );
}

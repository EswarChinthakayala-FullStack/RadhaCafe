import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';

interface ChangelogHeroProps {
  totalEntries: number;
  unseenCount: number;
  latestReleaseDate: string;
}

export function ChangelogHero({
  totalEntries,
  unseenCount,
  latestReleaseDate,
}: ChangelogHeroProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-border/50">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 sm:p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shadow-2xs">
            <HugeiconsIcon icon={BookOpen01Icon} size={18} />
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-heading text-foreground tracking-tight">
            Changelog
          </h1>
          {unseenCount > 0 && (
            <Badge className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
              {unseenCount} new
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground pl-0.5 max-w-xl">
          Track new features, improvements, and fixes across RadhaCafe.
        </p>
      </div>

      {/* Subtle Inline Metadata */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto shrink-0">
        <span className="font-semibold text-foreground">{totalEntries} updates</span>
        <span>·</span>
        <span>Latest {latestReleaseDate}</span>
      </div>
    </header>
  );
}

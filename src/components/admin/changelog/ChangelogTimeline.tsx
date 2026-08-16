import { useState } from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ChangelogEntryItem } from './ChangelogEntry';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, ArrowDown01Icon, Tag01Icon } from '@hugeicons/core-free-icons';
import type { ChangelogRelease } from '../../../features/changelog/types';

interface ChangelogTimelineProps {
  releases: ChangelogRelease[];
}

const RELEASES_PER_PAGE = 6;

export function ChangelogTimeline({ releases }: ChangelogTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(RELEASES_PER_PAGE);

  const visibleReleases = releases.slice(0, visibleCount);
  const hasMore = releases.length > visibleCount;

  return (
    <div className="space-y-12 w-full min-w-0">
      {visibleReleases.map((release, releaseIdx) => {
        const isLatest = release.isLatest || releaseIdx === 0;

        return (
          <section
            key={release.id}
            id={release.id}
            aria-labelledby={`heading-${release.id}`}
            className="relative w-full min-w-0 scroll-mt-24"
          >
            {/* ── Desktop & Tablet 2-Column Grid (>= 768px) ── */}
            <div className="hidden md:grid md:grid-cols-[130px_28px_minmax(0,1fr)] lg:grid-cols-[160px_36px_minmax(0,1fr)] xl:grid-cols-[175px_40px_minmax(0,1fr)] gap-2 lg:gap-4 items-start w-full min-w-0">
              {/* Left Column: Sticky Date & Release Meta (Pins while scrolling this group) */}
              <div className="sticky top-20 pt-1 space-y-1.5 text-right pr-2 select-none">
                <div className="flex items-center justify-end gap-1.5">
                  <h2
                    id={`heading-${release.id}`}
                    className="text-xs lg:text-sm font-bold font-heading text-foreground tracking-tight"
                  >
                    <time dateTime={release.date}>{release.title}</time>
                  </h2>
                </div>

                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                  {isLatest && (
                    <Badge className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                      Latest
                    </Badge>
                  )}

                  <span className="text-[11px] font-mono text-muted-foreground">
                    {release.entries.length} update{release.entries.length === 1 ? '' : 's'}
                  </span>
                </div>

                {release.tag && (
                  <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-muted-foreground pt-0.5">
                    <HugeiconsIcon icon={Tag01Icon} size={11} className="text-muted-foreground" />
                    <span>{release.tag}</span>
                  </div>
                )}
              </div>

              {/* Middle Column: Vertical Timeline Rail & Illuminated Node */}
              <div className="relative flex flex-col items-center h-full pt-1.5" aria-hidden="true">
                {/* Node Dot */}
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white dark:border-card shadow-xs z-10 transition-all ${
                    isLatest
                      ? 'bg-cinnamon ring-4 ring-cinnamon/20 scale-110'
                      : 'bg-muted-foreground/40'
                  }`}
                />
                {/* Rail line */}
                <div className="w-[1.5px] bg-gradient-to-b from-border via-border/70 to-transparent flex-1 my-1" />
              </div>

              {/* Right Column: Clean List of Borderless Update Entries */}
              <div className="space-y-1 pb-6 w-full min-w-0 max-w-4xl">
                {release.entries.map((entry) => (
                  <ChangelogEntryItem key={entry.id} entry={entry} />
                ))}
              </div>
            </div>

            {/* ── Mobile Layout (< 768px) ── */}
            <div className="md:hidden space-y-3 w-full min-w-0">
              {/* Mobile Release Group Header */}
              <div className="sticky top-14 z-10 bg-white/95 dark:bg-card/95 backdrop-blur-md py-2 border-b border-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                  <h2
                    id={`heading-${release.id}-mobile`}
                    className="text-xs font-bold font-heading text-foreground"
                  >
                    <time dateTime={release.date}>{release.title}</time>
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  {isLatest ? (
                    <Badge className="bg-cinnamon text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-2xs">
                      Latest
                    </Badge>
                  ) : null}
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({release.entries.length})
                  </span>
                </div>
              </div>

              {/* Mobile Timeline Entries */}
              <div className="relative pl-3.5 space-y-2 border-l-[1.5px] border-border/70 ml-1.5">
                {release.entries.map((entry) => (
                  <div key={entry.id} className="relative">
                    {/* Tiny connector dot */}
                    <div
                      className="absolute -left-[19px] top-3.5 w-2 h-2 rounded-full bg-cinnamon/60 border border-white dark:border-card"
                      aria-hidden="true"
                    />
                    <ChangelogEntryItem entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Load More Pagination ── */}
      {hasMore && (
        <div className="pt-2 pb-6 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((prev) => prev + RELEASES_PER_PAGE)}
            className="h-9 text-xs font-bold rounded-xl border-border/80 bg-card hover:bg-secondary gap-2 shadow-2xs px-5"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
            <span>Load Older Releases ({releases.length - visibleCount} remaining)</span>
          </Button>
        </div>
      )}
    </div>
  );
}

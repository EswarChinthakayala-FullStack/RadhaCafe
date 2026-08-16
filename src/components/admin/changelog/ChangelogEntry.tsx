import { useState } from 'react';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  FlashIcon,
  SquareLockCheckIcon,
  CodeIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from '@hugeicons/core-free-icons';
import type { ChangelogCategory, ChangelogEntry } from '../../../features/changelog/types';

interface ChangelogEntryProps {
  entry: ChangelogEntry;
}

function getCategoryConfig(category: ChangelogCategory) {
  switch (category) {
    case 'new':
      return {
        label: 'New',
        icon: SparklesIcon,
        badgeClass: 'bg-cinnamon/15 text-cinnamon dark:text-amber-300 border-cinnamon/30',
        dotClass: 'bg-cinnamon',
      };
    case 'improved':
      return {
        label: 'Improved',
        icon: ArrowUpRight01Icon,
        badgeClass: 'bg-primary/10 text-primary border-primary/25',
        dotClass: 'bg-primary',
      };
    case 'fixed':
      return {
        label: 'Fixed',
        icon: CheckmarkCircle02Icon,
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-600',
      };
    case 'performance':
      return {
        label: 'Performance',
        icon: FlashIcon,
        badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-600',
      };
    case 'security':
      return {
        label: 'Security',
        icon: SquareLockCheckIcon,
        badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
        dotClass: 'bg-purple-600',
      };
    default:
      return {
        label: 'Update',
        icon: ArrowUpRight01Icon,
        badgeClass: 'bg-secondary text-foreground border-border/80',
        dotClass: 'bg-muted-foreground',
      };
  }
}

export function ChangelogEntryItem({ entry }: ChangelogEntryProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const config = getCategoryConfig(entry.category);
  const Icon = config.icon;
  const hasGrouped = Boolean(entry.groupedCommits && entry.groupedCommits.length > 1);

  return (
    <article
      id={`entry-${entry.id}`}
      className="group relative pb-5 pt-1 border-b border-border/40 last:border-b-0 hover:bg-secondary/30 rounded-xl px-3 -mx-3 transition-colors duration-150 w-full min-w-0"
    >
      {/* ── Metadata Row: Semantic Category Badge + Plain Area Label ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md gap-1 shadow-2xs border ${config.badgeClass}`}
          >
            <HugeiconsIcon icon={Icon} size={11} className="shrink-0" />
            <span>{config.label}</span>
          </Badge>

          <span className="text-xs font-semibold text-muted-foreground">
            · {entry.area}
          </span>
        </div>

        {entry.isBreaking && (
          <Badge
            variant="destructive"
            className="text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
          >
            Important Change
          </Badge>
        )}
      </div>

      {/* ── Title & Description ── */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold font-heading text-foreground group-hover:text-cinnamon transition-colors leading-snug break-words">
          {entry.title}
        </h3>
        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed break-words">
          {entry.description}
        </p>
      </div>

      {/* ── Subtle Technical Details Collapsible ── */}
      {entry.shortHash && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-medium transition-colors cursor-pointer select-none"
            aria-expanded={showTechnicalDetails}
          >
            <HugeiconsIcon icon={CodeIcon} size={12} className="text-muted-foreground/80" />
            <span>
              Technical details {hasGrouped && `(${entry.groupedCommits!.length} changes)`}
            </span>
            <HugeiconsIcon
              icon={showTechnicalDetails ? ArrowUp01Icon : ArrowDown01Icon}
              size={11}
            />
          </button>

          {showTechnicalDetails && (
            <div className="mt-2 p-3 rounded-xl bg-secondary/40 border border-border/60 text-[11px] font-mono text-muted-foreground space-y-1.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <span>Commit SHA:</span>
                <span className="text-foreground font-bold">{entry.shortHash}</span>
              </div>
              {entry.rawScope && (
                <div className="flex items-center justify-between">
                  <span>Scope:</span>
                  <span className="text-foreground font-semibold">{entry.rawScope}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Recorded Date:</span>
                <span>{entry.date}</span>
              </div>

              {/* Grouped Commits List */}
              {hasGrouped && (
                <div className="pt-2 mt-2 border-t border-border/60 space-y-1">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Included Commits ({entry.groupedCommits!.length})
                  </span>
                  <ul className="space-y-1 pl-1">
                    {entry.groupedCommits!.map((gc) => (
                      <li key={gc.shortHash} className="flex items-start gap-1.5 text-[10.5px]">
                        <span className="text-foreground font-semibold shrink-0">
                          {gc.shortHash}
                        </span>
                        <span className="text-muted-foreground truncate">{gc.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// Backwards compatibility export
export const ChangelogEntryCard = ChangelogEntryItem;

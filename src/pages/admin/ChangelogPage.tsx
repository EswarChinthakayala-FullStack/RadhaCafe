import { useEffect, useState, useCallback } from 'react';
import { useChangelog } from '../../features/changelog/useChangelog';
import { ChangelogHero } from '../../components/admin/changelog/ChangelogHero';
import { ChangelogToolbar } from '../../components/admin/changelog/ChangelogToolbar';
import { ChangelogTimeline } from '../../components/admin/changelog/ChangelogTimeline';
import { ChangelogEmptyState } from '../../components/admin/changelog/ChangelogEmptyState';
import { Button } from '../../components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

export function ChangelogPage() {
  const {
    releases,
    totalEntries,
    totalFilteredEntries,
    unseenCount,
    availableAreas,
    availableReleases,
    filters,
    setFilters,
    isFiltered,
    activeFilterCount,
    resetFilters,
    markAsSeen,
    latestReleaseDate,
  } = useChangelog();

  const [showBackToTop, setShowBackToTop] = useState(false);

  // Mark changelog as seen upon opening the page
  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  // Show "Back to top" floating button after scrolling down the main container
  useEffect(() => {
    const scrollContainer = document.querySelector('main') || window;

    const handleScroll = () => {
      const scrollTop =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;
      setShowBackToTop(scrollTop > 350);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleJumpToRelease = useCallback((releaseId: string) => {
    const el = document.getElementById(releaseId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="-m-4 md:-m-6 p-4 md:p-6 min-h-[calc(100vh-3.5rem)] bg-white dark:bg-card text-foreground space-y-6">
      {/* ── Top Editorial Hero Header (Centered) ── */}
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <ChangelogHero
          totalEntries={totalEntries}
          unseenCount={unseenCount}
          latestReleaseDate={latestReleaseDate}
        />
      </div>

      {/* ── Full-Width Sticky Filter Toolbar (Spans entire screen width) ── */}
      <ChangelogToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        availableAreas={availableAreas}
        availableReleases={availableReleases}
        totalFilteredEntries={totalFilteredEntries}
        totalEntries={totalEntries}
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
        onJumpToRelease={handleJumpToRelease}
      />

      {/* ── Chronological Timeline Feed or Empty State (Centered) ── */}
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        {releases.length === 0 ? (
          <ChangelogEmptyState
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
          />
        ) : (
          <ChangelogTimeline releases={releases} />
        )}
      </div>

      {/* ── Floating "Back to Top" Action ── */}
      {showBackToTop && (
        <div className="fixed bottom-6 right-6 z-30 animate-in fade-in-50 zoom-in-95 duration-200">
          <Button
            type="button"
            onClick={scrollToTop}
            size="icon"
            className="w-10 h-10 rounded-full shadow-xl bg-card text-foreground border border-border/80 hover:bg-secondary hover:text-cinnamon transition-transform active:scale-95 cursor-pointer"
            aria-label="Back to top"
            title="Back to top"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChangelogPage;

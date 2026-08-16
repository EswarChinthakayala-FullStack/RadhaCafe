import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import changelogRaw from '../../generated/changelog.json';
import type {
  ChangelogCategory,
  ChangelogData,
  ChangelogEntry,
  ChangelogFiltersState,
} from './types';

const LAST_SEEN_KEY = 'radhacafe_last_seen_changelog_id';

export function useChangelog() {
  const changelogData = changelogRaw as unknown as ChangelogData;
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL search params
  const filters: ChangelogFiltersState = useMemo(() => {
    const search = searchParams.get('q') || '';
    const categoryParam = searchParams.get('type') || searchParams.get('category') || 'all';
    const area = searchParams.get('area') || 'all';

    const validCategories: Set<string> = new Set(['all', 'new', 'improved', 'fixed', 'performance', 'security']);
    const category = validCategories.has(categoryParam)
      ? (categoryParam as 'all' | ChangelogCategory)
      : 'all';

    return { search, category, area };
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: ChangelogFiltersState) => {
      const nextParams = new URLSearchParams(searchParams);

      if (newFilters.search.trim()) {
        nextParams.set('q', newFilters.search.trim());
      } else {
        nextParams.delete('q');
      }

      if (newFilters.category !== 'all') {
        nextParams.set('type', newFilters.category);
      } else {
        nextParams.delete('type');
        nextParams.delete('category');
      }

      if (newFilters.area !== 'all') {
        nextParams.set('area', newFilters.area);
      } else {
        nextParams.delete('area');
      }

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    nextParams.delete('type');
    nextParams.delete('category');
    nextParams.delete('area');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const latestRelease = changelogData.releases?.[0];
  const latestEntry = latestRelease?.entries?.[0];
  const latestEntryId = latestEntry?.id || latestRelease?.id || '';

  const lastSeenId = useMemo(() => {
    try {
      return localStorage.getItem(LAST_SEEN_KEY);
    } catch {
      return null;
    }
  }, []);

  // Calculate unseen entries count
  const unseenCount = useMemo(() => {
    if (!lastSeenId) {
      return 0;
    }

    let count = 0;
    let foundSeen = false;

    for (const release of changelogData.releases || []) {
      for (const entry of release.entries) {
        if (entry.id === lastSeenId) {
          foundSeen = true;
          break;
        }
        count++;
      }
      if (foundSeen) break;
    }

    return foundSeen ? count : 0;
  }, [changelogData, lastSeenId]);

  const markAsSeen = useCallback(() => {
    if (latestEntryId) {
      try {
        localStorage.setItem(LAST_SEEN_KEY, latestEntryId);
      } catch {
        // Ignored
      }
    }
  }, [latestEntryId]);

  // Extract unique available areas from the dataset for dynamic filter dropdown
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    for (const release of changelogData.releases || []) {
      for (const entry of release.entries) {
        if (entry.area) {
          areas.add(entry.area);
        }
      }
    }
    return Array.from(areas).sort();
  }, [changelogData]);

  // Available release list for Jump to Release selector
  const availableReleases = useMemo(() => {
    return (changelogData.releases || []).map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      count: r.entries.length,
      isLatest: r.isLatest,
    }));
  }, [changelogData]);

  // Filtered releases and entries
  const filteredReleases = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return (changelogData.releases || [])
      .map((release) => {
        const matchingEntries = release.entries.filter((entry: ChangelogEntry) => {
          // 1. Category Filter
          if (filters.category !== 'all' && entry.category !== filters.category) {
            return false;
          }

          // 2. Area Filter
          if (filters.area !== 'all' && entry.area !== filters.area) {
            return false;
          }

          // 3. Search Query
          if (query) {
            const matchesTitle = entry.title.toLowerCase().includes(query);
            const matchesDesc = entry.description.toLowerCase().includes(query);
            const matchesArea = entry.area.toLowerCase().includes(query);
            const matchesGrouped = (entry.groupedCommits || []).some(
              (gc) =>
                gc.title.toLowerCase().includes(query) ||
                gc.shortHash.toLowerCase().includes(query)
            );
            if (!matchesTitle && !matchesDesc && !matchesArea && !matchesGrouped) {
              return false;
            }
          }

          return true;
        });

        return {
          ...release,
          entries: matchingEntries,
        };
      })
      .filter((release) => release.entries.length > 0);
  }, [changelogData, filters]);

  const totalFilteredEntries = useMemo(() => {
    return filteredReleases.reduce((sum, r) => sum + r.entries.length, 0);
  }, [filteredReleases]);

  const isFiltered =
    Boolean(filters.search.trim()) ||
    filters.category !== 'all' ||
    filters.area !== 'all';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.category !== 'all') count++;
    if (filters.area !== 'all') count++;
    return count;
  }, [filters]);

  return {
    releases: filteredReleases,
    totalEntries: changelogData.totalEntries,
    totalFilteredEntries,
    unseenCount,
    hasUnseen: unseenCount > 0,
    availableAreas,
    availableReleases,
    filters,
    setFilters,
    isFiltered,
    activeFilterCount,
    resetFilters,
    markAsSeen,
    generatedAt: changelogData.generatedAt,
    latestReleaseDate: latestRelease?.title || 'Recent',
  };
}

/**
 * Lightweight helper to check unseen updates badge for AdminSidebar without full page mount
 */
export function hasUnseenChangelogUpdates(): boolean {
  try {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    const changelogData = changelogRaw as unknown as ChangelogData;
    const latestId = changelogData.releases?.[0]?.entries?.[0]?.id || '';
    if (!lastSeen) return false;
    return Boolean(latestId && lastSeen !== latestId);
  } catch {
    return false;
  }
}

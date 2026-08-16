export type ChangelogCategory = 'new' | 'improved' | 'fixed' | 'performance' | 'security';

export type ChangelogArea =
  | 'Printer'
  | 'Orders'
  | 'Offline Mode'
  | 'Receipts'
  | 'Menu'
  | 'Customers'
  | 'Reviews'
  | 'Gallery'
  | 'Analytics'
  | 'Settings'
  | 'Account'
  | 'Water'
  | 'General';

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  area: ChangelogArea;
  date: string; // ISO date string or formatted date
  commitHash?: string;
  shortHash?: string;
  isBreaking?: boolean;
  rawType?: string;
  rawScope?: string;
  groupedCommits?: {
    shortHash: string;
    title: string;
    scope?: string;
  }[];
}

export interface ChangelogRelease {
  id: string;
  title: string; // e.g. "17 Aug 2026" or "v1.4.0"
  date: string;
  tag?: string;
  isLatest?: boolean;
  entries: ChangelogEntry[];
}

export interface ChangelogData {
  generatedAt: string;
  latestCommit?: string;
  totalEntries: number;
  releases: ChangelogRelease[];
}

export interface ChangelogFiltersState {
  search: string;
  category: 'all' | ChangelogCategory;
  area: 'all' | string;
}

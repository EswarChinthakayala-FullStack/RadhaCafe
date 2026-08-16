import type {
  ChangelogArea,
  ChangelogCategory,
  ChangelogEntry,
  ChangelogRelease,
} from './types.ts';
import {
  SCOPE_TO_AREA_MAP,
  TYPE_TO_CATEGORY_MAP,
  SPECIAL_ACRONYMS,
  COMMIT_OVERRIDES,
} from './changelog.config.ts';

export interface RawCommit {
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
  body?: string;
  tag?: string;
}

export interface ParsedCommit {
  id: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  area: ChangelogArea;
  date: string;
  commitHash: string;
  shortHash: string;
  isBreaking: boolean;
  group?: string;
  rawType?: string;
  rawScope?: string;
}

/**
 * Common noisy commit patterns that should be filtered out from product notes
 */
const NOISY_SUBJECT_PATTERNS = [
  /^merge\b/i,
  /^chore\b/i,
  /^test\b/i,
  /^ci\b/i,
  /^docs\b/i,
  /^style\b/i,
  /^build\b/i,
  /^deps\b/i,
  /^bump\b/i,
  /\bprettier\b/i,
  /\beslint\b/i,
  /\bpackage-lock\b/i,
  /\bpnpm-lock\b/i,
  /\btypo\b/i,
  /\brename file\b/i,
  /\bclean up unused\b/i,
  /\bresolve typescript\b/i,
  /\btypescript error\b/i,
  /\btype error\b/i,
  /\btyping fix\b/i,
  /\bquick fix\b/i,
  /\bbuild fix\b/i,
];

/**
 * Capitalizes text to clean Title Case, honoring known technical acronyms and removing code symbols
 */
export function humanizeTitle(text: string): string {
  if (!text) return '';

  // 1. Strip conventional commit prefix e.g. feat(printer): or fix:
  let cleaned = text.replace(/^[a-z]+(\([a-z0-9_-]+\))?!?:?\s*/i, '').trim();

  // 2. Strip flags like [skip-changelog] or [changelog]
  cleaned = cleaned.replace(/\[(?:skip-)?changelog\]/gi, '').trim();

  // 3. Strip icon parentheticals and raw icon identifiers: (Award Icon), (Fire Icon), Award01Icon, etc.
  cleaned = cleaned.replace(/\s*\([a-z0-9\s_-]*icon\)/gi, '');
  cleaned = cleaned.replace(/\b[A-Za-z0-9]+Icon\b/g, '');
  cleaned = cleaned.replace(/\buse[A-Z][A-Za-z0-9]+\b/g, '');

  // 4. Clean awkward git grammatical artifacts (e.g. "distinct badges with for best seller")
  cleaned = cleaned.replace(/\bwith\s+for\b/gi, 'for');
  cleaned = cleaned.replace(/\band\s+for\b/gi, 'and');
  cleaned = cleaned.replace(/\s*to\s+prevent\s+blocking\s+product\s+images/gi, '');
  cleaned = cleaned.replace(/\s*flush\s+against\s+top\s+nav\s+with\s+zero\s+gap/gi, '');

  if (!cleaned) return '';

  // 5. Title-case words while preserving hyphens and acronyms
  const words = cleaned.split(/\s+/).filter(Boolean);
  const capitalizedWords = words.map((word, index) => {
    const parts = word.split('-');
    const formattedParts = parts.map((part) => {
      const cleanPart = part.replace(/[^a-zA-Z0-9]/g, '');
      const lower = cleanPart.toLowerCase();
      if (SPECIAL_ACRONYMS[lower]) {
        return part.replace(new RegExp(cleanPart, 'i'), SPECIAL_ACRONYMS[lower]);
      }
      const smallWords = new Set([
        'a',
        'an',
        'and',
        'as',
        'at',
        'but',
        'by',
        'for',
        'in',
        'of',
        'on',
        'or',
        'the',
        'to',
        'via',
        'with',
      ]);
      if (index > 0 && smallWords.has(lower)) {
        return part.toLowerCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    });

    return formattedParts.join('-');
  });

  let result = capitalizedWords.join(' ');

  // Clean trailing punctuation or dangling words
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Generates an empathetic, human user-facing description based on title and area
 */
export function generateFallbackDescription(
  title: string,
  category: ChangelogCategory,
  area: ChangelogArea
): string {
  // Clean title for natural sentence flow
  let cleanTitle = title.trim();
  cleanTitle = cleanTitle.replace(
    /^(Add|Added|Fix|Fixed|Update|Updated|Improve|Improved|Make|Making|Use|Using|Set|Setting)\s+/i,
    ''
  );
  if (!cleanTitle) cleanTitle = title;
  cleanTitle = cleanTitle.charAt(0).toLowerCase() + cleanTitle.slice(1);

  switch (category) {
    case 'new':
      return `Added ${cleanTitle} to provide enhanced capabilities and visibility across ${area}.`;
    case 'improved':
      return `Enhanced ${cleanTitle} for a smoother, more reliable workflow in ${area}.`;
    case 'fixed':
      return `Resolved an issue with ${cleanTitle} to ensure consistent behavior throughout ${area}.`;
    case 'performance':
      return `Optimized ${cleanTitle} for faster response times and improved system efficiency.`;
    case 'security':
      return `Strengthened access controls and administrative safeguards for ${cleanTitle}.`;
    default:
      return `Updated ${cleanTitle} to support continued reliability in ${area}.`;
  }
}

/**
 * Parses structured metadata from commit body e.g. changelog-title: ...
 */
export function parseCommitBodyMetadata(body?: string): Record<string, string> {
  if (!body) return {};

  const metadata: Record<string, string> = {};
  const lines = body.split('\n');

  for (const line of lines) {
    const match = line.match(/^changelog-([a-z0-9-]+)\s*:\s*(.+)$/i);
    if (match) {
      metadata[match[1].toLowerCase()] = match[2].trim();
    }
  }

  return metadata;
}

/**
 * Evaluates whether a raw commit should be included in the product changelog
 */
export function shouldIncludeCommit(commit: RawCommit): boolean {
  const subject = commit.subject || '';
  const body = commit.body || '';

  // Explicit skip tag
  if (subject.includes('[skip-changelog]') || body.includes('[skip-changelog]')) {
    return false;
  }

  // Explicit inclusion tag
  if (subject.includes('[changelog]') || body.includes('[changelog]')) {
    return true;
  }

  const meta = parseCommitBodyMetadata(body);
  if (meta.hidden === 'true') {
    return false;
  }
  if (meta.title || meta.description) {
    return true;
  }

  // Check conventional commit type
  const match = subject.match(/^([a-z]+)(\([a-z0-9_-]+\))?!?:/i);
  if (match) {
    const type = match[1].toLowerCase();
    if (type === 'feat' || type === 'fix' || type === 'perf') {
      return !NOISY_SUBJECT_PATTERNS.some((p) => p.test(subject));
    }
    if (type === 'refactor') {
      return !NOISY_SUBJECT_PATTERNS.some((p) => p.test(subject));
    }
    return false;
  }

  // Check plain subject against noisy patterns
  return !NOISY_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject));
}

const VALID_CATEGORIES = new Set(['new', 'improved', 'fixed', 'performance', 'security']);

/**
 * Smart Area Inference from commit message and scope
 */
export function inferAreaFromCommit(rawScope: string, subject: string): ChangelogArea {
  if (rawScope && SCOPE_TO_AREA_MAP[rawScope.toLowerCase()]) {
    // Check if subject explicitly relates to Menu vs Orders
    const lowerSub = subject.toLowerCase();
    if (
      (rawScope === 'pos' || rawScope === 'orders') &&
      (lowerSub.includes('badge') ||
        lowerSub.includes('best seller') ||
        lowerSub.includes('popular') ||
        lowerSub.includes('menu grid') ||
        lowerSub.includes('dish') ||
        lowerSub.includes('item card'))
    ) {
      return 'Menu';
    }
    return SCOPE_TO_AREA_MAP[rawScope.toLowerCase()];
  }

  const lowerSub = subject.toLowerCase();
  if (
    lowerSub.includes('printer') ||
    lowerSub.includes('bluetooth') ||
    lowerSub.includes('gatt') ||
    lowerSub.includes('thermal') ||
    lowerSub.includes('ble')
  ) {
    return 'Printer';
  }
  if (
    lowerSub.includes('receipt') ||
    lowerSub.includes('template') ||
    lowerSub.includes('preview') ||
    lowerSub.includes('tear') ||
    lowerSub.includes('cutter')
  ) {
    return 'Receipts';
  }
  if (
    lowerSub.includes('offline') ||
    lowerSub.includes('pwa') ||
    lowerSub.includes('sync') ||
    lowerSub.includes('indexeddb')
  ) {
    return 'Offline Mode';
  }
  if (
    lowerSub.includes('menu') ||
    lowerSub.includes('badge') ||
    lowerSub.includes('bestseller') ||
    lowerSub.includes('special') ||
    lowerSub.includes('dish')
  ) {
    return 'Menu';
  }
  if (lowerSub.includes('customer') || lowerSub.includes('ledger') || lowerSub.includes('due')) {
    return 'Customers';
  }
  if (lowerSub.includes('gallery') || lowerSub.includes('photo') || lowerSub.includes('share')) {
    return 'Gallery';
  }
  if (lowerSub.includes('review') || lowerSub.includes('rating')) {
    return 'Reviews';
  }
  if (lowerSub.includes('tax') || lowerSub.includes('settings') || lowerSub.includes('profile')) {
    return 'Settings';
  }
  if (lowerSub.includes('water')) {
    return 'Water';
  }
  if (lowerSub.includes('order') || lowerSub.includes('cart') || lowerSub.includes('pos')) {
    return 'Orders';
  }

  return 'General';
}

/**
 * Parses a raw git commit into a sanitized product-ready ChangelogEntry
 */
export function parseCommit(raw: RawCommit): ParsedCommit | null {
  if (!shouldIncludeCommit(raw)) {
    return null;
  }

  const subject = raw.subject || '';
  const body = raw.body || '';
  const meta = parseCommitBodyMetadata(body);

  // Check manual overrides by hash or group
  const override =
    COMMIT_OVERRIDES[raw.shortHash] ||
    COMMIT_OVERRIDES[raw.hash] ||
    (meta.group ? COMMIT_OVERRIDES[meta.group] : null);

  if (override?.hidden) {
    return null;
  }

  // Parse Conventional Commit pattern: feat(printer)!: ...
  const match = subject.match(/^([a-z]+)(?:\(([a-z0-9_-]+)\))?(!)?:\s*(.+)$/i);
  const rawType = match ? match[1].toLowerCase() : '';
  const rawScope = match && match[2] ? match[2].toLowerCase() : '';
  const isBreaking =
    Boolean(match && match[3]) || subject.includes('BREAKING CHANGE') || meta.breaking === 'true';

  // Determine category
  let category: ChangelogCategory = 'improved';
  if (override?.category) {
    category = override.category;
  } else if (meta.category && VALID_CATEGORIES.has(meta.category.toLowerCase())) {
    category = meta.category.toLowerCase() as ChangelogCategory;
  } else if (rawType && TYPE_TO_CATEGORY_MAP[rawType]) {
    category = TYPE_TO_CATEGORY_MAP[rawType];
  } else if (/^add|new|feature/i.test(subject)) {
    category = 'new';
  } else if (/^fix|resolve|prevent|patch/i.test(subject)) {
    category = 'fixed';
  }

  // Determine area
  let area: ChangelogArea = 'General';
  if (override?.area) {
    area = override.area;
  } else if (meta.area && Object.values(SCOPE_TO_AREA_MAP).includes(meta.area as any)) {
    area = meta.area as ChangelogArea;
  } else {
    area = inferAreaFromCommit(rawScope, subject);
  }

  // Determine Title & Description
  const title = override?.title || meta.title || humanizeTitle(subject);
  const description =
    override?.description ||
    meta.description ||
    generateFallbackDescription(title, category, area);

  const group = override?.group || meta.group || undefined;

  return {
    id: raw.shortHash || raw.hash,
    title,
    description,
    category,
    area,
    date: raw.date,
    commitHash: raw.hash,
    shortHash: raw.shortHash,
    isBreaking,
    group,
    rawType,
    rawScope,
  };
}

/**
 * Formats a Date object or ISO string to canonical "15 Aug 2026"
 */
export function formatReleaseDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const day = d.getDate();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoDate;
  }
}

/**
 * Groups parsed commits into cohesive releases by tag or date
 */
export function groupCommitsIntoReleases(parsedCommits: ParsedCommit[]): ChangelogRelease[] {
  if (!parsedCommits || parsedCommits.length === 0) {
    return [];
  }

  // 1. Group closely related commits on the same date into cohesive product updates
  const groupedMap = new Map<
    string,
    {
      primary: ParsedCommit;
      relatedCommits: { shortHash: string; title: string; scope?: string }[];
    }
  >();

  for (const commit of parsedCommits) {
    const dateStr = commit.date.slice(0, 10);
    const groupKey = commit.group
      ? `${dateStr}_${commit.group}`
      : `${dateStr}_${commit.title.toLowerCase().trim()}_${commit.area}`;

    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        primary: commit,
        relatedCommits: [
          {
            shortHash: commit.shortHash,
            title: commit.title,
            scope: commit.rawScope,
          },
        ],
      });
    } else {
      const existing = groupedMap.get(groupKey)!;
      existing.relatedCommits.push({
        shortHash: commit.shortHash,
        title: commit.title,
        scope: commit.rawScope,
      });

      // Keep the longer/more informative description
      if (commit.description && commit.description.length > existing.primary.description.length) {
        existing.primary.description = commit.description;
      }
      if (commit.isBreaking) {
        existing.primary.isBreaking = true;
      }
    }
  }

  // 2. Group into date / release buckets
  const releasesMap = new Map<
    string,
    { date: string; tag?: string; entries: ChangelogEntry[] }
  >();

  for (const { primary, relatedCommits } of groupedMap.values()) {
    const dateKey = primary.date.slice(0, 10); // YYYY-MM-DD

    if (!releasesMap.has(dateKey)) {
      releasesMap.set(dateKey, {
        date: primary.date,
        entries: [],
      });
    }

    const release = releasesMap.get(dateKey)!;
    release.entries.push({
      id: primary.id,
      title: primary.title,
      description: primary.description,
      category: primary.category,
      area: primary.area,
      date: formatReleaseDate(primary.date),
      commitHash: primary.commitHash,
      shortHash: primary.shortHash,
      isBreaking: primary.isBreaking,
      rawType: primary.rawType,
      rawScope: primary.rawScope,
      groupedCommits: relatedCommits.length > 1 ? relatedCommits : undefined,
    });
  }

  // 3. Sort releases descending by date
  const sortedDates = Array.from(releasesMap.keys()).sort((a, b) => b.localeCompare(a));

  const releases: ChangelogRelease[] = sortedDates.map((dateKey, index) => {
    const rel = releasesMap.get(dateKey)!;
    return {
      id: `rel-${dateKey}`,
      title: formatReleaseDate(rel.date),
      date: rel.date,
      isLatest: index === 0,
      entries: rel.entries,
    };
  });

  return releases;
}

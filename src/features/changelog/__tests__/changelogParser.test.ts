import { describe, it, expect } from 'vitest';
import {
  humanizeTitle,
  parseCommit,
  shouldIncludeCommit,
  parseCommitBodyMetadata,
  groupCommitsIntoReleases,
  type RawCommit,
} from '../changelogUtils';

describe('Changelog Parser & Humanization', () => {
  describe('humanizeTitle', () => {
    it('should strip conventional commit prefixes and convert to Title Case', () => {
      expect(humanizeTitle('feat(printer): add saved printer auto connect')).toBe(
        'Add Saved Printer Auto Connect'
      );
      expect(humanizeTitle('fix(orders): prevent duplicate order creation')).toBe(
        'Prevent Duplicate Order Creation'
      );
    });

    it('should preserve known acronyms such as POS, PWA, UI, GATT', () => {
      expect(humanizeTitle('feat(pos): upgrade pos offline mode for pwa')).toBe(
        'Upgrade POS Offline Mode for PWA'
      );
    });

    it('should strip raw icon identifiers and clean awkward conjunctions', () => {
      expect(humanizeTitle('fix(pos): distinct badges with Award01Icon for best seller')).toBe(
        'Distinct Badges for Best Seller'
      );
    });
  });

  describe('shouldIncludeCommit', () => {
    it('should include feat, fix, and perf commits', () => {
      expect(
        shouldIncludeCommit({
          hash: '1234567',
          shortHash: '1234567',
          date: '2026-08-17T00:00:00Z',
          subject: 'feat(printer): add persistent session',
        })
      ).toBe(true);

      expect(
        shouldIncludeCommit({
          hash: '1234568',
          shortHash: '1234568',
          date: '2026-08-17T00:00:00Z',
          subject: 'fix(orders): fix calculation bug',
        })
      ).toBe(true);
    });

    it('should exclude noise commits by default (chores, tests, ci, merge commits)', () => {
      expect(
        shouldIncludeCommit({
          hash: '1234569',
          shortHash: '1234569',
          date: '2026-08-17T00:00:00Z',
          subject: 'chore(deps): update vite',
        })
      ).toBe(false);

      expect(
        shouldIncludeCommit({
          hash: '1234570',
          shortHash: '1234570',
          date: '2026-08-17T00:00:00Z',
          subject: 'test: add unit test for cart',
        })
      ).toBe(false);

      expect(
        shouldIncludeCommit({
          hash: '1234571',
          shortHash: '1234571',
          date: '2026-08-17T00:00:00Z',
          subject: 'Merge branch "main"',
        })
      ).toBe(false);
    });

    it('should respect [skip-changelog] and [changelog] flags', () => {
      expect(
        shouldIncludeCommit({
          hash: '1234572',
          shortHash: '1234572',
          date: '2026-08-17T00:00:00Z',
          subject: 'feat(receipts): preview page [skip-changelog]',
        })
      ).toBe(false);

      expect(
        shouldIncludeCommit({
          hash: '1234573',
          shortHash: '1234573',
          date: '2026-08-17T00:00:00Z',
          subject: 'refactor(printer): extract reconnection service [changelog]',
        })
      ).toBe(true);
    });
  });

  describe('parseCommit with metadata', () => {
    it('should extract structured body metadata', () => {
      const raw: RawCommit = {
        hash: 'a1b2c3d4e5f6',
        shortHash: 'a1b2c3d',
        date: '2026-08-17T10:00:00Z',
        subject: 'feat(printer): improve connection lifecycle',
        body: 'changelog-title: Reliable Printer Auto-Connect\nchangelog-description: RadhaCafe now restores the preferred printer automatically.\nchangelog-category: improved\nchangelog-area: Printer',
      };

      const parsed = parseCommit(raw);
      expect(parsed).not.toBeNull();
      expect(parsed?.title).toBe('Reliable Printer Auto-Connect');
      expect(parsed?.description).toBe('RadhaCafe now restores the preferred printer automatically.');
      expect(parsed?.category).toBe('improved');
      expect(parsed?.area).toBe('Printer');
      expect(parsed?.shortHash).toBe('a1b2c3d');
    });
  });

  describe('groupCommitsIntoReleases', () => {
    it('should group commits by date and mark the top release as latest', () => {
      const commits = [
        {
          id: 'c1',
          title: 'Offline Order Support',
          description: 'Take orders without internet.',
          category: 'new' as const,
          area: 'Offline Mode' as const,
          date: '2026-08-17T12:00:00Z',
          commitHash: 'hash1',
          shortHash: 'c1',
          isBreaking: false,
        },
        {
          id: 'c2',
          title: 'Printer Auto-Connect',
          description: 'Auto reconnect printer.',
          category: 'improved' as const,
          area: 'Printer' as const,
          date: '2026-08-17T08:00:00Z',
          commitHash: 'hash2',
          shortHash: 'c2',
          isBreaking: false,
        },
        {
          id: 'c3',
          title: 'Receipt Template Editor',
          description: 'Live receipt preview.',
          category: 'new' as const,
          area: 'Receipts' as const,
          date: '2026-08-16T14:00:00Z',
          commitHash: 'hash3',
          shortHash: 'c3',
          isBreaking: false,
        },
      ];

      const releases = groupCommitsIntoReleases(commits);
      expect(releases).toHaveLength(2);
      expect(releases[0].isLatest).toBe(true);
      expect(releases[0].entries).toHaveLength(2);
      expect(releases[1].entries).toHaveLength(1);
    });

    it('should deduplicate multiple commits sharing the same group', () => {
      const commits = [
        {
          id: 'c1',
          title: 'Saved Bluetooth Printers',
          description: 'Basic store setup.',
          category: 'new' as const,
          area: 'Printer' as const,
          date: '2026-08-17T10:00:00Z',
          commitHash: 'h1',
          shortHash: 'c1',
          isBreaking: false,
          group: 'printer-management',
        },
        {
          id: 'c2',
          title: 'Saved Bluetooth Printers',
          description: 'RadhaCafe can remember verified receipt printers and auto-connect on sign in.',
          category: 'new' as const,
          area: 'Printer' as const,
          date: '2026-08-17T11:00:00Z',
          commitHash: 'h2',
          shortHash: 'c2',
          isBreaking: false,
          group: 'printer-management',
        },
      ];

      const releases = groupCommitsIntoReleases(commits);
      expect(releases).toHaveLength(1);
      expect(releases[0].entries).toHaveLength(1);
      expect(releases[0].entries[0].description).toContain('RadhaCafe can remember verified receipt printers');
    });
  });
});

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  parseCommit,
  groupCommitsIntoReleases,
  type RawCommit,
} from '../src/features/changelog/changelogUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'generated', 'changelog.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

/**
 * Executes git log safely and extracts commit records
 */
function fetchGitCommits(): RawCommit[] {
  try {
    // Record separator: 0x1e, Field separator: 0x1f
    // Format: %H (hash), %h (short), %ad (author date), %s (subject), %b (body)
    const cmd = 'git log --date=iso-strict --pretty=format:"%H%x1f%h%x1f%ad%x1f%s%x1f%b%x1e" -n 250';
    const output = execSync(cmd, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    if (!output || !output.trim()) {
      return [];
    }

    const records = output.split('\x1e');
    const rawCommits: RawCommit[] = [];

    for (const rec of records) {
      const trimmed = rec.trim();
      if (!trimmed) continue;

      const fields = trimmed.split('\x1f');
      const hash = fields[0]?.trim() || '';
      const shortHash = fields[1]?.trim() || '';
      const date = fields[2]?.trim() || new Date().toISOString();
      const subject = fields[3]?.trim() || '';
      const body = fields[4]?.trim() || '';

      if (hash && subject) {
        rawCommits.push({
          hash,
          shortHash,
          date,
          subject,
          body,
        });
      }
    }

    return rawCommits;
  } catch (err: any) {
    console.warn('[Changelog] Git history not accessible:', err?.message || 'Git command failed');
    return [];
  }
}

/**
 * Main generator execution
 */
function generateChangelog() {
  console.log('[Changelog] Generating release history from Git commits...');

  const rawCommits = fetchGitCommits();

  // If Git is unavailable (e.g. shallow clone on Vercel), preserve existing artifact if present
  if (rawCommits.length === 0) {
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('[Changelog] Git unavailable. Preserving existing changelog artifact.');
      return;
    }

    console.warn('[Changelog] No Git history found. Generating fallback initial release.');
    const fallbackData = {
      generatedAt: new Date().toISOString(),
      totalEntries: 1,
      releases: [
        {
          id: 'rel-initial',
          title: 'RadhaCafe Initial Release',
          date: new Date().toISOString(),
          isLatest: true,
          entries: [
            {
              id: 'init-1',
              title: 'RadhaCafe Professional POS Release',
              description: 'Initial release of the RadhaCafe Admin and POS platform.',
              category: 'new' as const,
              area: 'General' as const,
              date: new Date().toISOString(),
            },
          ],
        },
      ],
    };

    ensureDirectoryExistence(OUTPUT_FILE);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fallbackData, null, 2), 'utf-8');
    return;
  }

  // Parse commits
  const parsedCommits = rawCommits
    .map((c) => parseCommit(c))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Group into releases
  const releases = groupCommitsIntoReleases(parsedCommits);

  const totalEntries = releases.reduce((sum, r) => sum + r.entries.length, 0);

  const changelogData = {
    generatedAt: new Date().toISOString(),
    latestCommit: rawCommits[0]?.shortHash,
    totalEntries,
    releases,
  };

  ensureDirectoryExistence(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(changelogData, null, 2), 'utf-8');

  console.log(`[Changelog] Successfully generated ${totalEntries} updates across ${releases.length} releases.`);
}

generateChangelog();

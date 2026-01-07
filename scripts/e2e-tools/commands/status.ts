/**
 * Status Command
 *
 * Provides quick status checks for E2E test results.
 * Supports multiple verbosity levels for token optimization.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AnalysisResult, BinaryStatusCode, DisclosureLevel } from '../types';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const RESULTS_FILE = path.join(CACHE_DIR, 'last-run.json');

/**
 * Semantic codes for compact output
 */
const STATUS_CODES = {
  P: 'PASS',
  F: 'FAIL',
  X: 'FIXABLE',
  B: 'BLOCKED',
} as const;

const CATEGORY_CODES: Record<string, string> = {
  browser_compat: 'BC',
  element_not_found: 'NF',
  timeout: 'TO',
  assertion: 'AE',
  network: 'NE',
  server_error: 'SE',
  unknown: 'UK',
};

const FIX_CODES: Record<string, string> = {
  lazy_init: 'LI',
  dynamic_import: 'DI',
  browser_guard: 'BG',
  trpc_migration: 'TM',
  timeout_increase: 'TI',
  manual: 'MF',
};

/**
 * Get binary status code (Phase 7 optimization)
 * 0 = PASS, 1 = FAIL, 2 = FIXABLE, 3 = BLOCKED
 */
export function getBinaryStatus(): BinaryStatusCode {
  if (!fs.existsSync(RESULTS_FILE)) {
    return 3; // BLOCKED - no results
  }

  try {
    const analysis: AnalysisResult = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

    if (analysis.summary.failed === 0) {
      return 0; // PASS
    }

    // Check if any failures have auto-fixes available
    const hasFixable = Object.values(analysis.categories).some(cat => cat.fixAvailable);

    if (hasFixable) {
      return 2; // FIXABLE
    }

    return 1; // FAIL
  } catch {
    return 3; // BLOCKED - parse error
  }
}

/**
 * Get quick status (Level 0-1)
 */
export function getQuickStatus(): string {
  const code = getBinaryStatus();

  if (code === 3) {
    return 'B:NO_DATA';
  }

  if (code === 0) {
    return 'P';
  }

  const analysis: AnalysisResult = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  const { summary } = analysis;

  // Build category codes
  const cats = Object.entries(analysis.categories)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([cat, info]) => {
      const catCode = CATEGORY_CODES[cat] || 'UK';
      return `${catCode}:${info.count}`;
    })
    .join('|');

  const statusChar = code === 2 ? 'X' : 'F';
  return `${statusChar}:${summary.failed}/${summary.total}|${cats}`;
}

/**
 * Get status with recommended action (Level 2)
 */
export function getStatusWithAction(): string {
  const quickStatus = getQuickStatus();

  if (quickStatus.startsWith('P') || quickStatus.startsWith('B')) {
    return quickStatus;
  }

  const analysis: AnalysisResult = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

  // Determine recommended action
  const browserCompat = analysis.categories['browser_compat'];
  if (browserCompat?.fixAvailable) {
    return `${quickStatus}|AF:LI`;
  }

  const timeout = analysis.categories['timeout'];
  if (timeout?.count > 0) {
    return `${quickStatus}|AF:TI`;
  }

  return `${quickStatus}|MF`;
}

/**
 * Get full human-readable status (Level 3-4)
 */
export function getFullStatus(): string {
  if (!fs.existsSync(RESULTS_FILE)) {
    return 'NO_RESULTS: Run npm run e2e:run first';
  }

  try {
    const analysis: AnalysisResult = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

    // Validate the analysis has required data
    if (!analysis.summary) {
      return 'NO_RESULTS: Run npm run e2e:run first';
    }

    const lines: string[] = [
      `E2E Status @ ${analysis.timestamp || 'unknown'}`,
      `${'─'.repeat(40)}`,
      `Total: ${analysis.summary.total} | Pass: ${analysis.summary.passed} | Fail: ${analysis.summary.failed} | Skip: ${analysis.summary.skipped}`,
      `Duration: ${analysis.summary.duration}`,
    ];

    if (analysis.summary.failed > 0) {
      lines.push('');
      lines.push('Failures by Category:');
      for (const [cat, info] of Object.entries(analysis.categories || {})) {
        const fixMarker = info.fixAvailable ? ' [AUTO-FIX]' : '';
        lines.push(`  ${cat}: ${info.count} (${info.percentage}%)${fixMarker}`);
      }

      if (analysis.nextSteps && analysis.nextSteps.length > 0) {
        lines.push('');
        lines.push('Next Steps:');
        for (const step of analysis.nextSteps.slice(0, 3)) {
          lines.push(`  → ${step}`);
        }
      }
    } else {
      lines.push('');
      lines.push('✓ All tests passing!');
    }

    return lines.join('\n');
  } catch {
    return 'NO_RESULTS: Run npm run e2e:run first';
  }
}

/**
 * Get status at specified disclosure level
 */
export function getStatusAtLevel(level: DisclosureLevel): string {
  switch (level) {
    case 0:
      return String(getBinaryStatus());
    case 1:
      return getQuickStatus();
    case 2:
      return getStatusWithAction();
    case 3:
    case 4:
    default:
      return getFullStatus();
  }
}

/**
 * Get pre-computed next action (Phase 7 optimization)
 */
export function getNextAction(): { bash: string; expect: string } | null {
  const code = getBinaryStatus();

  switch (code) {
    case 0: // PASS
      return null;
    case 2: // FIXABLE
      return {
        bash: 'npm run e2e:fix -- --apply',
        expect: 'fewer_failures',
      };
    case 1: // FAIL
      return {
        bash: 'npm run e2e:analyze',
        expect: 'analysis_complete',
      };
    case 3: // BLOCKED
      return {
        bash: 'npm run e2e:run',
        expect: 'tests_complete',
      };
    default:
      return null;
  }
}

// CLI entry point - handled by main cli.ts

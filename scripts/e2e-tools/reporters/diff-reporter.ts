/**
 * Differential Reporter for E2E Tools
 *
 * Outputs only what changed since the last run to minimize token usage.
 * If nothing changed, returns a minimal "unchanged" indicator.
 *
 * Part of Phase 7: Token Optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { TestSummary, EnhancedAnalysisResult, TestResult } from '../types/index.js';
import { getStatusCode, getCategoryCode, getActionCode, type StatusCode, type ActionCode } from '../compression/semantic-codes.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Diff report structure
 */
export interface DiffReport {
  unchanged: boolean;
  hash?: string;
  previousHash?: string;

  // Only populated if changed
  statusChange?: {
    from: StatusCode;
    to: StatusCode;
  };
  newFailures?: string[];
  fixedTests?: string[];
  changedCategories?: {
    category: string;
    delta: number;
  }[];

  // Summary changes
  passRateDelta?: number;
  failedDelta?: number;

  // Compact action directive
  action?: ActionCode;
  command?: string;
}

/**
 * Snapshot for comparison
 */
interface ReportSnapshot {
  hash: string;
  timestamp: string;
  status: StatusCode;
  summary: TestSummary | null;
  failedTests: string[];
  categories: Record<string, number>;
  fixableCount: number;
}

/**
 * Differential Reporter class
 */
export class DiffReporter {
  private snapshotPath: string;

  constructor() {
    this.snapshotPath = path.join(process.cwd(), CACHE_DIR, 'last-snapshot.json');
  }

  /**
   * Generate diff report comparing current to previous
   */
  generate(
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[] = []
  ): DiffReport {
    const current = this.createSnapshot(summary, analysis, tests);
    const previous = this.loadPreviousSnapshot();

    // Save current as new snapshot
    this.saveSnapshot(current);

    // If no previous snapshot, return full change
    if (!previous) {
      return this.createFirstRunReport(current);
    }

    // Check if unchanged
    if (current.hash === previous.hash) {
      return { unchanged: true, hash: current.hash };
    }

    // Generate diff
    return this.computeDiff(previous, current);
  }

  /**
   * Create snapshot from current state
   */
  private createSnapshot(
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[]
  ): ReportSnapshot {
    const fixableCount = analysis?.aggregatedCategories?.fixableErrors || 0;
    const status = getStatusCode(summary, fixableCount > 0);

    // Extract failed test names
    const failedTests = tests
      .filter((t) => t.status === 'failed')
      .map((t) => t.name);

    // Extract category counts
    const categories: Record<string, number> = {};
    if (analysis?.aggregatedCategories?.categories) {
      for (const cat of analysis.aggregatedCategories.categories) {
        categories[cat.category] = cat.count;
      }
    }

    // Create deterministic hash
    const hashData = JSON.stringify({
      status,
      summary,
      failedTests: failedTests.sort(),
      categories,
      fixableCount,
    });
    const hash = crypto.createHash('md5').update(hashData).digest('hex').slice(0, 8);

    return {
      hash,
      timestamp: new Date().toISOString(),
      status,
      summary,
      failedTests,
      categories,
      fixableCount,
    };
  }

  /**
   * Load previous snapshot from cache
   */
  private loadPreviousSnapshot(): ReportSnapshot | null {
    if (!fs.existsSync(this.snapshotPath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.snapshotPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Save snapshot to cache
   */
  private saveSnapshot(snapshot: ReportSnapshot): void {
    const dir = path.dirname(this.snapshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.snapshotPath, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Create report for first run (no previous snapshot)
   */
  private createFirstRunReport(current: ReportSnapshot): DiffReport {
    const action = getActionCode(current.status);

    return {
      unchanged: false,
      hash: current.hash,
      statusChange: {
        from: 'P' as StatusCode, // Assume was passing before
        to: current.status,
      },
      newFailures: current.failedTests,
      failedDelta: current.summary?.failed || 0,
      action,
      command: this.getCommandForAction(action),
    };
  }

  /**
   * Compute diff between two snapshots
   */
  private computeDiff(previous: ReportSnapshot, current: ReportSnapshot): DiffReport {
    const report: DiffReport = {
      unchanged: false,
      hash: current.hash,
      previousHash: previous.hash,
    };

    // Status change
    if (previous.status !== current.status) {
      report.statusChange = {
        from: previous.status,
        to: current.status,
      };
    }

    // New failures (tests that weren't failing before)
    const prevFailedSet = new Set(previous.failedTests);
    const currFailedSet = new Set(current.failedTests);

    const newFailures = current.failedTests.filter((t) => !prevFailedSet.has(t));
    const fixedTests = previous.failedTests.filter((t) => !currFailedSet.has(t));

    if (newFailures.length > 0) {
      report.newFailures = newFailures;
    }

    if (fixedTests.length > 0) {
      report.fixedTests = fixedTests;
    }

    // Category changes
    const changedCategories: { category: string; delta: number }[] = [];
    const allCategories = new Set([
      ...Object.keys(previous.categories),
      ...Object.keys(current.categories),
    ]);

    for (const cat of allCategories) {
      const prevCount = previous.categories[cat] || 0;
      const currCount = current.categories[cat] || 0;
      const delta = currCount - prevCount;

      if (delta !== 0) {
        changedCategories.push({ category: cat, delta });
      }
    }

    if (changedCategories.length > 0) {
      report.changedCategories = changedCategories;
    }

    // Pass rate delta
    if (previous.summary && current.summary) {
      const prevRate = (previous.summary.passed / previous.summary.total) * 100;
      const currRate = (current.summary.passed / current.summary.total) * 100;
      const delta = currRate - prevRate;

      if (Math.abs(delta) > 0.1) {
        report.passRateDelta = Math.round(delta * 10) / 10;
      }
    }

    // Failed count delta
    const prevFailed = previous.summary?.failed || 0;
    const currFailed = current.summary?.failed || 0;
    if (prevFailed !== currFailed) {
      report.failedDelta = currFailed - prevFailed;
    }

    // Determine action
    const action = getActionCode(current.status, false);
    report.action = action;
    report.command = this.getCommandForAction(action);

    return report;
  }

  /**
   * Get command for action code
   */
  private getCommandForAction(action: ActionCode): string {
    const commands: Record<ActionCode, string> = {
      AF: 'npm run e2e:fix -- --apply',
      RA: 'npm run e2e:analyze',
      RT: 'npm run e2e:run',
      DA: 'npm run e2e:ai -- --deep',
      MF: 'npm run e2e:analyze -vv',
      CI: 'docker compose ps',
    };
    return commands[action];
  }

  /**
   * Format diff report as compact string
   */
  formatCompact(report: DiffReport): string {
    if (report.unchanged) {
      return 'UNCHANGED';
    }

    const parts: string[] = [];

    // Status change
    if (report.statusChange) {
      parts.push(`${report.statusChange.from}→${report.statusChange.to}`);
    }

    // New failures
    if (report.newFailures && report.newFailures.length > 0) {
      parts.push(`+${report.newFailures.length}F`);
    }

    // Fixed tests
    if (report.fixedTests && report.fixedTests.length > 0) {
      parts.push(`-${report.fixedTests.length}F`);
    }

    // Category changes
    if (report.changedCategories) {
      for (const cat of report.changedCategories) {
        const code = getCategoryCode(cat.category);
        const sign = cat.delta > 0 ? '+' : '';
        parts.push(`${code}:${sign}${cat.delta}`);
      }
    }

    // Action
    if (report.action) {
      parts.push(`|${report.action}`);
    }

    return parts.join('|') || 'NO_CHANGE';
  }

  /**
   * Format diff report as JSON (minimal)
   */
  formatJSON(report: DiffReport): string {
    if (report.unchanged) {
      return '{"unchanged":true}';
    }

    // Create minimal JSON with only changed fields
    const minimal: Record<string, unknown> = {};

    if (report.statusChange) {
      minimal.status = `${report.statusChange.from}→${report.statusChange.to}`;
    }

    if (report.newFailures && report.newFailures.length > 0) {
      minimal.newFailures = report.newFailures.length > 5
        ? report.newFailures.slice(0, 5).concat([`+${report.newFailures.length - 5} more`])
        : report.newFailures;
    }

    if (report.fixedTests && report.fixedTests.length > 0) {
      minimal.fixed = report.fixedTests.length;
    }

    if (report.failedDelta) {
      minimal.failedDelta = report.failedDelta;
    }

    if (report.action) {
      minimal.action = report.action;
      minimal.cmd = report.command;
    }

    return JSON.stringify(minimal);
  }

  /**
   * Get diff summary for AI agents (ultra-compact)
   */
  getDiffSummary(report: DiffReport): string {
    if (report.unchanged) {
      return 'U'; // Unchanged
    }

    // Build ultra-compact summary
    const parts: string[] = [];

    if (report.statusChange) {
      parts.push(`S:${report.statusChange.from}→${report.statusChange.to}`);
    }

    if (report.failedDelta) {
      const sign = report.failedDelta > 0 ? '+' : '';
      parts.push(`D:${sign}${report.failedDelta}`);
    }

    if (report.action) {
      parts.push(report.action);
    }

    return parts.join('|');
  }
}

/**
 * Singleton instance
 */
let diffReporterInstance: DiffReporter | null = null;

export function getDiffReporter(): DiffReporter {
  if (!diffReporterInstance) {
    diffReporterInstance = new DiffReporter();
  }
  return diffReporterInstance;
}

export const diffReporter = new DiffReporter();

/**
 * Convenience function to generate diff report
 */
export function generateDiffReport(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null,
  tests: TestResult[] = []
): DiffReport {
  return diffReporter.generate(summary, analysis, tests);
}

/**
 * Get compact diff string
 */
export function getCompactDiff(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null,
  tests: TestResult[] = []
): string {
  const report = generateDiffReport(summary, analysis, tests);
  return diffReporter.formatCompact(report);
}

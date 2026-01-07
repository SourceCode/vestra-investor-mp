/**
 * Quick Commands for E2E Tools
 *
 * Ultra-minimal commands optimized for AI agent token efficiency.
 * Each command is designed for single-purpose, low-token output.
 *
 * Part of Phase 5: AI Agent Commands
 */

import * as fs from 'fs';
import * as path from 'path';
import type { BinaryStatusCode, AISummary, EnhancedAnalysisResult } from '../types/index.js';
import { getBinaryStatus, getQuickStatus, getStatusWithAction, getNextAction } from './status.js';
import { getCachedAISummary, getAIDecision } from './ai.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Status codes for quick reference
 */
export const STATUS_CODES = {
  PASS: 0,
  FAIL: 1,
  FIXABLE: 2,
  BLOCKED: 3,
} as const;

/**
 * Quick code command - returns just the status code
 *
 * Usage: npm run e2e:code
 * Output: 0 | 1 | 2 | 3
 *
 * Decision tree:
 * - 0 (PASS): All tests passing, proceed with workflow
 * - 1 (FAIL): Tests failing, needs investigation
 * - 2 (FIXABLE): Tests failing but auto-fixable
 * - 3 (BLOCKED): No data or infrastructure issue
 */
export function quickCode(): BinaryStatusCode {
  return getBinaryStatus();
}

/**
 * Quick status command - returns compact status string
 *
 * Usage: npm run e2e:q
 * Output: P | F:5/20|BC:3|TO:2 | X:5/20|BC:3@AF
 */
export function quickStatus(): string {
  return getQuickStatus();
}

/**
 * Quick action command - returns recommended action
 *
 * Usage: npm run e2e:next
 * Output: { bash: "npm run ...", expect: "..." } | null
 */
export function quickNext(): { bash: string; expect: string } | null {
  return getNextAction();
}

/**
 * Quick summary - returns one-line summary
 *
 * Usage: npm run e2e:1
 * Output: FIXABLE: 5 failed (3 fixable) | Browser compat errors | Run: npm run e2e:fix -- --apply
 */
export function quickOneLiner(): string {
  const summary = getCachedAISummary();
  if (!summary) {
    return 'BLOCKED: No data | Run: npm run e2e:run';
  }

  const primaryIssue = summary.primary_issue?.slice(0, 50) || 'No issues';
  const nextCmd = summary.next_commands[0] || 'none';

  return `${summary.status}: ${summary.metrics.failed} failed (${summary.metrics.fixable} fixable) | ${primaryIssue} | Run: ${nextCmd}`;
}

/**
 * Quick decision - returns decision object
 *
 * Usage: npm run e2e:decide
 * Output: { code: 2, action: "FIX", command: "npm run e2e:fix -- --apply", reason: "..." }
 */
export function quickDecision(): {
  code: number;
  action: string;
  command: string | null;
  reason: string;
} {
  return getAIDecision();
}

/**
 * Quick metrics - returns just the metrics
 *
 * Output: T:20|P:15|F:5|X:3|U:2
 * T=total, P=passed, F=failed, X=fixable, U=unique
 */
export function quickMetrics(): string {
  const summary = getCachedAISummary();
  if (!summary) {
    return 'T:0|P:0|F:0|X:0|U:0';
  }

  const m = summary.metrics;
  return `T:${m.total}|P:${m.passed}|F:${m.failed}|X:${m.fixable}|U:${m.unique}`;
}

/**
 * Quick files - returns focus files list
 *
 * Output: src/file1.ts,src/file2.ts,src/file3.ts
 */
export function quickFiles(): string {
  const summary = getCachedAISummary();
  if (!summary || summary.focus_files.length === 0) {
    return '';
  }

  return summary.focus_files.slice(0, 5).join(',');
}

/**
 * Quick causes - returns root causes list
 *
 * Output: cause1|cause2|cause3
 */
export function quickCauses(): string {
  const summary = getCachedAISummary();
  if (!summary || summary.root_causes.length === 0) {
    return '';
  }

  return summary.root_causes
    .slice(0, 3)
    .map(c => c.slice(0, 60))
    .join('|');
}

/**
 * Quick commands - returns next commands
 *
 * Output: npm run e2e:fix -- --apply;npm run e2e:run
 */
export function quickCommands(): string {
  const summary = getCachedAISummary();
  if (!summary || summary.next_commands.length === 0) {
    return 'npm run e2e:run';
  }

  return summary.next_commands.slice(0, 3).join(';');
}

/**
 * Quick check - all-in-one check returning structured data
 *
 * This is the recommended command for AI agents to use
 * when they need comprehensive but compact information.
 */
export interface QuickCheckResult {
  code: BinaryStatusCode;
  status: 'PASS' | 'FAIL' | 'FIXABLE' | 'BLOCKED';
  metrics: string;
  action: string | null;
  command: string | null;
}

export function quickCheck(): QuickCheckResult {
  const code = getBinaryStatus();
  const statusMap = ['PASS', 'FAIL', 'FIXABLE', 'BLOCKED'] as const;

  const result: QuickCheckResult = {
    code,
    status: statusMap[code],
    metrics: quickMetrics(),
    action: null,
    command: null,
  };

  const decision = getAIDecision();
  result.action = decision.action;
  result.command = decision.command;

  return result;
}

/**
 * Format quick check for output
 */
export function formatQuickCheck(result: QuickCheckResult): string {
  let output = `${result.code}|${result.status}|${result.metrics}`;

  if (result.action && result.action !== 'DONE') {
    output += `|${result.action}`;
  }

  if (result.command) {
    output += `|${result.command}`;
  }

  return output;
}

/**
 * Print quick check to console
 */
export function printQuickCheck(): void {
  const result = quickCheck();
  console.log(formatQuickCheck(result));
}

/**
 * All quick commands in one object for easy access
 */
export const quick = {
  code: quickCode,
  status: quickStatus,
  next: quickNext,
  oneliner: quickOneLiner,
  decision: quickDecision,
  metrics: quickMetrics,
  files: quickFiles,
  causes: quickCauses,
  commands: quickCommands,
  check: quickCheck,
  print: printQuickCheck,
};

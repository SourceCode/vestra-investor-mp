/**
 * AI Command for E2E Tools
 *
 * Unified command for AI agents that provides a single entry point
 * for running tests and getting AI-optimized output.
 *
 * Part of Phase 5: AI Agent Commands
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  AICommandOptions,
  AISummary,
  EnhancedAnalysisResult,
  DeepAnalysisResult,
  RootCauseAnalysis,
} from '../types/index.js';
import { runTests, type RunOptions } from './run.js';
import { runEnhancedAnalysis } from './analyze.js';
import { runDeepAnalysis } from './deep-analyze.js';
import { getAISummaryReporter } from '../reporters/ai-summary.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const AI_SUMMARY_FILE = path.join(CACHE_DIR, 'ai-summary.json');

/**
 * Run the unified AI command
 *
 * This is the primary entry point for AI agents working with E2E tests.
 * It handles the full pipeline: run → analyze → summarize
 */
export async function runAICommand(
  options: AICommandOptions = {},
  runOptions: RunOptions = {}
): Promise<AISummary | null> {
  const { format = 'cli', deep = false, skipRun = false, filter } = options;
  const reporter = getAISummaryReporter();

  // Step 1: Run tests (unless skipped)
  if (!skipRun) {
    if (format === 'cli') {
      console.log('Running E2E tests...\n');
    }

    // Set quiet mode for non-CLI formats
    const quietRun: RunOptions = {
      ...runOptions,
      verbose: format === 'cli',
    };

    // Apply filter if provided
    if (filter) {
      quietRun.grep = filter;
    }

    await runTests(quietRun);
  }

  // Step 2: Run analysis
  let analysis: EnhancedAnalysisResult | null = null;
  let deepAnalysisData: RootCauseAnalysis[] | undefined;

  if (deep) {
    // Deep analysis includes pattern matching
    if (format === 'cli') {
      console.log('\n');
    }
    const deepResult = runDeepAnalysis();
    if (deepResult) {
      analysis = deepResult;
      deepAnalysisData = deepResult.rootCauseAnalyses;
    }
  } else {
    // Standard enhanced analysis
    if (format === 'cli') {
      // Suppress internal output for cleaner AI format
      const originalLog = console.log;
      console.log = () => {};
      analysis = runEnhancedAnalysis();
      console.log = originalLog;
    } else {
      // Suppress all console output for non-CLI formats
      const originalLog = console.log;
      const originalError = console.error;
      console.log = () => {};
      console.error = () => {};
      analysis = runEnhancedAnalysis();
      console.log = originalLog;
      console.error = originalError;
    }
  }

  if (!analysis) {
    if (format === 'cli') {
      console.error('No analysis data available. Run tests first.');
    }
    return null;
  }

  // Step 3: Generate AI summary
  const summary = reporter.generate(analysis, deepAnalysisData);

  // Save summary to cache
  ensureCacheDir();
  fs.writeFileSync(AI_SUMMARY_FILE, JSON.stringify(summary, null, 2));

  // Step 4: Output in requested format
  switch (format) {
    case 'cli':
      console.log('\n' + '='.repeat(50));
      console.log('AI SUMMARY');
      console.log('='.repeat(50) + '\n');
      console.log(reporter.formatForCLI(summary));
      break;

    case 'json':
      console.log(reporter.formatAsJSON(summary));
      break;

    case 'oneline':
      console.log(reporter.formatOneLiner(summary));
      break;
  }

  return summary;
}

/**
 * Get cached AI summary without running tests
 */
export function getCachedAISummary(): AISummary | null {
  if (!fs.existsSync(AI_SUMMARY_FILE)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(AI_SUMMARY_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Get AI summary status code
 *
 * Returns:
 * - 0: All tests passed (PASS)
 * - 1: Tests failed (FAIL)
 * - 2: Tests failed but fixable (FIXABLE)
 * - 3: No data available (BLOCKED)
 */
export function getAIStatusCode(): number {
  const summary = getCachedAISummary();

  if (!summary) {
    return 3; // BLOCKED - no data
  }

  switch (summary.status) {
    case 'PASS':
      return 0;
    case 'FIXABLE':
      return 2;
    case 'FAIL':
    default:
      return 1;
  }
}

/**
 * Format AI summary for specific output target
 */
export function formatAISummary(
  summary: AISummary,
  format: 'cli' | 'json' | 'oneline' = 'cli'
): string {
  const reporter = getAISummaryReporter();

  switch (format) {
    case 'json':
      return reporter.formatAsJSON(summary);
    case 'oneline':
      return reporter.formatOneLiner(summary);
    case 'cli':
    default:
      return reporter.formatForCLI(summary);
  }
}

/**
 * Generate decision tree for AI agent
 *
 * Returns a structured decision based on current test status
 */
export function getAIDecision(): {
  code: number;
  action: string;
  command: string | null;
  reason: string;
} {
  const summary = getCachedAISummary();

  if (!summary) {
    return {
      code: 3,
      action: 'RUN',
      command: 'npm run e2e:ai',
      reason: 'No test data available. Run tests first.',
    };
  }

  if (summary.status === 'PASS') {
    return {
      code: 0,
      action: 'DONE',
      command: null,
      reason: 'All tests passing. Ready to proceed.',
    };
  }

  if (summary.status === 'FIXABLE') {
    return {
      code: 2,
      action: 'FIX',
      command: summary.next_commands[0] || 'npm run e2e:fix -- --apply',
      reason: `${summary.metrics.fixable} fixable errors detected.`,
    };
  }

  // FAIL status
  return {
    code: 1,
    action: 'INVESTIGATE',
    command: 'npm run e2e:ai -- --deep',
    reason: summary.primary_issue || 'Manual investigation required.',
  };
}

/**
 * Print AI decision to console
 */
export function printAIDecision(): void {
  const decision = getAIDecision();

  console.log(`[${decision.code}] ${decision.action}: ${decision.reason}`);
  if (decision.command) {
    console.log(`  $ ${decision.command}`);
  }
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

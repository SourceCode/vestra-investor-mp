/**
 * Test Runner Wrapper
 *
 * Wraps Playwright test execution and generates structured analysis
 * for AI agent consumption.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  parsePlaywrightOutput,
  extractErrorDetails,
  findErrorContextFiles,
  parseErrorContextFile,
  deduplicateErrors,
} from '../analyzers/error-parser';
import type { TestResult, AnalysisResult, TestSummary, CategorySummary } from '../types';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const RESULTS_FILE = path.join(CACHE_DIR, 'last-run.json');

/**
 * Options for test execution
 */
export interface RunOptions {
  spec?: string;
  project?: string;
  headed?: boolean;
  workers?: number;
  retries?: number;
  timeout?: number;
  grep?: string;
  verbose?: boolean;
}

/**
 * Run E2E tests and generate analysis
 */
export async function runTests(options: RunOptions = {}): Promise<AnalysisResult> {
  const startTime = Date.now();

  // Build Playwright command
  const args = ['playwright', 'test'];

  if (options.spec) {
    args.push(options.spec);
  }
  if (options.project) {
    args.push('--project', options.project);
  }
  if (options.headed) {
    args.push('--headed');
  }
  if (options.workers !== undefined) {
    args.push('--workers', String(options.workers));
  }
  if (options.retries !== undefined) {
    args.push('--retries', String(options.retries));
  }
  if (options.timeout !== undefined) {
    args.push('--timeout', String(options.timeout));
  }
  if (options.grep) {
    args.push('--grep', options.grep);
  }

  args.push('--reporter=list');

  if (options.verbose) {
    console.log(`Running: npx ${args.join(' ')}`);
  }

  // Run Playwright
  const output = await runCommand('npx', args, options.verbose);

  // Parse results
  let results = parsePlaywrightOutput(output);

  // If parsing failed, create a single failed result with the raw output
  if (results.length === 0 && output.includes('Error')) {
    results = [{
      name: 'Test execution',
      file: 'unknown',
      line: 0,
      status: 'failed',
      duration: Date.now() - startTime,
      project: 'unknown',
      error: extractErrorDetails(output),
    }];
  }

  // Enhance failed tests with error context
  const contextFiles = findErrorContextFiles('test-results');
  for (const result of results) {
    if (result.status === 'failed') {
      // Try to find matching context file
      const testSlug = result.name.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
      for (const [dirName, contextPath] of contextFiles) {
        if (dirName.includes(testSlug) || testSlug.includes(dirName.slice(0, 20))) {
          const context = parseErrorContextFile(contextPath);
          result.error = {
            ...result.error,
            ...context,
            message: result.error?.message || 'Test failed',
            category: result.error?.category || 'unknown',
          };
          break;
        }
      }

      // If no error yet, extract from output
      if (!result.error) {
        result.error = extractErrorDetails(output);
      }
    }
  }

  // Generate summary
  const duration = Date.now() - startTime;
  const summary: TestSummary = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    duration: formatDuration(duration),
    projects: [...new Set(results.map(r => r.project))],
  };

  // Categorize errors
  const categories: CategorySummary = {};
  for (const result of results) {
    if (result.error) {
      const cat = result.error.category;
      if (!categories[cat]) {
        categories[cat] = {
          count: 0,
          percentage: 0,
          fixAvailable: false,
          examples: [],
        };
      }
      categories[cat].count++;
      if (categories[cat].examples.length < 3) {
        categories[cat].examples.push(result.name);
      }
    }
  }

  // Calculate percentages and fix availability
  for (const [cat, info] of Object.entries(categories)) {
    info.percentage = summary.failed > 0
      ? Math.round((info.count / summary.failed) * 100)
      : 0;
    info.fixAvailable = ['browser_compat', 'timeout'].includes(cat);
  }

  const analysis: AnalysisResult = {
    timestamp: new Date().toISOString(),
    summary,
    results,
    categories,
    rootCauses: [],
    suggestedFixes: [],
    nextSteps: generateNextSteps(summary, categories),
  };

  // Save to cache
  ensureCacheDir();
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(analysis, null, 2));

  // Also save to history
  const historyFile = path.join(CACHE_DIR, 'history', `${Date.now()}.json`);
  fs.writeFileSync(historyFile, JSON.stringify(analysis, null, 2));

  return analysis;
}

/**
 * Run a command and capture output
 */
function runCommand(cmd: string, args: string[], verbose = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      env: {
        ...process.env,
        CI: '',
        HEADED: 'false',
        FORCE_COLOR: '1',
      },
      shell: true,
      cwd: process.cwd(),
    });

    let output = '';

    proc.stdout.on('data', (data: Buffer) => {
      const str = data.toString();
      output += str;
      if (verbose) {
        process.stdout.write(str);
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      const str = data.toString();
      output += str;
      if (verbose) {
        process.stderr.write(str);
      }
    });

    proc.on('close', () => {
      resolve(output);
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const historyDir = path.join(CACHE_DIR, 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
}

/**
 * Format milliseconds to human-readable duration
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Generate next steps based on analysis
 */
function generateNextSteps(
  summary: TestSummary,
  categories: CategorySummary
): string[] {
  const steps: string[] = [];

  if (summary.failed === 0) {
    steps.push('All tests passed! Ready to commit.');
    return steps;
  }

  // Prioritize browser_compat fixes (most common issue)
  if (categories['browser_compat']?.count > 0) {
    steps.push('Run: npm run e2e:fix --pattern=browser-compat');
  }

  if (categories['server_error']?.count > 0) {
    steps.push('Check server logs for 500 errors');
  }

  if (categories['element_not_found']?.count > 0) {
    steps.push('Review DOM snapshots in test-results/*/error-context.md');
  }

  if (categories['timeout']?.count > 0) {
    steps.push('Consider increasing timeouts or checking for slow operations');
  }

  steps.push('Run: npm run e2e:analyze for detailed breakdown');

  return steps;
}

/**
 * Print analysis summary to console
 */
export function printSummary(analysis: AnalysisResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('E2E TEST SUMMARY (AI-Optimized)');
  console.log('='.repeat(60));
  console.log(`Total: ${analysis.summary.total} | Passed: ${analysis.summary.passed} | Failed: ${analysis.summary.failed}`);
  console.log(`Duration: ${analysis.summary.duration}`);

  if (Object.keys(analysis.categories).length > 0) {
    console.log('\nCategories:');
    for (const [cat, info] of Object.entries(analysis.categories)) {
      const fixMarker = info.fixAvailable ? ' [AUTO-FIX]' : '';
      console.log(`  ${cat}: ${info.count} (${info.percentage}%)${fixMarker}`);
    }
  }

  if (analysis.nextSteps.length > 0) {
    console.log('\nNext Steps:');
    for (const step of analysis.nextSteps) {
      console.log(`  - ${step}`);
    }
  }

  console.log('\nFull analysis saved to: .e2e-cache/last-run.json');
}

// CLI entry point - only runs when this file is executed directly
// This check is handled by the main cli.ts entry point

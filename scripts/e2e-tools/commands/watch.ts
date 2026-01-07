/**
 * Watch Mode Command for E2E Tools
 *
 * Watches for file changes and automatically re-runs tests
 * with AI-optimized output for continuous feedback.
 *
 * Part of Phase 5: AI Agent Commands
 */

import * as fs from 'fs';
import * as path from 'path';
import type { WatchOptions, AISummary } from '../types/index.js';
import { runAICommand } from './ai.js';
import { quickCheck, formatQuickCheck, type QuickCheckResult } from './quick.js';

/**
 * Default watch paths
 */
const DEFAULT_WATCH_PATHS = [
  'src',
  'tests/e2e',
];

/**
 * File extensions to watch
 */
const WATCH_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

/**
 * Paths to ignore
 */
const IGNORE_PATTERNS = [
  'node_modules',
  '.e2e-cache',
  'dist',
  'build',
  '.git',
  'test-results',
  'playwright-report',
];

/**
 * Watch state management
 */
interface WatchState {
  isRunning: boolean;
  lastRunTime: number;
  lastResult: QuickCheckResult | null;
  changesPending: boolean;
  watchedFiles: Set<string>;
}

let watchState: WatchState = {
  isRunning: false,
  lastRunTime: 0,
  lastResult: null,
  changesPending: false,
  watchedFiles: new Set(),
};

/**
 * Debounce helper
 */
function debounce<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Check if a file should be watched
 */
function shouldWatch(filePath: string): boolean {
  // Check extension
  const ext = path.extname(filePath);
  if (!WATCH_EXTENSIONS.includes(ext)) {
    return false;
  }

  // Check ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (filePath.includes(pattern)) {
      return false;
    }
  }

  return true;
}

/**
 * Get all files to watch in a directory
 */
function getWatchFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip ignored patterns
    if (IGNORE_PATTERNS.some(pattern => entry.name.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...getWatchFiles(fullPath));
    } else if (entry.isFile() && shouldWatch(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Handle file change event
 */
async function handleFileChange(
  filePath: string,
  options: WatchOptions
): Promise<void> {
  if (watchState.isRunning) {
    watchState.changesPending = true;
    return;
  }

  watchState.isRunning = true;

  const shortPath = filePath.split('/').slice(-2).join('/');
  console.log(`\n📝 Changed: ${shortPath}`);
  console.log('─'.repeat(40));

  try {
    // Run AI command with skip-run for quick analysis
    // or full run depending on change type
    const isTestFile = filePath.includes('test') || filePath.includes('spec');

    await runAICommand(
      {
        format: 'cli',
        skipRun: false, // Always re-run tests
        deep: false,
      },
      {
        // If test file changed, only run that test
        spec: isTestFile ? filePath : undefined,
        verbose: false,
      }
    );

    // Update state
    watchState.lastResult = quickCheck();
    watchState.lastRunTime = Date.now();

    // Print compact status
    console.log('\n' + '─'.repeat(40));
    console.log(`Status: ${formatQuickCheck(watchState.lastResult)}`);
    console.log('─'.repeat(40));
  } catch (error) {
    console.error('Watch error:', error);
  } finally {
    watchState.isRunning = false;

    // Handle pending changes
    if (watchState.changesPending) {
      watchState.changesPending = false;
      // Re-run after a short delay
      setTimeout(() => handleFileChange(filePath, options), 500);
    }
  }
}

/**
 * Start watch mode
 */
export async function startWatch(options: WatchOptions = {}): Promise<void> {
  const { paths = DEFAULT_WATCH_PATHS, debounce: debounceDelay = 1000 } = options;

  console.log('\n👀 E2E Watch Mode');
  console.log('═'.repeat(50));
  console.log('Watching for changes...\n');

  // Initial run
  console.log('Running initial test suite...\n');
  await runAICommand({ format: 'cli', skipRun: false }, { verbose: false });

  watchState.lastResult = quickCheck();
  watchState.lastRunTime = Date.now();

  console.log('\n' + '─'.repeat(50));
  console.log(`Initial Status: ${formatQuickCheck(watchState.lastResult)}`);
  console.log('─'.repeat(50));

  // Set up file watchers
  const debouncedHandler = debounce(
    (filePath: string) => handleFileChange(filePath, options),
    debounceDelay
  );

  console.log('\nWatching paths:');
  for (const watchPath of paths) {
    const fullPath = path.isAbsolute(watchPath)
      ? watchPath
      : path.join(process.cwd(), watchPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  ${watchPath} (not found)`);
      continue;
    }

    // Get initial file list
    const files = getWatchFiles(fullPath);
    console.log(`  📁 ${watchPath} (${files.length} files)`);

    // Watch the directory
    try {
      fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
        if (filename && shouldWatch(filename)) {
          const changedPath = path.join(fullPath, filename);
          debouncedHandler(changedPath);
        }
      });
    } catch (error) {
      console.error(`Failed to watch ${watchPath}:`, error);
    }
  }

  console.log('\nPress Ctrl+C to stop watching.\n');

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n👋 Watch mode stopped.');
    process.exit(0);
  });
}

/**
 * Run watch command
 */
export async function runWatch(options: WatchOptions = {}): Promise<void> {
  await startWatch(options);

  // Keep the process running
  await new Promise(() => {});
}

/**
 * Get watch status
 */
export function getWatchStatus(): {
  isRunning: boolean;
  lastRunTime: number;
  lastResult: QuickCheckResult | null;
} {
  return {
    isRunning: watchState.isRunning,
    lastRunTime: watchState.lastRunTime,
    lastResult: watchState.lastResult,
  };
}

/**
 * Stop watch mode (for programmatic use)
 */
export function stopWatch(): void {
  watchState = {
    isRunning: false,
    lastRunTime: 0,
    lastResult: null,
    changesPending: false,
    watchedFiles: new Set(),
  };
}

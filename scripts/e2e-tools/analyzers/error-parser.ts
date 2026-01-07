/**
 * Error Parser for E2E Test Results
 *
 * Parses Playwright test output and extracts structured error information
 * for analysis and categorization.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { TestResult, TestError, ErrorCategory } from '../types';

/**
 * Pattern definitions for error categorization
 */
interface ErrorPatternDef {
  pattern: RegExp;
  category: ErrorCategory;
  extractor?: (match: RegExpMatchArray) => Partial<TestError>;
}

const ERROR_PATTERNS: ErrorPatternDef[] = [
  // Browser compatibility errors
  {
    pattern: /AppDataSource\.\w+ cannot be used in the browser/i,
    category: 'browser_compat',
    extractor: (match) => ({
      message: match[0],
    }),
  },
  {
    pattern: /at new (\w+Repository)/,
    category: 'browser_compat',
    extractor: (match) => ({
      message: `Repository instantiated in browser: ${match[1]}`,
    }),
  },
  {
    pattern: /module\.createRequire is not a function/i,
    category: 'browser_compat',
    extractor: () => ({
      message: 'Node.js API used in browser context: module.createRequire',
    }),
  },
  {
    pattern: /Cannot use import statement outside a module/i,
    category: 'browser_compat',
  },
  {
    pattern: /getRepository.*cannot be called/i,
    category: 'browser_compat',
  },

  // Element not found errors
  {
    pattern: /Locator: (.+)\nExpected: visible/s,
    category: 'element_not_found',
    extractor: (match) => ({
      message: `Element not found: ${match[1]}`,
    }),
  },
  {
    pattern: /waiting for locator\('([^']+)'\)/,
    category: 'element_not_found',
    extractor: (match) => ({
      message: `Element not found: ${match[1]}`,
    }),
  },
  {
    pattern: /locator\.click: Target closed/i,
    category: 'element_not_found',
  },

  // Timeout errors
  {
    pattern: /Timeout (\d+)ms exceeded/,
    category: 'timeout',
    extractor: (match) => ({
      message: `Timeout after ${match[1]}ms`,
    }),
  },
  {
    pattern: /Test timeout of \d+ms exceeded/,
    category: 'timeout',
  },

  // Server errors
  {
    pattern: /status of 500/,
    category: 'server_error',
  },
  {
    pattern: /Internal Server Error/i,
    category: 'server_error',
  },
  {
    pattern: /ERR_CONNECTION_REFUSED/,
    category: 'server_error',
  },

  // Network errors
  {
    pattern: /net::ERR_/,
    category: 'network',
  },
  {
    pattern: /NetworkError/i,
    category: 'network',
  },
  {
    pattern: /fetch failed/i,
    category: 'network',
  },

  // Assertion errors
  {
    pattern: /expect\(.*\)\.toBe/,
    category: 'assertion',
  },
  {
    pattern: /Expected:.*Received:/s,
    category: 'assertion',
  },
  {
    pattern: /AssertionError/,
    category: 'assertion',
  },
];

/**
 * Parse Playwright list reporter output into structured test results
 */
export function parsePlaywrightOutput(output: string): TestResult[] {
  const results: TestResult[] = [];

  // Parse test results from Playwright list reporter output
  // Format: ✓|✘|⊘ [project] › file › test name (duration)
  const testRegex = /^\s*(✓|✘|⊘|-)\s+\[(.+?)\]\s+›\s+(.+?)\s+›\s+(.+?)(?:\s+\((.+?)\))?$/gm;

  let match;
  while ((match = testRegex.exec(output)) !== null) {
    const [, statusChar, project, file, name, duration] = match;

    const status: TestResult['status'] =
      statusChar === '✓' ? 'passed' :
      statusChar === '✘' ? 'failed' : 'skipped';

    results.push({
      name: name.trim(),
      file: file.trim(),
      line: 0,
      status,
      duration: parseDuration(duration || '0s'),
      project: project.trim(),
    });
  }

  // If no results parsed, try alternative format (Playwright JSON output)
  if (results.length === 0) {
    const jsonMatch = output.match(/\{[\s\S]*"suites"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonResults = JSON.parse(jsonMatch[0]);
        return parsePlaywrightJsonOutput(jsonResults);
      } catch {
        // Not valid JSON, continue with empty results
      }
    }
  }

  return results;
}

/**
 * Parse Playwright JSON reporter output
 */
function parsePlaywrightJsonOutput(json: Record<string, unknown>): TestResult[] {
  const results: TestResult[] = [];

  interface TestCase {
    title: string;
    file?: string;
    line?: number;
    status: string;
    duration: number;
    projectName?: string;
    errors?: Array<{ message?: string; stack?: string }>;
  }

  interface Suite {
    title?: string;
    file?: string;
    specs?: TestCase[];
    suites?: Suite[];
  }

  function processSpec(spec: TestCase, file: string, project: string): void {
    const status: TestResult['status'] =
      spec.status === 'passed' ? 'passed' :
      spec.status === 'failed' ? 'failed' : 'skipped';

    const result: TestResult = {
      name: spec.title,
      file: spec.file || file,
      line: spec.line || 0,
      status,
      duration: spec.duration || 0,
      project,
    };

    if (status === 'failed' && spec.errors && spec.errors.length > 0) {
      const errorText = spec.errors.map(e => e.message || e.stack || '').join('\n');
      result.error = extractErrorDetails(errorText);
    }

    results.push(result);
  }

  function processSuite(suite: Suite, file: string, project: string): void {
    const suiteFile = suite.file || file;
    if (suite.specs) {
      for (const spec of suite.specs) {
        processSpec(spec, suiteFile, project);
      }
    }
    if (suite.suites) {
      for (const subSuite of suite.suites) {
        processSuite(subSuite, suiteFile, project);
      }
    }
  }

  const suites = json.suites as Suite[] | undefined;
  if (suites) {
    for (const suite of suites) {
      processSuite(suite, '', 'default');
    }
  }

  return results;
}

/**
 * Categorize an error message into an ErrorCategory
 */
export function categorizeError(errorText: string): ErrorCategory {
  for (const { pattern, category } of ERROR_PATTERNS) {
    if (pattern.test(errorText)) {
      return category;
    }
  }
  return 'unknown';
}

/**
 * Extract structured error details from error text
 */
export function extractErrorDetails(errorText: string): TestError {
  const category = categorizeError(errorText);

  // Try to find additional details from pattern extractors
  let additionalDetails: Partial<TestError> = {};
  for (const { pattern, extractor } of ERROR_PATTERNS) {
    const match = errorText.match(pattern);
    if (match && extractor) {
      additionalDetails = { ...additionalDetails, ...extractor(match) };
      break;
    }
  }

  // Extract file and line from stack trace
  const stackMatch = errorText.match(/at\s+.+?\s+\((.+?):(\d+):(\d+)\)/);
  const file = stackMatch?.[1];
  const line = stackMatch ? parseInt(stackMatch[2], 10) : undefined;
  const column = stackMatch ? parseInt(stackMatch[3], 10) : undefined;

  // Extract first meaningful error message
  const messageMatch = errorText.match(/Error: (.+?)(?:\n|$)/);
  const message = additionalDetails.message || messageMatch?.[1] || errorText.split('\n')[0];

  return {
    message,
    stack: errorText,
    category,
    file,
    line,
    column,
    ...additionalDetails,
  };
}

/**
 * Parse error-context.md file generated by Playwright
 */
export function parseErrorContextFile(filePath: string): Partial<TestError> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract DOM snapshot from YAML block
  const yamlMatch = content.match(/```yaml\n([\s\S]+?)```/);
  const domSnapshot = yamlMatch?.[1];

  // Extract screenshot path if present
  const screenshotMatch = content.match(/screenshot: (.+?)$/m);
  const screenshotPath = screenshotMatch?.[1];

  // Extract code snippet if present
  const snippetMatch = content.match(/```(?:typescript|javascript)\n([\s\S]+?)```/);
  const snippet = snippetMatch?.[1];

  return {
    domSnapshot,
    screenshotPath,
    snippet,
  };
}

/**
 * Find all error-context.md files in test-results directory
 */
export function findErrorContextFiles(testResultsDir: string): Map<string, string> {
  const contextFiles = new Map<string, string>();

  if (!fs.existsSync(testResultsDir)) {
    return contextFiles;
  }

  const dirs = fs.readdirSync(testResultsDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of dirs) {
    const contextPath = path.join(testResultsDir, dir.name, 'error-context.md');
    if (fs.existsSync(contextPath)) {
      contextFiles.set(dir.name, contextPath);
    }
  }

  return contextFiles;
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)(ms|s|m)/);
  if (!match) return 0;

  const [, value, unit] = match;
  const num = parseFloat(value);

  switch (unit) {
    case 'ms': return num;
    case 's': return num * 1000;
    case 'm': return num * 60000;
    default: return num;
  }
}

/**
 * Generate error fingerprint for deduplication
 */
export function generateErrorFingerprint(error: TestError): string {
  const parts: string[] = [error.category];

  if (error.file) {
    // Normalize file path
    parts.push(path.basename(error.file));
  }

  if (error.line) {
    parts.push(String(error.line));
  }

  // Extract key part of message (first 50 chars, normalized)
  const normalizedMessage = error.message
    .replace(/\d+/g, 'N')  // Replace numbers
    .replace(/['"`].+?['"`]/g, 'STR')  // Replace quoted strings
    .slice(0, 50);
  parts.push(normalizedMessage);

  return parts.join('|');
}

/**
 * Group errors by fingerprint for deduplication
 */
export function deduplicateErrors(
  results: TestResult[]
): Map<string, { error: TestError; count: number; tests: string[] }> {
  const grouped = new Map<string, { error: TestError; count: number; tests: string[] }>();

  for (const result of results) {
    if (!result.error) continue;

    const fingerprint = generateErrorFingerprint(result.error);

    if (grouped.has(fingerprint)) {
      const existing = grouped.get(fingerprint)!;
      existing.count++;
      existing.tests.push(result.name);
    } else {
      grouped.set(fingerprint, {
        error: result.error,
        count: 1,
        tests: [result.name],
      });
    }
  }

  return grouped;
}

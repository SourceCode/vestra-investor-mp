/**
 * Browser Compatibility Analyzer for E2E Tests
 *
 * Identifies browser-incompatible APIs and patterns in source code.
 * Used to detect why code fails in browser but works in Node.js.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { ErrorSeverity } from '../types/index.js';

/**
 * Definition of a browser-incompatible API
 */
export interface BrowserAPI {
  name: string;
  pattern: string;
  severity: ErrorSeverity;
  reason: string;
  fix: string;
}

/**
 * Single browser incompatibility issue found in code
 */
export interface BrowserIncompatibility {
  api: string;
  pattern: string;
  severity: ErrorSeverity;
  reason: string;
  fix: string;
  file: string;
  line: number;
  column: number;
  matchedText: string;
  lineContent: string;
}

/**
 * Result of analyzing a file for browser compatibility
 */
export interface BrowserCompatResult {
  file: string;
  issues: BrowserIncompatibility[];
  isServerOnly: boolean;
  hasCriticalIssues: boolean;
  totalIssues: number;
}

/**
 * Known browser-incompatible APIs
 */
const BROWSER_INCOMPATIBLE_APIS: BrowserAPI[] = [
  {
    name: 'TypeORM DataSource',
    pattern: 'AppDataSource\\.(?:getRepository|manager|query|initialize)',
    severity: 'critical',
    reason: 'TypeORM uses Node.js APIs (fs, path, etc.) not available in browser',
    fix: 'Use DBClient from @/db/client for browser-safe database access',
  },
  {
    name: 'Node.js createRequire',
    pattern: 'module\\.createRequire|createRequire\\(',
    severity: 'critical',
    reason: 'createRequire is a Node.js-only API',
    fix: 'Use dynamic import() or browser-safe alternative',
  },
  {
    name: 'Node.js fs module',
    pattern: "(?:require\\(['\"]fs['\"]\\)|from ['\"]fs['\"]|from ['\"]node:fs['\"])",
    severity: 'critical',
    reason: 'File system APIs are not available in browser',
    fix: 'Use fetch API or browser storage instead',
  },
  {
    name: 'Node.js path module',
    pattern: "(?:require\\(['\"]path['\"]\\)|from ['\"]path['\"]|from ['\"]node:path['\"])",
    severity: 'high',
    reason: 'Path module is Node.js-only',
    fix: 'Use URL API or string manipulation for paths',
  },
  {
    name: 'Node.js Buffer',
    pattern: 'Buffer\\.(?:from|alloc|allocUnsafe)',
    severity: 'medium',
    reason: 'Buffer is Node.js-only (polyfill may work)',
    fix: 'Use Uint8Array or TextEncoder/TextDecoder',
  },
  {
    name: 'Singleton Service Export',
    pattern: 'export\\s+const\\s+\\w+Service\\s*=\\s*new\\s+\\w+Service',
    severity: 'critical',
    reason: 'Singleton instantiation at module load executes in browser',
    fix: 'Use lazy initialization: export function get...Service() { ... }',
  },
  {
    name: 'Direct Repository Construction',
    pattern: 'new\\s+\\w+Repository\\(\\)',
    severity: 'high',
    reason: 'Repository construction may trigger TypeORM initialization',
    fix: 'Inject repository or use lazy initialization',
  },
  {
    name: 'Process environment in browser',
    pattern: 'process\\.env\\.(?!VITE_|NEXT_PUBLIC_)',
    severity: 'medium',
    reason: 'Server-only env vars not available in browser',
    fix: 'Use VITE_* prefix for client-exposed env vars',
  },
  {
    name: 'Node.js crypto module',
    pattern: "(?:require\\(['\"]crypto['\"]\\)|from ['\"]crypto['\"]|from ['\"]node:crypto['\"])",
    severity: 'high',
    reason: 'Node.js crypto module not available in browser',
    fix: 'Use Web Crypto API (crypto.subtle) or a browser-compatible library',
  },
  {
    name: 'TypeORM Repository Import',
    pattern: "from ['\"]typeorm['\"]",
    severity: 'high',
    reason: 'TypeORM imports trigger Node.js-only code paths',
    fix: 'Move TypeORM usage to server-only files or use tRPC',
  },
  {
    name: 'Direct DataSource Import',
    pattern: "import.*from ['\"].*data-source['\"]",
    severity: 'critical',
    reason: 'DataSource import triggers TypeORM initialization',
    fix: 'Use lazy imports or server-only modules',
  },
  {
    name: 'Node.js child_process',
    pattern: "(?:require\\(['\"]child_process['\"]\\)|from ['\"]child_process['\"])",
    severity: 'critical',
    reason: 'child_process is not available in browser',
    fix: 'This functionality cannot run in browser - move to server',
  },
  {
    name: 'Node.js os module',
    pattern: "(?:require\\(['\"]os['\"]\\)|from ['\"]os['\"]|from ['\"]node:os['\"])",
    severity: 'high',
    reason: 'OS module is Node.js-only',
    fix: 'Remove OS-specific code or use feature detection',
  },
];

/**
 * Browser Compatibility Analyzer Class
 *
 * Scans source files for browser-incompatible patterns
 * and provides fix recommendations.
 */
export class BrowserCompatAnalyzer {
  private readonly apis: BrowserAPI[];
  private readonly compiledPatterns: Map<string, RegExp>;

  constructor() {
    this.apis = BROWSER_INCOMPATIBLE_APIS;
    this.compiledPatterns = new Map();

    // Pre-compile regex patterns
    for (const api of this.apis) {
      try {
        this.compiledPatterns.set(api.name, new RegExp(api.pattern, 'g'));
      } catch {
        // If regex fails, use escaped literal
        const escaped = api.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        this.compiledPatterns.set(api.name, new RegExp(escaped, 'g'));
      }
    }
  }

  /**
   * Analyze a file for browser compatibility issues
   */
  analyzeFile(filePath: string): BrowserCompatResult {
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      return {
        file: filePath,
        issues: [],
        isServerOnly: false,
        hasCriticalIssues: false,
        totalIssues: 0,
      };
    }

    // Check if file is server-only (safe to use these APIs)
    const isServerOnly = this.isServerOnlyFile(filePath, content);
    if (isServerOnly) {
      return {
        file: filePath,
        issues: [],
        isServerOnly: true,
        hasCriticalIssues: false,
        totalIssues: 0,
      };
    }

    const issues: BrowserIncompatibility[] = [];
    const lines = content.split('\n');

    for (const api of this.apis) {
      const regex = this.compiledPatterns.get(api.name);
      if (!regex) continue;

      // Reset regex state
      regex.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        // Calculate line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
        const lastNewline = beforeMatch.lastIndexOf('\n');
        const column = match.index - lastNewline;

        // Get the line content
        const lineContent = lines[lineNumber - 1]?.trim() || '';

        issues.push({
          api: api.name,
          pattern: api.pattern,
          severity: api.severity,
          reason: api.reason,
          fix: api.fix,
          file: filePath,
          line: lineNumber,
          column,
          matchedText: match[0],
          lineContent,
        });
      }
    }

    return {
      file: filePath,
      issues,
      isServerOnly: false,
      hasCriticalIssues: issues.some((i) => i.severity === 'critical'),
      totalIssues: issues.length,
    };
  }

  /**
   * Analyze multiple files
   */
  analyzeFiles(filePaths: string[]): BrowserCompatResult[] {
    return filePaths.map((fp) => this.analyzeFile(fp));
  }

  /**
   * Analyze all files in a directory
   */
  analyzeDirectory(dir: string): BrowserCompatResult[] {
    const results: BrowserCompatResult[] = [];
    const fullDir = join(process.cwd(), dir);

    if (!existsSync(fullDir)) {
      return results;
    }

    this.walkDirectory(fullDir, (file) => {
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const result = this.analyzeFile(file);
        if (result.issues.length > 0) {
          results.push(result);
        }
      }
    });

    return results;
  }

  /**
   * Check if file is server-only (e.g., in api/, server/, etc.)
   */
  private isServerOnlyFile(filePath: string, content: string): boolean {
    // Check path patterns
    const serverOnlyPaths = [
      '/api/',
      '/server/',
      '/scripts/',
      '/cli/',
      '/db/migrations/',
      '/db/seeders/',
      '.server.',
      '.api.',
    ];

    if (serverOnlyPaths.some((p) => filePath.includes(p))) {
      return true;
    }

    // Check for 'use server' directive
    if (content.includes("'use server'") || content.includes('"use server"')) {
      return true;
    }

    // Check for server-only file naming
    if (/\.(server|api)\.(ts|tsx|js|jsx)$/.test(filePath)) {
      return true;
    }

    // Check for test files (they run in Node.js)
    if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath)) {
      return true;
    }

    return false;
  }

  /**
   * Walk directory recursively
   */
  private walkDirectory(dir: string, callback: (file: string) => void): void {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            this.walkDirectory(fullPath, callback);
          }
        } else if (entry.isFile()) {
          callback(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get all APIs that are incompatible
   */
  getIncompatibleAPIs(): BrowserAPI[] {
    return [...this.apis];
  }

  /**
   * Add a custom API pattern
   */
  addAPI(api: BrowserAPI): void {
    this.apis.push(api);
    try {
      this.compiledPatterns.set(api.name, new RegExp(api.pattern, 'g'));
    } catch {
      const escaped = api.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this.compiledPatterns.set(api.name, new RegExp(escaped, 'g'));
    }
  }

  /**
   * Get compact summary of compatibility issues
   */
  getCompactSummary(results: BrowserCompatResult[]): string {
    const total = results.reduce((sum, r) => sum + r.totalIssues, 0);
    const critical = results.reduce(
      (sum, r) => sum + r.issues.filter((i) => i.severity === 'critical').length,
      0
    );
    const high = results.reduce(
      (sum, r) => sum + r.issues.filter((i) => i.severity === 'high').length,
      0
    );

    if (total === 0) {
      return 'BC:OK';
    }

    return `BC:${total}|C:${critical}|H:${high}`;
  }

  /**
   * Get issues grouped by severity
   */
  groupBySeverity(
    results: BrowserCompatResult[]
  ): Record<ErrorSeverity, BrowserIncompatibility[]> {
    const grouped: Record<ErrorSeverity, BrowserIncompatibility[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    for (const result of results) {
      for (const issue of result.issues) {
        grouped[issue.severity].push(issue);
      }
    }

    return grouped;
  }

  /**
   * Get issues grouped by file
   */
  groupByFile(
    results: BrowserCompatResult[]
  ): Map<string, BrowserIncompatibility[]> {
    const grouped = new Map<string, BrowserIncompatibility[]>();

    for (const result of results) {
      if (result.issues.length > 0) {
        grouped.set(result.file, result.issues);
      }
    }

    return grouped;
  }
}

// Lazy singleton instance
let _browserCompatAnalyzer: BrowserCompatAnalyzer | null = null;

/**
 * Get the singleton BrowserCompatAnalyzer instance
 */
export function getBrowserCompatAnalyzer(): BrowserCompatAnalyzer {
  if (!_browserCompatAnalyzer) {
    _browserCompatAnalyzer = new BrowserCompatAnalyzer();
  }
  return _browserCompatAnalyzer;
}

/**
 * Analyze a file for browser compatibility (convenience function)
 */
export function analyzeFileCompat(filePath: string): BrowserCompatResult {
  return getBrowserCompatAnalyzer().analyzeFile(filePath);
}

/**
 * Analyze a directory for browser compatibility (convenience function)
 */
export function analyzeDirectoryCompat(dir: string): BrowserCompatResult[] {
  return getBrowserCompatAnalyzer().analyzeDirectory(dir);
}

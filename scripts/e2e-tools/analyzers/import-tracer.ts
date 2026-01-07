/**
 * Import Tracer for E2E Test Root Cause Analysis
 *
 * Traces import chains from error locations to identify the root cause
 * of browser compatibility issues and problematic module dependencies.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Node in an import chain
 */
export interface ImportNode {
  file: string;
  imports: string[];
  depth: number;
  hasTargetImport: boolean;
  problematicExports: string[];
}

/**
 * Complete import chain result
 */
export interface ImportChain {
  startFile: string;
  chain: ImportNode[];
  found: boolean;
  targetPattern?: string;
  error?: string;
}

/**
 * Patterns that indicate browser-incompatible code
 */
const PROBLEMATIC_PATTERNS: RegExp[] = [
  /AppDataSource\.getRepository/,
  /new\s+\w+Repository\(\)/,
  /export\s+const\s+\w+Service\s*=\s*new/,
  /export\s+const\s+\w+\s*=\s*new\s+\w+Service/,
  /module\.createRequire/,
  /require\s*\(\s*['"]typeorm['"]\s*\)/,
  /from\s+['"]typeorm['"]/,
];

/**
 * Import Tracer Class
 *
 * Traces import chains to identify browser compatibility issues.
 * Uses caching and cycle detection for performance.
 */
export class ImportTracer {
  private readonly srcDir: string;
  private visitedFiles: Set<string>;
  private readonly importCache: Map<string, string[]>;
  private readonly contentCache: Map<string, string>;

  constructor(srcDir: string = 'src') {
    this.srcDir = srcDir;
    this.visitedFiles = new Set();
    this.importCache = new Map();
    this.contentCache = new Map();
  }

  /**
   * Trace imports from a starting file to find problematic imports
   */
  trace(startFile: string, targetPattern?: RegExp): ImportChain {
    this.visitedFiles = new Set();

    const absolutePath = this.resolveFile(startFile);
    if (!absolutePath) {
      return {
        startFile,
        chain: [],
        found: false,
        error: `File not found: ${startFile}`,
      };
    }

    const chain: ImportNode[] = [];
    const found = this.traceRecursive(absolutePath, chain, targetPattern);

    return {
      startFile,
      chain,
      found,
      targetPattern: targetPattern?.source,
    };
  }

  /**
   * Trace from an error stack to find the root import
   */
  traceFromStack(stack: string[]): ImportChain {
    // Find the first application file in the stack (not node_modules)
    for (const frame of stack) {
      const match = frame.match(/at\s+.*?\(?(\/[^:]+|[^/][^:]+):\d+:\d+/);
      if (match) {
        const file = match[1];
        if (file.includes(this.srcDir) && !file.includes('node_modules')) {
          return this.trace(file);
        }
      }
    }

    // Try to extract URL-based paths
    for (const frame of stack) {
      const urlMatch = frame.match(/http:\/\/[^/]+\/([^:]+):\d+:\d+/);
      if (urlMatch) {
        const file = urlMatch[1];
        if (file.startsWith('src/')) {
          return this.trace(file);
        }
      }
    }

    return {
      startFile: 'unknown',
      chain: [],
      found: false,
      error: 'Could not extract file from stack trace',
    };
  }

  /**
   * Find all files that import a given file (reverse trace)
   */
  findImporters(targetFile: string): string[] {
    const importers: string[] = [];
    const normalizedTarget = this.normalizeImport(targetFile);

    this.walkDirectory(this.srcDir, (file) => {
      const imports = this.extractImports(file);
      for (const imp of imports) {
        const normalized = this.normalizeImport(imp, dirname(file));
        if (normalized === normalizedTarget) {
          importers.push(file);
          break;
        }
      }
    });

    return importers;
  }

  /**
   * Get files with problematic patterns
   */
  findProblematicFiles(): string[] {
    const problematic: string[] = [];

    this.walkDirectory(this.srcDir, (file) => {
      const content = this.readFile(file);
      if (!content) return;

      for (const pattern of PROBLEMATIC_PATTERNS) {
        if (pattern.test(content)) {
          problematic.push(file);
          break;
        }
      }
    });

    return problematic;
  }

  /**
   * Recursive import tracing with cycle detection
   */
  private traceRecursive(
    file: string,
    chain: ImportNode[],
    targetPattern?: RegExp,
    depth: number = 0
  ): boolean {
    // Prevent infinite loops and limit depth
    if (depth > 20 || this.visitedFiles.has(file)) {
      return false;
    }

    this.visitedFiles.add(file);

    const content = this.readFile(file);
    if (!content) return false;

    const imports = this.extractImports(file, content);
    const problematicExports = this.findProblematicPatterns(content);

    const node: ImportNode = {
      file,
      imports,
      depth,
      hasTargetImport: problematicExports.length > 0,
      problematicExports,
    };

    chain.push(node);

    // If we found our target, stop
    if (targetPattern && targetPattern.test(content)) {
      node.hasTargetImport = true;
      return true;
    }

    // If we found problematic patterns, this is a root cause
    if (node.hasTargetImport) {
      return true;
    }

    // Trace imports recursively
    for (const imp of imports) {
      const resolvedImport = this.resolveImport(imp, dirname(file));
      if (resolvedImport) {
        if (this.traceRecursive(resolvedImport, chain, targetPattern, depth + 1)) {
          return true;
        }
      }
    }

    return node.hasTargetImport;
  }

  /**
   * Find problematic patterns in file content
   */
  private findProblematicPatterns(content: string): string[] {
    const found: string[] = [];

    for (const pattern of PROBLEMATIC_PATTERNS) {
      if (pattern.test(content)) {
        found.push(pattern.source);
      }
    }

    return found;
  }

  /**
   * Extract imports from a file
   */
  private extractImports(file: string, content?: string): string[] {
    if (this.importCache.has(file)) {
      return this.importCache.get(file)!;
    }

    content = content || this.readFile(file) || undefined;
    if (!content) return [];

    const imports: string[] = [];

    // Match ES6 imports
    const es6Regex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = es6Regex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Match dynamic imports
    const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Match require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Filter to local imports only
    const localImports = imports.filter(
      (imp) =>
        imp.startsWith('.') ||
        imp.startsWith('@/') ||
        imp.startsWith('src/')
    );

    this.importCache.set(file, localImports);
    return localImports;
  }

  /**
   * Resolve an import path to an absolute file path
   */
  private resolveImport(importPath: string, fromDir: string): string | null {
    let resolved: string;

    if (importPath.startsWith('@/')) {
      resolved = join(process.cwd(), 'src', importPath.slice(2));
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      resolved = resolve(fromDir, importPath);
    } else {
      return null; // External package
    }

    return this.resolveFile(resolved);
  }

  /**
   * Resolve a file path with extension fallback
   */
  private resolveFile(file: string): string | null {
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];

    for (const ext of extensions) {
      const withExt = file + ext;
      if (existsSync(withExt)) {
        return withExt;
      }
    }

    // Try index file
    for (const ext of extensions.slice(1)) {
      const indexFile = join(file, `index${ext}`);
      if (existsSync(indexFile)) {
        return indexFile;
      }
    }

    return null;
  }

  /**
   * Normalize an import path
   */
  private normalizeImport(importPath: string, fromDir?: string): string {
    if (importPath.startsWith('@/')) {
      return join('src', importPath.slice(2));
    }
    if (fromDir && (importPath.startsWith('./') || importPath.startsWith('../'))) {
      return resolve(fromDir, importPath).replace(process.cwd() + '/', '');
    }
    return importPath;
  }

  /**
   * Read file with caching
   */
  private readFile(file: string): string | null {
    if (this.contentCache.has(file)) {
      return this.contentCache.get(file) || null;
    }

    try {
      const content = readFileSync(file, 'utf-8');
      this.contentCache.set(file, content);
      return content;
    } catch {
      return null;
    }
  }

  /**
   * Walk a directory recursively
   */
  private walkDirectory(dir: string, callback: (file: string) => void): void {
    const fullDir = join(process.cwd(), dir);

    try {
      const entries = readdirSync(fullDir);
      for (const entry of entries) {
        const fullPath = join(fullDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          this.walkDirectory(join(dir, entry), callback);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry)) {
          callback(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear caches for fresh analysis
   */
  clearCaches(): void {
    this.importCache.clear();
    this.contentCache.clear();
    this.visitedFiles.clear();
  }

  /**
   * Get compact summary of an import chain
   */
  getCompactSummary(chain: ImportChain): string {
    if (!chain.found && chain.error) {
      return `ERR: ${chain.error}`;
    }

    if (chain.chain.length === 0) {
      return 'NO_CHAIN';
    }

    const problematicNode = chain.chain.find((n) => n.hasTargetImport);
    if (problematicNode) {
      const file = problematicNode.file.split('/').pop();
      return `ROOT: ${file} (${problematicNode.problematicExports[0]})`;
    }

    return `CHAIN: ${chain.chain.length} files analyzed`;
  }
}

// Lazy singleton instance
let _importTracer: ImportTracer | null = null;

/**
 * Get the singleton ImportTracer instance
 */
export function getImportTracer(): ImportTracer {
  if (!_importTracer) {
    _importTracer = new ImportTracer();
  }
  return _importTracer;
}

/**
 * Trace imports from a file (convenience function)
 */
export function traceImports(startFile: string, targetPattern?: RegExp): ImportChain {
  return getImportTracer().trace(startFile, targetPattern);
}

/**
 * Trace imports from stack trace (convenience function)
 */
export function traceFromStack(stack: string[]): ImportChain {
  return getImportTracer().traceFromStack(stack);
}

/**
 * Find files with problematic patterns (convenience function)
 */
export function findProblematicFiles(): string[] {
  return getImportTracer().findProblematicFiles();
}

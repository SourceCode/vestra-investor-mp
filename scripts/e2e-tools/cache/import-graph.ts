/**
 * Import Graph Cache for E2E Tools
 *
 * Caches dependency relationships between files to speed up
 * affected test detection without re-parsing on every run.
 *
 * Part of Phase 7: Token Optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Import graph node
 */
interface ImportNode {
  file: string;
  imports: string[];
  importedBy: string[];
  hash: string;
  lastModified: number;
}

/**
 * Cached import graph
 */
interface ImportGraphCache {
  version: string;
  generated: string;
  rootDir: string;
  nodes: Record<string, ImportNode>;
  stats: {
    totalFiles: number;
    totalEdges: number;
    buildTime: number;
  };
}

/**
 * Import Graph class
 */
export class ImportGraph {
  private cachePath: string;
  private cache: ImportGraphCache | null = null;
  private rootDir: string;

  constructor() {
    this.cachePath = path.join(process.cwd(), CACHE_DIR, 'import-graph.json');
    this.rootDir = process.cwd();
  }

  /**
   * Build or load the import graph
   */
  async build(forceRebuild: boolean = false): Promise<ImportGraphCache> {
    // Try to load existing cache
    if (!forceRebuild) {
      const cached = this.loadCache();
      if (cached && this.isCacheValid(cached)) {
        this.cache = cached;
        return cached;
      }
    }

    // Build fresh graph
    const startTime = Date.now();
    const nodes: Record<string, ImportNode> = {};

    // Scan source files
    const srcFiles = this.walkDir(path.join(this.rootDir, 'src'));
    const testFiles = this.walkDir(path.join(this.rootDir, 'tests/e2e'));

    const allFiles = [...srcFiles, ...testFiles].filter((f) =>
      f.match(/\.(ts|tsx|js|jsx|cjs|mjs)$/)
    );

    // Parse each file
    for (const file of allFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const node = await this.parseFile(file, relativePath);
      nodes[relativePath] = node;
    }

    // Build reverse mappings (importedBy)
    this.buildReverseMappings(nodes);

    const buildTime = Date.now() - startTime;

    const cache: ImportGraphCache = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      rootDir: this.rootDir,
      nodes,
      stats: {
        totalFiles: Object.keys(nodes).length,
        totalEdges: Object.values(nodes).reduce((sum, n) => sum + n.imports.length, 0),
        buildTime,
      },
    };

    // Save cache
    this.saveCache(cache);
    this.cache = cache;

    return cache;
  }

  /**
   * Get files that depend on a given file (transitively)
   */
  getDependents(filePath: string, maxDepth: number = 10): string[] {
    if (!this.cache) {
      return [];
    }

    const relativePath = filePath.startsWith(this.rootDir)
      ? path.relative(this.rootDir, filePath)
      : filePath;

    const visited = new Set<string>();
    const queue: Array<{ file: string; depth: number }> = [{ file: relativePath, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth > maxDepth) continue;

      const node = this.cache.nodes[current.file];
      if (!node) continue;

      for (const dependent of node.importedBy) {
        if (!visited.has(dependent)) {
          visited.add(dependent);
          queue.push({ file: dependent, depth: current.depth + 1 });
        }
      }
    }

    return Array.from(visited);
  }

  /**
   * Get files that a given file depends on (transitively)
   */
  getDependencies(filePath: string, maxDepth: number = 10): string[] {
    if (!this.cache) {
      return [];
    }

    const relativePath = filePath.startsWith(this.rootDir)
      ? path.relative(this.rootDir, filePath)
      : filePath;

    const visited = new Set<string>();
    const queue: Array<{ file: string; depth: number }> = [{ file: relativePath, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth > maxDepth) continue;

      const node = this.cache.nodes[current.file];
      if (!node) continue;

      for (const dep of node.imports) {
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push({ file: dep, depth: current.depth + 1 });
        }
      }
    }

    return Array.from(visited);
  }

  /**
   * Get tests affected by changes to a file
   */
  getAffectedTests(changedFile: string): string[] {
    const dependents = this.getDependents(changedFile);
    return dependents.filter((f) => f.match(/\.spec\.(ts|cjs)$/));
  }

  /**
   * Get all tests affected by multiple changed files
   */
  getAffectedTestsForChanges(changedFiles: string[]): string[] {
    const affectedSet = new Set<string>();

    for (const file of changedFiles) {
      const affected = this.getAffectedTests(file);
      affected.forEach((t) => affectedSet.add(t));
    }

    return Array.from(affectedSet).sort();
  }

  /**
   * Get graph statistics
   */
  getStats(): ImportGraphCache['stats'] | null {
    return this.cache?.stats || null;
  }

  /**
   * Format graph summary for compact output
   */
  formatCompact(): string {
    if (!this.cache) {
      return 'NO_CACHE';
    }

    const { stats } = this.cache;
    return `FILES:${stats.totalFiles}|EDGES:${stats.totalEdges}|TIME:${stats.buildTime}ms`;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    if (fs.existsSync(this.cachePath)) {
      fs.unlinkSync(this.cachePath);
    }
    this.cache = null;
  }

  // Private methods

  private loadCache(): ImportGraphCache | null {
    if (!fs.existsSync(this.cachePath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.cachePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  private saveCache(cache: ImportGraphCache): void {
    const dir = path.dirname(this.cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
  }

  private isCacheValid(cache: ImportGraphCache): boolean {
    // Check if cache is older than 1 hour
    const cacheTime = new Date(cache.generated).getTime();
    const maxAge = 60 * 60 * 1000; // 1 hour
    if (Date.now() - cacheTime > maxAge) {
      return false;
    }

    // Sample check: verify a few random files still match
    const nodes = Object.values(cache.nodes);
    const sampleSize = Math.min(10, nodes.length);
    const samples = nodes.slice(0, sampleSize);

    for (const node of samples) {
      const filePath = path.join(this.rootDir, node.file);
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const stats = fs.statSync(filePath);
      if (stats.mtimeMs > node.lastModified) {
        return false;
      }
    }

    return true;
  }

  private async parseFile(filePath: string, relativePath: string): Promise<ImportNode> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);

    const imports = this.extractImports(content, relativePath);

    return {
      file: relativePath,
      imports,
      importedBy: [], // Will be filled in by buildReverseMappings
      hash,
      lastModified: stats.mtimeMs,
    };
  }

  private extractImports(content: string, currentFile: string): string[] {
    const imports: string[] = [];
    const currentDir = path.dirname(currentFile);

    // Match import statements
    const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Skip external packages
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }

      // Resolve relative imports
      let resolved: string;
      if (importPath.startsWith('@/')) {
        // Alias for src/
        resolved = importPath.replace('@/', 'src/');
      } else {
        resolved = path.normalize(path.join(currentDir, importPath));
      }

      // Remove leading ./ if present
      resolved = resolved.replace(/^\.\//, '');

      // Try to resolve file extension
      const resolvedWithExt = this.resolveExtension(resolved);
      if (resolvedWithExt) {
        imports.push(resolvedWithExt);
      }
    }

    // Match require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = match[1];

      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }

      let resolved: string;
      if (importPath.startsWith('@/')) {
        resolved = importPath.replace('@/', 'src/');
      } else {
        resolved = path.normalize(path.join(currentDir, importPath));
      }

      resolved = resolved.replace(/^\.\//, '');
      const resolvedWithExt = this.resolveExtension(resolved);
      if (resolvedWithExt) {
        imports.push(resolvedWithExt);
      }
    }

    return [...new Set(imports)];
  }

  private resolveExtension(filePath: string): string | null {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '/index.ts', '/index.tsx', '/index.js'];

    // Check if already has extension
    if (filePath.match(/\.(ts|tsx|js|jsx|cjs|mjs)$/)) {
      return filePath;
    }

    // Try each extension
    for (const ext of extensions) {
      const fullPath = path.join(this.rootDir, filePath + ext);
      if (fs.existsSync(fullPath)) {
        return filePath + ext;
      }
    }

    return null;
  }

  private buildReverseMappings(nodes: Record<string, ImportNode>): void {
    for (const [file, node] of Object.entries(nodes)) {
      for (const imported of node.imports) {
        const importedNode = nodes[imported];
        if (importedNode) {
          importedNode.importedBy.push(file);
        }
      }
    }
  }

  private walkDir(dir: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
      return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules and hidden directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        results.push(...this.walkDir(fullPath));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }
}

/**
 * Singleton instance
 */
let importGraphInstance: ImportGraph | null = null;

export function getImportGraph(): ImportGraph {
  if (!importGraphInstance) {
    importGraphInstance = new ImportGraph();
  }
  return importGraphInstance;
}

export const importGraph = new ImportGraph();

/**
 * Build or load import graph
 */
export async function buildImportGraph(forceRebuild: boolean = false): Promise<ImportGraphCache> {
  return importGraph.build(forceRebuild);
}

/**
 * Get affected tests for changed files
 */
export async function getAffectedTests(changedFiles: string[]): Promise<string[]> {
  await importGraph.build();
  return importGraph.getAffectedTestsForChanges(changedFiles);
}

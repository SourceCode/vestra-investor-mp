/**
 * Lazy Initialization Generator for E2E Tests
 *
 * Specialized generator for converting eager singleton exports
 * to lazy getter functions. This is the most common fix pattern
 * for browser compatibility issues.
 *
 * Part of Phase 4: Auto-Fix Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedFix, CodeChange } from '../types/index.js';

/**
 * Pattern match result for singleton detection
 */
interface SingletonMatch {
  fullMatch: string;
  varName: string;
  className: string;
  lineNumber: number;
  index: number;
}

/**
 * Generate lazy initialization fix for singleton services
 *
 * Converts:
 *   export const fooService = new FooService();
 *
 * To:
 *   let _fooService: FooService | null = null;
 *
 *   export function getFooService(): FooService {
 *     if (!_fooService) {
 *       _fooService = new FooService();
 *     }
 *     return _fooService;
 *   }
 */
export function generateLazyInitFix(filePath: string): GeneratedFix | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const changes: CodeChange[] = [];
  let modifiedContent = content;

  // Find all singleton patterns
  const singletons = findSingletonPatterns(content);

  if (singletons.length === 0) {
    return null;
  }

  // Generate fixes for each singleton (in reverse order to maintain indices)
  for (const singleton of singletons.reverse()) {
    const { fullMatch, varName, className, lineNumber } = singleton;

    // Generate lazy initialization code
    const getterName = `get${capitalize(className)}`;
    const replacement = generateLazyInitCode(varName, className, getterName);

    changes.unshift({
      type: 'replace',
      lineStart: lineNumber,
      lineEnd: lineNumber,
      original: fullMatch,
      replacement,
      description: `Convert ${varName} to lazy initialization`,
    });

    modifiedContent = modifiedContent.replace(fullMatch, replacement);
  }

  // Add deprecation comment at the top if we made changes
  if (changes.length > 0 && !content.includes('@deprecated')) {
    const deprecationNote = `/**
 * @fileoverview Services in this file use lazy initialization pattern.
 * Import and call the getter function instead of using the constant directly.
 *
 * Example:
 *   import { get${capitalize(singletons[0].className)} } from './this-file';
 *   const service = get${capitalize(singletons[0].className)}();
 */

`;
    // Only add if not already present
    if (!modifiedContent.startsWith('/**\n * @fileoverview')) {
      modifiedContent = deprecationNote + modifiedContent;
    }
  }

  return {
    file: filePath,
    templateId: 'lazy-initialization',
    templateName: 'Lazy Initialization',
    changes,
    originalContent: content,
    modifiedContent,
    manualSteps: generateManualSteps(singletons),
    validation: 'Verify getter function is called instead of direct access',
  };
}

/**
 * Find singleton patterns in content
 */
function findSingletonPatterns(content: string): SingletonMatch[] {
  const patterns: RegExp[] = [
    // export const fooService = new FooService();
    /export\s+const\s+(\w+)\s*=\s*new\s+(\w+)\(\);?/g,
    // export const foo = new Foo();
    /export\s+const\s+(\w+)\s*=\s*new\s+(\w+)\(\s*\);?/g,
  ];

  const matches: SingletonMatch[] = [];
  const seenIndices = new Set<number>();

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(content)) !== null) {
      // Skip if we've already found this match
      if (seenIndices.has(match.index)) {
        continue;
      }
      seenIndices.add(match.index);

      const beforeMatch = content.substring(0, match.index);
      const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

      // Skip if in a comment
      const lineStart = beforeMatch.lastIndexOf('\n') + 1;
      const line = content.substring(lineStart, match.index + match[0].length);
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }

      matches.push({
        fullMatch: match[0],
        varName: match[1],
        className: match[2],
        lineNumber,
        index: match.index,
      });
    }
  }

  return matches;
}

/**
 * Generate lazy initialization code
 */
function generateLazyInitCode(
  varName: string,
  className: string,
  getterName: string
): string {
  return `let _${varName}: ${className} | null = null;

/**
 * Get ${className} instance (lazy initialization)
 * @returns The ${className} singleton instance
 */
export function ${getterName}(): ${className} {
  if (!_${varName}) {
    _${varName} = new ${className}();
  }
  return _${varName};
}`;
}

/**
 * Generate manual steps for import updates
 */
function generateManualSteps(singletons: SingletonMatch[]): string[] {
  const steps: string[] = [];

  for (const singleton of singletons) {
    const getterName = `get${capitalize(singleton.className)}`;
    steps.push(
      `Update imports: import { ${getterName} } from '...' (was: import { ${singleton.varName} })`
    );
    steps.push(
      `Replace usage: ${getterName}().method() (was: ${singleton.varName}.method())`
    );
  }

  return [...new Set(steps)];
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Find files that need lazy initialization
 */
export function findFilesNeedingLazyInit(srcDir: string = 'src'): string[] {
  const files: string[] = [];
  const baseDir = path.join(process.cwd(), srcDir);
  const singletonPattern = /export\s+const\s+\w+\s*=\s*new\s+\w+\(\);?/;

  function walk(dir: string): void {
    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!entry.startsWith('.') && entry !== 'node_modules') {
            walk(fullPath);
          }
        } else if (stat.isFile() && /\.(ts|tsx)$/.test(entry)) {
          // Skip test files
          if (entry.includes('.test.') || entry.includes('.spec.')) {
            continue;
          }

          const content = fs.readFileSync(fullPath, 'utf-8');
          if (singletonPattern.test(content)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  walk(baseDir);
  return files;
}

/**
 * Analyze a file for singleton patterns
 */
export function analyzeSingletonPatterns(filePath: string): {
  file: string;
  singletons: Array<{
    varName: string;
    className: string;
    line: number;
    getterName: string;
  }>;
} | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const singletons = findSingletonPatterns(content);

  if (singletons.length === 0) {
    return null;
  }

  return {
    file: filePath,
    singletons: singletons.map(s => ({
      varName: s.varName,
      className: s.className,
      line: s.lineNumber,
      getterName: `get${capitalize(s.className)}`,
    })),
  };
}

/**
 * Generate import update suggestions
 */
export function generateImportUpdates(
  content: string,
  oldVarName: string,
  newGetterName: string
): Array<{ line: number; original: string; replacement: string }> {
  const updates: Array<{ line: number; original: string; replacement: string }> = [];

  // Find imports of the old variable
  const importPattern = new RegExp(
    `import\\s*\\{[^}]*\\b${oldVarName}\\b[^}]*\\}\\s*from`,
    'g'
  );

  let match: RegExpExecArray | null;
  importPattern.lastIndex = 0;

  while ((match = importPattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

    const original = match[0];
    const replacement = original.replace(
      new RegExp(`\\b${oldVarName}\\b`),
      newGetterName
    );

    updates.push({
      line: lineNumber,
      original,
      replacement,
    });
  }

  // Find usages of the old variable
  const usagePattern = new RegExp(`\\b${oldVarName}\\s*\\.`, 'g');
  usagePattern.lastIndex = 0;

  while ((match = usagePattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

    updates.push({
      line: lineNumber,
      original: match[0],
      replacement: `${newGetterName}().`,
    });
  }

  return updates;
}

/**
 * Batch generate lazy init fixes for multiple files
 */
export function batchGenerateLazyInitFixes(
  files: string[]
): Array<GeneratedFix | null> {
  return files.map(file => generateLazyInitFix(file));
}

/**
 * Get summary of files needing lazy init
 */
export function getLazyInitSummary(srcDir: string = 'src'): {
  totalFiles: number;
  totalSingletons: number;
  files: Array<{ file: string; count: number }>;
} {
  const filesNeedingFix = findFilesNeedingLazyInit(srcDir);
  const files: Array<{ file: string; count: number }> = [];
  let totalSingletons = 0;

  for (const filePath of filesNeedingFix) {
    const analysis = analyzeSingletonPatterns(filePath);
    if (analysis) {
      const count = analysis.singletons.length;
      files.push({
        file: filePath.replace(process.cwd(), '').replace(/^\//, ''),
        count,
      });
      totalSingletons += count;
    }
  }

  return {
    totalFiles: files.length,
    totalSingletons,
    files: files.sort((a, b) => b.count - a.count),
  };
}

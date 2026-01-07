/**
 * Change Detector for E2E Tools
 *
 * Analyzes git diff to determine which tests are affected by changed files.
 * Enables smart test filtering to only run relevant tests.
 *
 * Part of Phase 7: Token Optimization
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Change analysis result
 */
export interface ChangeAnalysis {
  changedFiles: string[];
  affectedTests: string[];
  skipReason?: string;
  summary: {
    totalChanges: number;
    sourceChanges: number;
    testChanges: number;
    configChanges: number;
  };
}

/**
 * File to test mapping
 */
interface TestMapping {
  sourcePattern: RegExp;
  testPatterns: string[];
}

/**
 * Change Detector class
 */
export class ChangeDetector {
  private testDir: string;
  private srcDir: string;
  private mappings: TestMapping[];

  constructor() {
    this.testDir = path.join(process.cwd(), 'tests/e2e');
    this.srcDir = path.join(process.cwd(), 'src');
    this.mappings = this.initMappings();
  }

  /**
   * Initialize source-to-test mappings
   */
  private initMappings(): TestMapping[] {
    return [
      // Admin console tests
      {
        sourcePattern: /src\/apps\/admin\//,
        testPatterns: ['tests/e2e/specs/admin/**/*.spec.{ts,cjs}'],
      },
      // Desktop/OS tests
      {
        sourcePattern: /src\/apps\/desktop\//,
        testPatterns: ['tests/e2e/specs/os/**/*.spec.{ts,cjs}'],
      },
      // Component tests
      {
        sourcePattern: /src\/components\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Service tests (affect all specs)
      {
        sourcePattern: /src\/services\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // DB/Entity tests
      {
        sourcePattern: /src\/db\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Auth tests
      {
        sourcePattern: /src\/.*auth/i,
        testPatterns: [
          'tests/e2e/specs/auth/**/*.spec.{ts,cjs}',
          'tests/e2e/specs/login/**/*.spec.{ts,cjs}',
        ],
      },
      // API routes
      {
        sourcePattern: /src\/server\/api\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Hooks
      {
        sourcePattern: /src\/hooks\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Utils/lib
      {
        sourcePattern: /src\/lib\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Test files themselves
      {
        sourcePattern: /tests\/e2e\/specs\//,
        testPatterns: [], // Will be handled directly
      },
      // Page objects
      {
        sourcePattern: /tests\/e2e\/pages\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
      // Test utils
      {
        sourcePattern: /tests\/e2e\/utils\//,
        testPatterns: ['tests/e2e/specs/**/*.spec.{ts,cjs}'],
      },
    ];
  }

  /**
   * Analyze changes since a given ref
   */
  analyze(baseRef: string = 'HEAD~1'): ChangeAnalysis {
    const changedFiles = this.getChangedFiles(baseRef);

    // If no changes, skip all tests
    if (changedFiles.length === 0) {
      return {
        changedFiles: [],
        affectedTests: [],
        skipReason: 'no_changes',
        summary: {
          totalChanges: 0,
          sourceChanges: 0,
          testChanges: 0,
          configChanges: 0,
        },
      };
    }

    // Categorize changes
    const sourceChanges = changedFiles.filter(
      (f) => f.startsWith('src/') && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx')
    );
    const testChanges = changedFiles.filter(
      (f) => f.startsWith('tests/e2e/') || f.endsWith('.test.ts') || f.endsWith('.test.tsx')
    );
    const configChanges = changedFiles.filter(
      (f) =>
        f.includes('playwright.config') ||
        f.includes('vite.config') ||
        f.includes('tsconfig') ||
        f === 'package.json'
    );

    // If config changed, run all tests
    if (configChanges.length > 0) {
      const allTests = this.getAllTestFiles();
      return {
        changedFiles,
        affectedTests: allTests,
        summary: {
          totalChanges: changedFiles.length,
          sourceChanges: sourceChanges.length,
          testChanges: testChanges.length,
          configChanges: configChanges.length,
        },
      };
    }

    // Find affected tests
    const affectedTests = this.findAffectedTests(changedFiles);

    // If only non-test, non-source files changed (like docs)
    if (affectedTests.length === 0 && sourceChanges.length === 0 && testChanges.length === 0) {
      return {
        changedFiles,
        affectedTests: [],
        skipReason: 'no_test_changes',
        summary: {
          totalChanges: changedFiles.length,
          sourceChanges: 0,
          testChanges: 0,
          configChanges: 0,
        },
      };
    }

    return {
      changedFiles,
      affectedTests,
      summary: {
        totalChanges: changedFiles.length,
        sourceChanges: sourceChanges.length,
        testChanges: testChanges.length,
        configChanges: configChanges.length,
      },
    };
  }

  /**
   * Get changed files from git
   */
  private getChangedFiles(baseRef: string): string[] {
    try {
      const output = execSync(`git diff --name-only ${baseRef}`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });

      return output
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    } catch {
      // If git fails, return empty (conservative approach)
      return [];
    }
  }

  /**
   * Find tests affected by changed files
   */
  private findAffectedTests(changedFiles: string[]): string[] {
    const affectedSet = new Set<string>();

    for (const file of changedFiles) {
      // If it's a test file directly, add it
      if (file.startsWith('tests/e2e/specs/') && file.match(/\.spec\.(ts|cjs)$/)) {
        affectedSet.add(file);
        continue;
      }

      // Find matching mappings
      for (const mapping of this.mappings) {
        if (mapping.sourcePattern.test(file)) {
          for (const pattern of mapping.testPatterns) {
            const tests = this.globTestFiles(pattern);
            tests.forEach((t) => affectedSet.add(t));
          }
        }
      }
    }

    return Array.from(affectedSet).sort();
  }

  /**
   * Glob test files matching pattern
   */
  private globTestFiles(pattern: string): string[] {
    // Simple glob implementation for common patterns
    const basePath = pattern.split('*')[0];
    const extension = pattern.match(/\.(spec\.\{?[\w,]+\}?)$/)?.[0] || '.spec.ts';

    if (!fs.existsSync(basePath)) {
      return [];
    }

    return this.walkDir(basePath).filter((f) => {
      if (extension.includes('{')) {
        // Handle {ts,cjs} pattern
        const extensions = extension.match(/\{([\w,]+)\}/)?.[1].split(',') || [];
        return extensions.some((ext) => f.endsWith(`.spec.${ext}`));
      }
      return f.endsWith(extension);
    });
  }

  /**
   * Recursively walk directory
   */
  private walkDir(dir: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
      return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.walkDir(fullPath));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Get all test files
   */
  private getAllTestFiles(): string[] {
    const testBase = path.join(process.cwd(), 'tests/e2e/specs');
    return this.walkDir(testBase).filter((f) => f.match(/\.spec\.(ts|cjs)$/));
  }

  /**
   * Format analysis for compact output
   */
  formatCompact(analysis: ChangeAnalysis): string {
    if (analysis.skipReason) {
      return `SKIP:${analysis.skipReason}`;
    }

    const { summary } = analysis;
    const parts: string[] = [
      `CHG:${summary.totalChanges}`,
      `SRC:${summary.sourceChanges}`,
      `TST:${summary.testChanges}`,
    ];

    if (analysis.affectedTests.length > 0) {
      parts.push(`AFF:${analysis.affectedTests.length}`);
    }

    return parts.join('|');
  }

  /**
   * Format analysis as JSON
   */
  formatJSON(analysis: ChangeAnalysis): string {
    if (analysis.skipReason) {
      return JSON.stringify({ skip: analysis.skipReason });
    }

    const output: Record<string, unknown> = {
      changes: analysis.summary.totalChanges,
      affected: analysis.affectedTests.length,
    };

    // Only include test list if reasonable size
    if (analysis.affectedTests.length <= 10) {
      output.tests = analysis.affectedTests.map((t) =>
        t.replace(/^tests\/e2e\/specs\//, '').replace(/\.spec\.(ts|cjs)$/, '')
      );
    } else {
      output.testsPreview = analysis.affectedTests.slice(0, 5).map((t) =>
        t.replace(/^tests\/e2e\/specs\//, '').replace(/\.spec\.(ts|cjs)$/, '')
      );
      output.more = analysis.affectedTests.length - 5;
    }

    return JSON.stringify(output);
  }

  /**
   * Get Playwright grep pattern for affected tests
   */
  getGrepPattern(analysis: ChangeAnalysis): string | null {
    if (analysis.skipReason || analysis.affectedTests.length === 0) {
      return null;
    }

    // For Playwright, we return relative paths from tests/e2e/specs
    return analysis.affectedTests
      .map((t) => t.replace(/^tests\/e2e\//, ''))
      .join('|');
  }

  /**
   * Generate Playwright command for affected tests
   */
  getPlaywrightCommand(analysis: ChangeAnalysis): string {
    if (analysis.skipReason) {
      return `echo "Skipping tests: ${analysis.skipReason}"`;
    }

    if (analysis.affectedTests.length === 0) {
      return 'echo "No affected tests found"';
    }

    // If all tests affected, run normally
    const allTests = this.getAllTestFiles();
    if (analysis.affectedTests.length >= allTests.length * 0.8) {
      return 'npx playwright test';
    }

    // Run specific tests
    const testArgs = analysis.affectedTests
      .slice(0, 20) // Limit to prevent command line too long
      .join(' ');

    return `npx playwright test ${testArgs}`;
  }
}

/**
 * Singleton instance
 */
let changeDetectorInstance: ChangeDetector | null = null;

export function getChangeDetector(): ChangeDetector {
  if (!changeDetectorInstance) {
    changeDetectorInstance = new ChangeDetector();
  }
  return changeDetectorInstance;
}

export const changeDetector = new ChangeDetector();

/**
 * Convenience function to analyze changes
 */
export function analyzeChanges(baseRef: string = 'HEAD~1'): ChangeAnalysis {
  return changeDetector.analyze(baseRef);
}

/**
 * Get compact change summary
 */
export function getCompactChangeSummary(baseRef: string = 'HEAD~1'): string {
  const analysis = analyzeChanges(baseRef);
  return changeDetector.formatCompact(analysis);
}

/**
 * Check if tests should be skipped
 */
export function shouldSkipTests(baseRef: string = 'HEAD~1'): boolean {
  const analysis = analyzeChanges(baseRef);
  return !!analysis.skipReason;
}

/**
 * Fix Applier for E2E Tests
 *
 * Applies generated fixes to source files with backup support.
 * Part of Phase 4: Auto-Fix Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedFix, ApplyResult, ApplyOptions } from '../types/index.js';

/**
 * Fix Applier Class
 *
 * Safely applies generated fixes to source files with:
 * - Automatic backups before modifications
 * - Dry run support for previewing changes
 * - Verification that files haven't changed since analysis
 * - Rollback capability via backup restoration
 */
export class FixApplier {
  private readonly backupDir: string;

  constructor(backupDir: string = '.e2e-cache/backups') {
    this.backupDir = path.join(process.cwd(), backupDir);
  }

  /**
   * Apply a single fix
   */
  apply(fix: GeneratedFix, options: ApplyOptions = {}): ApplyResult {
    const { dryRun = false, backup = true } = options;

    // Verify file exists
    if (!fs.existsSync(fix.file)) {
      return {
        success: false,
        file: fix.file,
        error: 'File not found',
        dryRun,
      };
    }

    // Verify content hasn't changed
    const currentContent = fs.readFileSync(fix.file, 'utf-8');
    if (currentContent !== fix.originalContent) {
      return {
        success: false,
        file: fix.file,
        error: 'File has been modified since analysis',
        dryRun,
      };
    }

    if (dryRun) {
      return {
        success: true,
        file: fix.file,
        changes: fix.changes.length,
        dryRun: true,
        preview: this.generateDiff(fix),
      };
    }

    // Create backup
    let backupPath: string | undefined;
    if (backup) {
      backupPath = this.createBackup(fix.file, currentContent);
    }

    // Apply fix
    try {
      fs.writeFileSync(fix.file, fix.modifiedContent);

      return {
        success: true,
        file: fix.file,
        changes: fix.changes.length,
        dryRun: false,
        backupPath,
      };
    } catch (error) {
      return {
        success: false,
        file: fix.file,
        error: error instanceof Error ? error.message : 'Unknown error',
        dryRun: false,
      };
    }
  }

  /**
   * Apply multiple fixes
   */
  applyAll(fixes: GeneratedFix[], options: ApplyOptions = {}): ApplyResult[] {
    return fixes.map(fix => this.apply(fix, options));
  }

  /**
   * Apply fixes with transaction semantics (all or nothing)
   */
  applyTransaction(
    fixes: GeneratedFix[],
    options: ApplyOptions = {}
  ): { success: boolean; results: ApplyResult[] } {
    const results: ApplyResult[] = [];
    const appliedFixes: Array<{ fix: GeneratedFix; backupPath: string }> = [];

    for (const fix of fixes) {
      const result = this.apply(fix, { ...options, backup: true, dryRun: false });
      results.push(result);

      if (result.success && result.backupPath) {
        appliedFixes.push({ fix, backupPath: result.backupPath });
      } else if (!result.success) {
        // Rollback all applied fixes
        for (const applied of appliedFixes) {
          this.restore(applied.backupPath, applied.fix.file);
        }

        return { success: false, results };
      }
    }

    return { success: true, results };
  }

  /**
   * Create a backup of the original file
   */
  private createBackup(filePath: string, content: string): string {
    const backupPath = this.getBackupPath(filePath);
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    fs.writeFileSync(backupPath, content);
    return backupPath;
  }

  /**
   * Get backup path for a file
   */
  private getBackupPath(filePath: string): string {
    const relativePath = filePath.replace(process.cwd(), '').replace(/^\//, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.backupDir, timestamp, relativePath);
  }

  /**
   * Restore a file from backup
   */
  restore(backupPath: string, targetPath: string): boolean {
    if (!fs.existsSync(backupPath)) {
      return false;
    }

    try {
      const content = fs.readFileSync(backupPath, 'utf-8');
      fs.writeFileSync(targetPath, content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List available backups
   */
  listBackups(): Array<{ timestamp: string; files: string[] }> {
    const backups: Array<{ timestamp: string; files: string[] }> = [];

    if (!fs.existsSync(this.backupDir)) {
      return backups;
    }

    try {
      const timestamps = fs.readdirSync(this.backupDir);

      for (const timestamp of timestamps) {
        const timestampPath = path.join(this.backupDir, timestamp);
        const stat = fs.statSync(timestampPath);

        if (stat.isDirectory()) {
          const files = this.walkBackupDir(timestampPath);
          backups.push({ timestamp, files });
        }
      }
    } catch {
      // Ignore errors
    }

    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Walk backup directory to find files
   */
  private walkBackupDir(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string): void => {
      try {
        const entries = fs.readdirSync(currentDir);

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            walk(fullPath);
          } else {
            files.push(fullPath.replace(dir, ''));
          }
        }
      } catch {
        // Ignore errors
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Restore from most recent backup
   */
  restoreLatest(targetFile: string): boolean {
    const backups = this.listBackups();

    for (const backup of backups) {
      const relativePath = targetFile.replace(process.cwd(), '').replace(/^\//, '');

      if (backup.files.includes('/' + relativePath) || backup.files.includes(relativePath)) {
        const backupPath = path.join(this.backupDir, backup.timestamp, relativePath);
        return this.restore(backupPath, targetFile);
      }
    }

    return false;
  }

  /**
   * Clean old backups (keep last N)
   */
  cleanOldBackups(keepCount: number = 10): number {
    const backups = this.listBackups();
    let deletedCount = 0;

    if (backups.length <= keepCount) {
      return 0;
    }

    const toDelete = backups.slice(keepCount);

    for (const backup of toDelete) {
      const backupPath = path.join(this.backupDir, backup.timestamp);
      try {
        this.removeDir(backupPath);
        deletedCount++;
      } catch {
        // Ignore errors
      }
    }

    return deletedCount;
  }

  /**
   * Recursively remove directory
   */
  private removeDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.removeDir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }

    fs.rmdirSync(dir);
  }

  /**
   * Generate a unified diff for preview
   */
  generateDiff(fix: GeneratedFix): string {
    const originalLines = fix.originalContent.split('\n');
    const modifiedLines = fix.modifiedContent.split('\n');

    const diff: string[] = [];
    const shortFile = fix.file.split('/').slice(-3).join('/');
    diff.push(`--- a/${shortFile}`);
    diff.push(`+++ b/${shortFile}`);

    // Find changed regions
    const changes: Array<{ start: number; end: number }> = [];
    let inChange = false;
    let changeStart = 0;

    for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
      const origLine = originalLines[i];
      const modLine = modifiedLines[i];

      if (origLine !== modLine) {
        if (!inChange) {
          inChange = true;
          changeStart = Math.max(0, i - 3);
        }
      } else if (inChange) {
        changes.push({ start: changeStart, end: Math.min(i + 3, originalLines.length) });
        inChange = false;
      }
    }

    if (inChange) {
      changes.push({
        start: changeStart,
        end: Math.max(originalLines.length, modifiedLines.length),
      });
    }

    // Generate diff hunks
    for (const change of changes) {
      const origCount = Math.min(change.end, originalLines.length) - change.start;
      const modCount = Math.min(change.end, modifiedLines.length) - change.start;

      diff.push(`@@ -${change.start + 1},${origCount} +${change.start + 1},${modCount} @@`);

      for (let i = change.start; i < change.end; i++) {
        const origLine = originalLines[i] ?? '';
        const modLine = modifiedLines[i] ?? '';

        if (origLine === modLine) {
          diff.push(` ${origLine}`);
        } else {
          if (i < originalLines.length && origLine !== undefined) {
            diff.push(`-${origLine}`);
          }
          if (i < modifiedLines.length && modLine !== undefined) {
            diff.push(`+${modLine}`);
          }
        }
      }
    }

    return diff.join('\n');
  }

  /**
   * Get compact diff summary
   */
  getCompactSummary(fixes: GeneratedFix[]): string {
    const lines: string[] = [];

    for (const fix of fixes) {
      const shortFile = fix.file.split('/').pop() || fix.file;
      lines.push(`${shortFile}: ${fix.changes.length} changes (${fix.templateName})`);
    }

    return lines.join('\n');
  }
}

// Lazy singleton instance
let _fixApplier: FixApplier | null = null;

/**
 * Get the singleton FixApplier instance
 */
export function getFixApplier(): FixApplier {
  if (!_fixApplier) {
    _fixApplier = new FixApplier();
  }
  return _fixApplier;
}

/**
 * Apply a fix (convenience function)
 */
export function applyFix(fix: GeneratedFix, options?: ApplyOptions): ApplyResult {
  return getFixApplier().apply(fix, options);
}

/**
 * Apply all fixes (convenience function)
 */
export function applyAllFixes(
  fixes: GeneratedFix[],
  options?: ApplyOptions
): ApplyResult[] {
  return getFixApplier().applyAll(fixes, options);
}

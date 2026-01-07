/**
 * Error Fingerprinting for E2E Tests
 *
 * Generates unique fingerprints for errors to detect duplicates
 * and track recurring issues across test runs.
 */

import { createHash } from 'crypto';
import type { TestError, ErrorCategory } from '../types';

/**
 * Error fingerprint with hash and features
 */
export interface ErrorFingerprint {
  hash: string;
  shortHash: string;
  features: string[];
  category: ErrorCategory;
  file?: string;
  normalizedMessage: string;
}

/**
 * Grouped errors by fingerprint
 */
export interface ErrorGroup {
  fingerprint: ErrorFingerprint;
  errors: TestError[];
  count: number;
  testNames: string[];
}

/**
 * Deduplication result
 */
export interface DeduplicationResult {
  unique: TestError[];
  groups: ErrorGroup[];
  totalCount: number;
  uniqueCount: number;
  duplicateCount: number;
  deduplicationRatio: number;
}

/**
 * Error Fingerprinter Class
 *
 * Generates consistent fingerprints for error deduplication
 * by normalizing variable parts like line numbers and timestamps.
 */
export class ErrorFingerprinter {
  /**
   * Generate a fingerprint for an error
   */
  fingerprint(error: TestError): ErrorFingerprint {
    const normalizedMessage = this.normalizeMessage(error.message);
    const features = this.extractFeatures(error, normalizedMessage);

    // Generate hash from features
    const hash = createHash('sha256')
      .update(features.join('|'))
      .digest('hex');

    return {
      hash,
      shortHash: hash.substring(0, 8),
      features,
      category: error.category,
      file: error.file,
      normalizedMessage,
    };
  }

  /**
   * Extract identifying features from an error
   */
  private extractFeatures(error: TestError, normalizedMessage: string): string[] {
    const features: string[] = [
      error.category,
      normalizedMessage,
    ];

    // Add file (basename only for portability)
    if (error.file) {
      const basename = error.file.split('/').pop() || error.file;
      features.push(basename);
    }

    // Add normalized stack frames (first 3)
    if (error.stack) {
      const normalizedStack = this.normalizeStack(error.stack)
        .slice(0, 3);
      features.push(...normalizedStack);
    }

    return features;
  }

  /**
   * Normalize error message by removing variable parts
   */
  private normalizeMessage(message: string): string {
    return message
      // Remove line:column numbers
      .replace(/:\d+:\d+/g, ':X:X')
      // Remove UUIDs
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID')
      // Remove ISO timestamps
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, 'TIMESTAMP')
      // Remove milliseconds
      .replace(/\d+ms/g, 'Xms')
      // Remove timeout durations
      .replace(/Timeout \d+ms/g, 'Timeout Xms')
      // Remove port numbers
      .replace(/localhost:\d+/g, 'localhost:PORT')
      // Remove numeric IDs
      .replace(/\bid[=:]\s*\d+/gi, 'id=N')
      // Remove memory addresses
      .replace(/0x[a-f0-9]+/gi, 'ADDR')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize stack trace for fingerprinting
   */
  private normalizeStack(stack: string): string[] {
    const lines = stack.split('\n');
    const frames: string[] = [];

    for (const line of lines) {
      // Extract function name and file from stack frame
      const match = line.match(/at\s+(?:(.+?)\s+)?\(?([^:]+?)(?::\d+:\d+)?\)?$/);
      if (match) {
        const [, fn, file] = match;
        const funcName = fn || 'anonymous';
        const fileName = file?.split('/').pop() || 'unknown';
        frames.push(`${funcName}@${fileName}`);
      }
    }

    return frames;
  }

  /**
   * Group errors by fingerprint
   */
  groupByFingerprint(
    errors: TestError[],
    testNames?: string[]
  ): Map<string, ErrorGroup> {
    const groups = new Map<string, ErrorGroup>();

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const fp = this.fingerprint(error);
      const testName = testNames?.[i] || `test-${i}`;

      if (groups.has(fp.hash)) {
        const group = groups.get(fp.hash)!;
        group.errors.push(error);
        group.count++;
        group.testNames.push(testName);
      } else {
        groups.set(fp.hash, {
          fingerprint: fp,
          errors: [error],
          count: 1,
          testNames: [testName],
        });
      }
    }

    return groups;
  }

  /**
   * Deduplicate errors, returning unique errors and statistics
   */
  deduplicate(
    errors: TestError[],
    testNames?: string[]
  ): DeduplicationResult {
    const groups = this.groupByFingerprint(errors, testNames);

    // Keep first occurrence of each unique error
    const unique: TestError[] = [];
    const groupList: ErrorGroup[] = [];

    for (const group of groups.values()) {
      unique.push(group.errors[0]);
      groupList.push(group);
    }

    // Sort groups by count descending
    groupList.sort((a, b) => b.count - a.count);

    const totalCount = errors.length;
    const uniqueCount = unique.length;
    const duplicateCount = totalCount - uniqueCount;
    const deduplicationRatio = totalCount > 0
      ? Math.round((duplicateCount / totalCount) * 100) / 100
      : 0;

    return {
      unique,
      groups: groupList,
      totalCount,
      uniqueCount,
      duplicateCount,
      deduplicationRatio,
    };
  }

  /**
   * Compare two errors for similarity
   */
  areSimilar(error1: TestError, error2: TestError): boolean {
    const fp1 = this.fingerprint(error1);
    const fp2 = this.fingerprint(error2);
    return fp1.hash === fp2.hash;
  }

  /**
   * Get similarity score between two errors (0-1)
   */
  getSimilarityScore(error1: TestError, error2: TestError): number {
    const fp1 = this.fingerprint(error1);
    const fp2 = this.fingerprint(error2);

    if (fp1.hash === fp2.hash) {
      return 1.0;
    }

    // Compare features
    const set1 = new Set(fp1.features);
    const set2 = new Set(fp2.features);

    const intersection = [...set1].filter(f => set2.has(f)).length;
    const union = new Set([...set1, ...set2]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Find clusters of similar errors
   */
  findClusters(errors: TestError[], threshold = 0.7): TestError[][] {
    const clusters: TestError[][] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < errors.length; i++) {
      if (assigned.has(i)) continue;

      const cluster: TestError[] = [errors[i]];
      assigned.add(i);

      for (let j = i + 1; j < errors.length; j++) {
        if (assigned.has(j)) continue;

        const similarity = this.getSimilarityScore(errors[i], errors[j]);
        if (similarity >= threshold) {
          cluster.push(errors[j]);
          assigned.add(j);
        }
      }

      clusters.push(cluster);
    }

    // Sort clusters by size descending
    clusters.sort((a, b) => b.length - a.length);

    return clusters;
  }

  /**
   * Get compact deduplication summary
   */
  getCompactSummary(result: DeduplicationResult): string {
    if (result.totalCount === 0) {
      return 'NO_ERRORS';
    }

    if (result.duplicateCount === 0) {
      return `${result.uniqueCount}_UNIQUE`;
    }

    return `${result.uniqueCount}U/${result.totalCount}T|${Math.round(result.deduplicationRatio * 100)}%DUP`;
  }
}

// Lazy singleton instance
let _fingerprinter: ErrorFingerprinter | null = null;

/**
 * Get the singleton ErrorFingerprinter instance
 */
export function getFingerprinter(): ErrorFingerprinter {
  if (!_fingerprinter) {
    _fingerprinter = new ErrorFingerprinter();
  }
  return _fingerprinter;
}

/**
 * Fingerprint a single error (convenience function)
 */
export function fingerprintError(error: TestError): ErrorFingerprint {
  return getFingerprinter().fingerprint(error);
}

/**
 * Deduplicate errors (convenience function)
 */
export function deduplicateErrors(
  errors: TestError[],
  testNames?: string[]
): DeduplicationResult {
  return getFingerprinter().deduplicate(errors, testNames);
}

/**
 * Check if two errors are similar (convenience function)
 */
export function areErrorsSimilar(error1: TestError, error2: TestError): boolean {
  return getFingerprinter().areSimilar(error1, error2);
}

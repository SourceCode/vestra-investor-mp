/**
 * Pattern Matcher for E2E Test Errors
 *
 * Matches errors against known patterns from error-patterns.json
 * with confidence scoring for accurate categorization.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { TestError, ErrorCategory } from '../types';

/**
 * Pattern definition from error-patterns.json
 */
export interface ErrorPatternDef {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  patterns: string[];
  root_cause: string;
  import_trace_required: boolean;
  fix_available: boolean;
  fix_template?: string;
  suggestions?: string[];
  semantic_code?: string;
  documentation?: string;
}

/**
 * Result of matching an error against a pattern
 */
export interface PatternMatch {
  patternId: string;
  patternName: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  rootCause: string;
  fixAvailable: boolean;
  fixTemplate?: string;
  suggestions: string[];
  requiresImportTrace: boolean;
  semanticCode?: string;
}

/**
 * Complete match result including original error and all matches
 */
export interface PatternMatchResult {
  error: TestError;
  matches: PatternMatch[];
  bestMatch: PatternMatch | null;
  category: ErrorCategory;
  confidence: number;
}

/**
 * Pattern database loaded from JSON
 */
interface PatternDatabase {
  $schema?: string;
  version?: string;
  lastUpdated?: string;
  patterns: ErrorPatternDef[];
}

/**
 * Pattern Matcher Class
 *
 * Loads error patterns from JSON and matches errors with confidence scoring.
 */
export class PatternMatcher {
  private patterns: ErrorPatternDef[];
  private compiledPatterns: Map<string, RegExp[]>;

  constructor() {
    // ESM-compatible __dirname equivalent
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const patternsPath = join(__dirname, '../patterns/error-patterns.json');
    const data = readFileSync(patternsPath, 'utf-8');
    const db: PatternDatabase = JSON.parse(data);
    this.patterns = db.patterns;

    // Pre-compile regex patterns for performance
    this.compiledPatterns = new Map();
    for (const pattern of this.patterns) {
      const regexes = pattern.patterns.map(p => {
        try {
          return new RegExp(p, 'i');
        } catch {
          // If regex fails to compile, use escaped literal
          return new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }
      });
      this.compiledPatterns.set(pattern.id, regexes);
    }
  }

  /**
   * Match a test error against known patterns
   */
  match(error: TestError): PatternMatchResult {
    const matches: PatternMatch[] = [];
    const errorText = this.buildErrorText(error);

    for (const pattern of this.patterns) {
      const confidence = this.calculateConfidence(errorText, pattern);

      if (confidence > 0.3) {
        matches.push({
          patternId: pattern.id,
          patternName: pattern.name,
          category: pattern.category,
          severity: pattern.severity,
          confidence,
          rootCause: pattern.root_cause,
          fixAvailable: pattern.fix_available,
          fixTemplate: pattern.fix_template,
          suggestions: pattern.suggestions || [],
          requiresImportTrace: pattern.import_trace_required,
          semanticCode: pattern.semantic_code,
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = matches[0] || null;

    return {
      error,
      matches,
      bestMatch,
      category: this.mapToErrorCategory(bestMatch?.category || 'unknown'),
      confidence: bestMatch?.confidence || 0,
    };
  }

  /**
   * Build full error text from TestError for matching
   */
  private buildErrorText(error: TestError): string {
    const parts: string[] = [error.message];

    if (error.stack) {
      parts.push(error.stack);
    }

    if (error.snippet) {
      parts.push(error.snippet);
    }

    if (error.domSnapshot) {
      parts.push(error.domSnapshot);
    }

    return parts.join('\n');
  }

  /**
   * Calculate confidence score for a pattern match
   */
  private calculateConfidence(errorText: string, pattern: ErrorPatternDef): number {
    const regexes = this.compiledPatterns.get(pattern.id);
    if (!regexes || regexes.length === 0) {
      return 0;
    }

    let matchedPatterns = 0;
    let matchStrength = 0;

    for (const regex of regexes) {
      const match = errorText.match(regex);
      if (match) {
        matchedPatterns++;
        // Longer matches get higher strength
        matchStrength += match[0].length / errorText.length;
      }
    }

    if (matchedPatterns === 0) {
      return 0;
    }

    // Base confidence from pattern matches
    const matchRatio = matchedPatterns / regexes.length;

    // Combined confidence score
    let confidence = matchRatio * 0.7 + Math.min(matchStrength, 0.3);

    // Boost confidence if multiple patterns match
    if (matchedPatterns > 1) {
      confidence = Math.min(confidence * 1.2, 1.0);
    }

    // Boost for critical severity patterns (they're more specific)
    if (pattern.severity === 'critical' && matchedPatterns >= 1) {
      confidence = Math.min(confidence * 1.1, 1.0);
    }

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Map pattern category to ErrorCategory type
   */
  private mapToErrorCategory(category: string): ErrorCategory {
    const mapping: Record<string, ErrorCategory> = {
      browser_compat: 'browser_compat',
      element_not_found: 'element_not_found',
      timeout: 'timeout',
      assertion: 'assertion',
      network: 'network',
      server_error: 'server_error',
      infrastructure: 'network',
      runtime_error: 'server_error',
    };

    return mapping[category] || 'unknown';
  }

  /**
   * Batch match multiple errors
   */
  matchAll(errors: TestError[]): PatternMatchResult[] {
    return errors.map(error => this.match(error));
  }

  /**
   * Get all patterns for a category
   */
  getPatternsByCategory(category: string): ErrorPatternDef[] {
    return this.patterns.filter(p => p.category === category);
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): ErrorPatternDef | undefined {
    return this.patterns.find(p => p.id === id);
  }

  /**
   * Get all fixable patterns
   */
  getFixablePatterns(): ErrorPatternDef[] {
    return this.patterns.filter(p => p.fix_available);
  }

  /**
   * Get patterns by severity
   */
  getPatternsBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): ErrorPatternDef[] {
    return this.patterns.filter(p => p.severity === severity);
  }

  /**
   * Add a new pattern dynamically (for learning)
   */
  addPattern(pattern: ErrorPatternDef): void {
    this.patterns.push(pattern);
    const regexes = pattern.patterns.map(p => {
      try {
        return new RegExp(p, 'i');
      } catch {
        return new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
    });
    this.compiledPatterns.set(pattern.id, regexes);
  }

  /**
   * Get total pattern count
   */
  get patternCount(): number {
    return this.patterns.length;
  }

  /**
   * Get categories with pattern counts
   */
  getCategories(): Map<string, number> {
    const categories = new Map<string, number>();
    for (const pattern of this.patterns) {
      categories.set(pattern.category, (categories.get(pattern.category) || 0) + 1);
    }
    return categories;
  }
}

// Lazy singleton instance
let _patternMatcher: PatternMatcher | null = null;

/**
 * Get the singleton PatternMatcher instance
 */
export function getPatternMatcher(): PatternMatcher {
  if (!_patternMatcher) {
    _patternMatcher = new PatternMatcher();
  }
  return _patternMatcher;
}

/**
 * Match a single error against patterns (convenience function)
 */
export function matchError(error: TestError): PatternMatchResult {
  return getPatternMatcher().match(error);
}

/**
 * Match multiple errors against patterns (convenience function)
 */
export function matchErrors(errors: TestError[]): PatternMatchResult[] {
  return getPatternMatcher().matchAll(errors);
}

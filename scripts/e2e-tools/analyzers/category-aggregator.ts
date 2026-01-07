/**
 * Category Aggregator for E2E Test Errors
 *
 * Aggregates pattern match results by category to identify
 * systemic issues and generate prioritized action items.
 */

import type { ErrorCategory } from '../types';
import type { PatternMatchResult, PatternMatch } from './pattern-matcher';

/**
 * Summary of errors for a single category
 */
export interface CategorySummary {
  category: string;
  semanticCode: string;
  count: number;
  fixableCount: number;
  primaryRootCause: string;
  affectedFiles: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  avgConfidence: number;
  matches: PatternMatchResult[];
  suggestions: string[];
}

/**
 * Complete aggregated categories result
 */
export interface AggregatedCategories {
  totalErrors: number;
  totalCategories: number;
  fixableErrors: number;
  unfixableErrors: number;
  categories: CategorySummary[];
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Action item generated from category analysis
 */
export interface CategoryActionItem {
  priority: number;
  type: 'auto_fix' | 'manual_fix' | 'investigate';
  category: string;
  semanticCode: string;
  description: string;
  command?: string;
  rootCause?: string;
  affectedFiles: string[];
  estimatedImpact: number;
  suggestions: string[];
}

/**
 * Semantic codes for categories
 */
const CATEGORY_CODES: Record<string, string> = {
  browser_compat: 'BC',
  element_not_found: 'NF',
  timeout: 'TO',
  assertion: 'AE',
  network: 'NE',
  server_error: 'SE',
  infrastructure: 'IF',
  runtime_error: 'RE',
  unknown: 'UK',
};

/**
 * Category Aggregator Class
 *
 * Groups pattern match results by category and generates actionable summaries.
 */
export class CategoryAggregator {
  /**
   * Aggregate pattern matches by category
   */
  aggregate(matches: PatternMatchResult[]): AggregatedCategories {
    const categories = new Map<string, PatternMatchResult[]>();

    // Group by category
    for (const match of matches) {
      const category = match.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(match);
    }

    const summaries: CategorySummary[] = [];
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const [category, categoryMatches] of categories) {
      const summary = this.buildCategorySummary(category, categoryMatches);
      summaries.push(summary);

      // Count by severity
      bySeverity[summary.severity]++;
    }

    // Sort by count descending, then by severity
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    summaries.sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff !== 0) return countDiff;
      return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
    });

    const fixableErrors = summaries.reduce((sum, s) => sum + s.fixableCount, 0);

    return {
      totalErrors: matches.length,
      totalCategories: summaries.length,
      fixableErrors,
      unfixableErrors: matches.length - fixableErrors,
      categories: summaries,
      bySeverity,
    };
  }

  /**
   * Build summary for a single category
   */
  private buildCategorySummary(
    category: string,
    matches: PatternMatchResult[]
  ): CategorySummary {
    // Count fixable errors
    const fixableCount = matches.filter(m => m.bestMatch?.fixAvailable).length;

    // Find most common root cause
    const rootCauses = matches
      .filter(m => m.bestMatch?.rootCause)
      .map(m => m.bestMatch!.rootCause);

    const rootCauseCounts = new Map<string, number>();
    for (const rc of rootCauses) {
      rootCauseCounts.set(rc, (rootCauseCounts.get(rc) || 0) + 1);
    }

    const primaryRootCause = [...rootCauseCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown - requires investigation';

    // Collect unique affected files
    const affectedFiles = [...new Set(
      matches
        .map(m => m.error.file)
        .filter((f): f is string => f !== undefined)
    )];

    // Get highest severity in category
    const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    const highestSeverity = matches
      .map(m => m.bestMatch?.severity || 'low')
      .sort((a, b) => severities.indexOf(a as 'critical' | 'high' | 'medium' | 'low') - severities.indexOf(b as 'critical' | 'high' | 'medium' | 'low'))[0] as 'critical' | 'high' | 'medium' | 'low';

    // Calculate average confidence
    const avgConfidence = matches.length > 0
      ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
      : 0;

    // Collect unique suggestions
    const allSuggestions = matches
      .flatMap(m => m.bestMatch?.suggestions || [])
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .slice(0, 5);

    return {
      category,
      semanticCode: CATEGORY_CODES[category] || 'UK',
      count: matches.length,
      fixableCount,
      primaryRootCause,
      affectedFiles,
      severity: highestSeverity,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      matches,
      suggestions: allSuggestions,
    };
  }

  /**
   * Generate prioritized action items from aggregated categories
   */
  generateActionItems(aggregated: AggregatedCategories): CategoryActionItem[] {
    const actions: CategoryActionItem[] = [];

    for (const category of aggregated.categories) {
      if (category.fixableCount > 0) {
        actions.push({
          priority: this.calculatePriority(category.severity, category.count),
          type: 'auto_fix',
          category: category.category,
          semanticCode: category.semanticCode,
          description: `Fix ${category.fixableCount} ${category.category.replace(/_/g, ' ')} error${category.fixableCount !== 1 ? 's' : ''}`,
          command: `npm run e2e:fix -- --pattern=${category.category}`,
          affectedFiles: category.affectedFiles,
          estimatedImpact: category.count,
          suggestions: category.suggestions,
        });
      } else if (category.count > 0) {
        actions.push({
          priority: this.calculatePriority(category.severity, category.count),
          type: category.severity === 'critical' ? 'investigate' : 'manual_fix',
          category: category.category,
          semanticCode: category.semanticCode,
          description: `Investigate ${category.count} ${category.category.replace(/_/g, ' ')} error${category.count !== 1 ? 's' : ''}`,
          rootCause: category.primaryRootCause,
          affectedFiles: category.affectedFiles,
          estimatedImpact: category.count,
          suggestions: category.suggestions,
        });
      }
    }

    // Sort by priority (lower = higher priority)
    actions.sort((a, b) => a.priority - b.priority);

    return actions;
  }

  /**
   * Calculate priority score (lower = higher priority)
   */
  private calculatePriority(severity: string, count: number): number {
    const severityScore: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    const base = severityScore[severity] || 4;

    // Factor in count: more errors = higher priority
    // Scale: 1 error adds 0, 10+ errors subtract 0.5
    const countFactor = Math.min(count / 20, 0.5);

    return Math.round((base - countFactor) * 100) / 100;
  }

  /**
   * Generate compact status string
   */
  getCompactStatus(aggregated: AggregatedCategories): string {
    if (aggregated.totalErrors === 0) {
      return 'P:0/0';
    }

    const catCodes = aggregated.categories
      .map(c => {
        const fixMarker = c.fixableCount > 0 ? '@AF' : '';
        return `${c.semanticCode}:${c.count}${fixMarker}`;
      })
      .join('|');

    const statusChar = aggregated.fixableErrors > 0 ? 'X' : 'F';
    return `${statusChar}:${aggregated.totalErrors}|${catCodes}`;
  }

  /**
   * Get best action for AI agent
   */
  getBestAction(aggregated: AggregatedCategories): CategoryActionItem | null {
    const actions = this.generateActionItems(aggregated);
    return actions[0] || null;
  }

  /**
   * Get summary suitable for AI consumption
   */
  getAISummary(aggregated: AggregatedCategories): {
    status: string;
    categories: Record<string, { count: number; fixable: boolean; rootCause: string }>;
    recommendedAction: { type: string; command?: string } | null;
  } {
    const status = this.getCompactStatus(aggregated);

    const categories: Record<string, { count: number; fixable: boolean; rootCause: string }> = {};
    for (const cat of aggregated.categories) {
      categories[cat.category] = {
        count: cat.count,
        fixable: cat.fixableCount > 0,
        rootCause: cat.primaryRootCause,
      };
    }

    const bestAction = this.getBestAction(aggregated);
    const recommendedAction = bestAction ? {
      type: bestAction.type,
      command: bestAction.command,
    } : null;

    return {
      status,
      categories,
      recommendedAction,
    };
  }
}

// Lazy singleton instance
let _categoryAggregator: CategoryAggregator | null = null;

/**
 * Get the singleton CategoryAggregator instance
 */
export function getCategoryAggregator(): CategoryAggregator {
  if (!_categoryAggregator) {
    _categoryAggregator = new CategoryAggregator();
  }
  return _categoryAggregator;
}

/**
 * Aggregate pattern matches (convenience function)
 */
export function aggregateByCategory(matches: PatternMatchResult[]): AggregatedCategories {
  return getCategoryAggregator().aggregate(matches);
}

/**
 * Generate action items (convenience function)
 */
export function generateActions(matches: PatternMatchResult[]): CategoryActionItem[] {
  const aggregator = getCategoryAggregator();
  const aggregated = aggregator.aggregate(matches);
  return aggregator.generateActionItems(aggregated);
}

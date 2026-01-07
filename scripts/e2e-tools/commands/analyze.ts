/**
 * Analysis Command
 *
 * Analyzes the last test run results, identifies root causes,
 * and generates AI-optimized summaries using pattern matching.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  AnalysisResult,
  AIAgentSummary,
  RootCause,
  SuggestedFix,
  ErrorCategory,
  TestError,
  EnhancedAnalysisResult,
} from '../types';
import { getPatternMatcher, type PatternMatchResult } from '../analyzers/pattern-matcher';
import { getCategoryAggregator, type AggregatedCategories, type CategoryActionItem } from '../analyzers/category-aggregator';
import { getFingerprinter, type DeduplicationResult } from '../analyzers/fingerprint';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const RESULTS_FILE = path.join(CACHE_DIR, 'last-run.json');
const ANALYSIS_FILE = path.join(CACHE_DIR, 'analysis.json');

/**
 * Load the last test run results from cache
 */
export function loadLastRun(): AnalysisResult | null {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('No test results found. Run: npm run e2e:run');
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse last run results:', error);
    return null;
  }
}

/**
 * Run enhanced analysis with pattern matching (Phase 2)
 */
export function runEnhancedAnalysis(): EnhancedAnalysisResult | null {
  const analysis = loadLastRun();
  if (!analysis) return null;

  // Validate analysis has required data
  if (!analysis.results || !analysis.summary) {
    console.error('Invalid analysis data. Run: npm run e2e:run');
    return null;
  }

  console.log('\n🔍 Running Enhanced Analysis (Phase 2)...\n');

  // Extract errors from results
  const errors: TestError[] = (analysis.results || [])
    .filter(r => r.error)
    .map(r => r.error!);

  const testNames = analysis.results
    .filter(r => r.error)
    .map(r => r.name);

  // Step 1: Deduplicate errors
  const fingerprinter = getFingerprinter();
  const deduplication = fingerprinter.deduplicate(errors, testNames);

  console.log(`  📊 Total Errors: ${deduplication.totalCount}`);
  console.log(`  🔢 Unique Errors: ${deduplication.uniqueCount}`);
  console.log(`  ♻️  Duplicates: ${deduplication.duplicateCount} (${Math.round(deduplication.deduplicationRatio * 100)}%)\n`);

  // Step 2: Match patterns against unique errors
  const patternMatcher = getPatternMatcher();
  const patternMatches = patternMatcher.matchAll(deduplication.unique);

  const matchedCount = patternMatches.filter(m => m.bestMatch !== null).length;
  console.log(`  🎯 Pattern Matches: ${matchedCount}/${deduplication.uniqueCount} (${Math.round(matchedCount / Math.max(deduplication.uniqueCount, 1) * 100)}%)\n`);

  // Step 3: Aggregate by category
  const categoryAggregator = getCategoryAggregator();
  const aggregatedCategories = categoryAggregator.aggregate(patternMatches);

  // Step 4: Generate action items
  const actionItems = categoryAggregator.generateActionItems(aggregatedCategories);

  // Build enhanced analysis result
  const enhancedAnalysis: EnhancedAnalysisResult = {
    ...analysis,
    patternMatches,
    aggregatedCategories,
    actionItems,
    deduplication,
    rootCauses: generateRootCauses(aggregatedCategories),
    suggestedFixes: generateSuggestedFixes(actionItems),
    nextSteps: generateNextSteps(aggregatedCategories, actionItems),
  };

  // Save enhanced analysis
  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(enhancedAnalysis, null, 2));

  // Print summary
  printEnhancedSummary(enhancedAnalysis);

  return enhancedAnalysis;
}

/**
 * Generate root causes from aggregated categories
 */
function generateRootCauses(aggregated: AggregatedCategories): RootCause[] {
  return aggregated.categories.map((cat, index) => ({
    id: `rc_${cat.category}_${index}`,
    category: cat.category as ErrorCategory,
    description: cat.primaryRootCause,
    affectedTests: cat.count,
    file: cat.affectedFiles[0],
    fixStrategy: cat.fixableCount > 0 ? 'lazy_init' : 'manual',
  }));
}

/**
 * Generate suggested fixes from action items
 */
function generateSuggestedFixes(actionItems: CategoryActionItem[]): SuggestedFix[] {
  return actionItems
    .filter(a => a.type === 'auto_fix')
    .map((action, index) => ({
      id: `fix_${action.category}_${index}`,
      priority: Math.round(action.priority),
      rootCauseId: `rc_${action.category}_0`,
      type: 'lazy_init' as const,
      file: action.affectedFiles[0] || 'unknown',
      description: action.description,
      command: action.command,
      confidence: 0.9,
    }));
}

/**
 * Generate next steps from analysis
 */
function generateNextSteps(
  aggregated: AggregatedCategories,
  actionItems: CategoryActionItem[]
): string[] {
  const steps: string[] = [];

  if (aggregated.totalErrors === 0) {
    steps.push('✓ All tests passing! Ready to commit.');
    return steps;
  }

  // Add fixable items first
  const fixableActions = actionItems.filter(a => a.type === 'auto_fix');
  if (fixableActions.length > 0) {
    steps.push(`Run: ${fixableActions[0].command}`);
  }

  // Add investigation items
  const investigateActions = actionItems.filter(a => a.type === 'investigate');
  if (investigateActions.length > 0) {
    steps.push(`Investigate: ${investigateActions[0].description}`);
  }

  // Category-specific suggestions
  const bcCat = aggregated.categories.find(c => c.category === 'browser_compat');
  if (bcCat && bcCat.count > 0) {
    steps.push('Browser compat: Check for TypeORM/Node.js imports in browser code');
  }

  const seCat = aggregated.categories.find(c => c.category === 'server_error');
  if (seCat && seCat.count > 0) {
    steps.push('Server errors: Check backend logs for 500 errors');
  }

  const nfCat = aggregated.categories.find(c => c.category === 'element_not_found');
  if (nfCat && nfCat.count > 0) {
    steps.push('Element errors: Review DOM snapshots in test-results/*/error-context.md');
  }

  steps.push('Run: npm run e2e:run to re-test');

  return steps.slice(0, 5);
}

/**
 * Print enhanced analysis summary
 */
function printEnhancedSummary(analysis: EnhancedAnalysisResult): void {
  console.log('📊 Analysis Summary');
  console.log('═'.repeat(50));
  console.log(`  Total: ${analysis.summary.total} | Pass: ${analysis.summary.passed} | Fail: ${analysis.summary.failed}`);
  console.log(`  Duration: ${analysis.summary.duration}`);
  console.log('');

  if (analysis.aggregatedCategories && analysis.aggregatedCategories.categories.length > 0) {
    console.log('📁 Errors by Category');
    console.log('─'.repeat(50));

    for (const cat of analysis.aggregatedCategories.categories) {
      const fixBadge = cat.fixableCount > 0 ? ' [FIX AVAILABLE]' : '';
      const sevBadge = cat.severity === 'critical' ? ' ⚠️' : '';
      console.log(`  ${cat.semanticCode} ${cat.category}: ${cat.count} errors${fixBadge}${sevBadge}`);
      console.log(`     Root cause: ${cat.primaryRootCause}`);
      console.log(`     Confidence: ${Math.round(cat.avgConfidence * 100)}%`);
      if (cat.affectedFiles.length > 0) {
        console.log(`     Files: ${cat.affectedFiles.slice(0, 2).join(', ')}${cat.affectedFiles.length > 2 ? '...' : ''}`);
      }
      console.log('');
    }
  }

  if (analysis.actionItems && analysis.actionItems.length > 0) {
    console.log('⚡ Recommended Actions');
    console.log('─'.repeat(50));

    for (const action of analysis.actionItems.slice(0, 3)) {
      const typeIcon = action.type === 'auto_fix' ? '🔧' : action.type === 'investigate' ? '🔍' : '📝';
      console.log(`  ${typeIcon} [P${action.priority.toFixed(1)}] ${action.description}`);
      if (action.command) {
        console.log(`     Run: ${action.command}`);
      }
    }
    console.log('');
  }

  if (analysis.nextSteps && analysis.nextSteps.length > 0) {
    console.log('📋 Next Steps');
    console.log('─'.repeat(50));
    for (const step of analysis.nextSteps) {
      console.log(`  → ${step}`);
    }
    console.log('');
  }

  console.log('💾 Full analysis saved to: .e2e-cache/analysis.json\n');
}

/**
 * Analyze test results to identify root causes (legacy)
 */
export function analyzeRootCauses(analysis: AnalysisResult): RootCause[] {
  const rootCauses: RootCause[] = [];

  // Analyze browser compatibility issues
  const browserCompatErrors = analysis.results.filter(
    r => r.error?.category === 'browser_compat'
  );

  if (browserCompatErrors.length > 0) {
    const sourceFiles = new Map<string, { count: number; tests: string[] }>();

    for (const result of browserCompatErrors) {
      const file = result.error?.file;
      if (file) {
        const existing = sourceFiles.get(file) || { count: 0, tests: [] };
        existing.count++;
        existing.tests.push(result.name);
        sourceFiles.set(file, existing);
      }
    }

    const sortedFiles = [...sourceFiles.entries()].sort((a, b) => b[1].count - a[1].count);

    for (const [file, info] of sortedFiles) {
      rootCauses.push({
        id: `browser_compat_${file.replace(/[^a-z0-9]/gi, '_')}`,
        category: 'browser_compat',
        description: `Browser-incompatible code in ${path.basename(file)}`,
        affectedTests: info.count,
        file,
        fixStrategy: 'lazy_init',
      });
    }

    if (sortedFiles.length === 0) {
      rootCauses.push({
        id: 'browser_compat_general',
        category: 'browser_compat',
        description: 'Browser-incompatible code detected (likely TypeORM or Node.js APIs)',
        affectedTests: browserCompatErrors.length,
        fixStrategy: 'lazy_init',
      });
    }
  }

  return rootCauses;
}

/**
 * Generate fix suggestions based on root causes
 */
export function generateFixes(rootCauses: RootCause[]): SuggestedFix[] {
  const fixes: SuggestedFix[] = [];

  for (const cause of rootCauses) {
    if (cause.category === 'browser_compat') {
      if (cause.file) {
        fixes.push({
          id: `fix_${cause.id}`,
          priority: 1,
          rootCauseId: cause.id,
          type: 'lazy_init',
          file: cause.file,
          description: `Convert eager singleton to lazy initialization in ${path.basename(cause.file)}`,
          command: `npm run e2e:fix -- --file=${cause.file} --type=lazy_init`,
          confidence: 0.9,
        });
      }
    }
  }

  fixes.sort((a, b) => a.priority - b.priority);

  return fixes;
}

/**
 * Generate AI-optimized summary for Claude consumption
 */
export function generateAISummary(analysis: EnhancedAnalysisResult): AIAgentSummary {
  const categories: AIAgentSummary['categories'] = {};

  if (analysis.aggregatedCategories) {
    for (const cat of analysis.aggregatedCategories.categories) {
      categories[cat.category] = {
        count: cat.count,
        root_cause: cat.primaryRootCause,
        fix_available: cat.fixableCount > 0,
        fix_command: analysis.actionItems?.find(a => a.category === cat.category)?.command,
      };
    }
  }

  const actionRequired = (analysis.actionItems || []).map(action => ({
    priority: Math.round(action.priority),
    type: action.category as ErrorCategory,
    file: action.affectedFiles[0] || 'unknown',
    line: undefined,
    fix: action.description,
    command: action.command,
  }));

  return {
    summary: analysis.summary,
    categories,
    action_required: actionRequired,
    next_steps: analysis.nextSteps,
  };
}

/**
 * Run complete analysis on last test results
 */
export function runAnalysis(): AIAgentSummary | null {
  // Use enhanced analysis (Phase 2)
  const enhancedAnalysis = runEnhancedAnalysis();
  if (!enhancedAnalysis) return null;

  return generateAISummary(enhancedAnalysis);
}

/**
 * Get compact status for quick checks
 */
export function getCompactStatus(): string {
  const analysis = loadLastRun();
  if (!analysis) return 'NO_DATA';

  const { summary } = analysis;

  if (summary.failed === 0) {
    return `P:${summary.total}/${summary.total}`;
  }

  const catCodes: string[] = [];
  for (const [cat, info] of Object.entries(analysis.categories)) {
    const code = getCategoryCode(cat);
    const fixCode = info.fixAvailable ? '@AF' : '';
    catCodes.push(`${code}:${info.count}${fixCode}`);
  }

  return `F:${summary.failed}/${summary.total}|${catCodes.join('|')}`;
}

/**
 * Get semantic category code
 */
function getCategoryCode(category: string): string {
  const codes: Record<string, string> = {
    browser_compat: 'BC',
    element_not_found: 'NF',
    timeout: 'TO',
    assertion: 'AE',
    network: 'NE',
    server_error: 'SE',
    unknown: 'UK',
  };
  return codes[category] || 'UK';
}

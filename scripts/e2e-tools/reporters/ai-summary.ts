/**
 * AI Summary Reporter for E2E Tests
 *
 * Generates compact, structured summaries optimized for AI agents.
 * Reduces token usage while preserving essential information.
 *
 * Part of Phase 5: AI Agent Commands
 */

import type {
  EnhancedAnalysisResult,
  RootCauseAnalysis,
  AISummary,
  AIActionItem,
  CategorySummaryDetail,
} from '../types/index.js';

/**
 * AI Summary Reporter Class
 *
 * Generates AI-optimized summaries from analysis results
 */
export class AISummaryReporter {
  /**
   * Generate AI-optimized summary from analysis
   */
  generate(
    analysis: EnhancedAnalysisResult,
    deepAnalysis?: RootCauseAnalysis[]
  ): AISummary {
    const uniqueErrorCount = analysis.deduplication?.uniqueCount ?? analysis.summary.failed;

    return {
      // Quick status indicator
      status: this.getStatus(analysis),

      // Compact metrics
      metrics: {
        total: analysis.summary.total,
        passed: analysis.summary.passed,
        failed: analysis.summary.failed,
        fixable: analysis.aggregatedCategories?.fixableErrors ?? 0,
        unique: uniqueErrorCount,
      },

      // Prioritized actions
      actions: this.generateActions(analysis, deepAnalysis),

      // Single most important issue
      primary_issue: this.getPrimaryIssue(analysis),

      // Ready-to-run commands
      next_commands: this.getNextCommands(analysis),

      // Files to focus on
      focus_files: this.getFocusFiles(analysis, deepAnalysis),

      // Brief root cause summary
      root_causes: this.summarizeRootCauses(deepAnalysis),
    };
  }

  /**
   * Format summary for CLI output
   */
  formatForCLI(summary: AISummary): string {
    const lines: string[] = [];

    // Status line
    lines.push(
      `[${summary.status}] ${summary.metrics.failed}/${summary.metrics.total} failed, ${summary.metrics.fixable} fixable`
    );
    lines.push('');

    // Primary issue
    if (summary.primary_issue) {
      lines.push(`PRIMARY: ${summary.primary_issue}`);
      lines.push('');
    }

    // Actions
    if (summary.actions.length > 0) {
      lines.push('ACTIONS:');
      for (const action of summary.actions.slice(0, 5)) {
        const prefix = action.type === 'auto' ? '[AUTO]' : '[MANUAL]';
        lines.push(`  ${prefix} ${action.description}`);
        if (action.command) {
          lines.push(`     $ ${action.command}`);
        }
      }
      lines.push('');
    }

    // Focus files
    if (summary.focus_files.length > 0) {
      lines.push('FOCUS FILES:');
      for (const file of summary.focus_files.slice(0, 5)) {
        const shortFile = file.split('/').slice(-2).join('/');
        lines.push(`  - ${shortFile}`);
      }
      lines.push('');
    }

    // Next commands
    if (summary.next_commands.length > 0) {
      lines.push('NEXT:');
      for (const cmd of summary.next_commands) {
        lines.push(`  $ ${cmd}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format summary as JSON for programmatic use
   */
  formatAsJSON(summary: AISummary): string {
    return JSON.stringify(summary, null, 2);
  }

  /**
   * Format summary as minimal one-liner
   */
  formatOneLiner(summary: AISummary): string {
    const primaryIssue = summary.primary_issue?.slice(0, 50) || 'No issues';
    const nextCmd = summary.next_commands[0] || 'none';

    return `${summary.status}: ${summary.metrics.failed} failed (${summary.metrics.fixable} fixable) | ${primaryIssue} | Run: ${nextCmd}`;
  }

  /**
   * Get status from analysis
   */
  private getStatus(analysis: EnhancedAnalysisResult): 'PASS' | 'FAIL' | 'FIXABLE' {
    if (analysis.summary.failed === 0) return 'PASS';

    const fixableCount = analysis.aggregatedCategories?.fixableErrors ?? 0;
    if (fixableCount > 0) return 'FIXABLE';

    return 'FAIL';
  }

  /**
   * Generate prioritized actions from analysis
   */
  private generateActions(
    analysis: EnhancedAnalysisResult,
    deepAnalysis?: RootCauseAnalysis[]
  ): AIActionItem[] {
    const actions: AIActionItem[] = [];

    // Auto-fix actions from categories
    const categories = analysis.aggregatedCategories?.categories || [];

    for (const cat of categories) {
      if (cat.fixableCount > 0) {
        actions.push({
          priority: 1,
          type: 'auto',
          description: `Fix ${cat.fixableCount} ${cat.category} errors`,
          command: `npm run e2e:fix -- --pattern=${cat.category} --apply`,
          impact: cat.count,
        });
      }
    }

    // Manual actions from deep analysis
    if (deepAnalysis) {
      const manualFixes = deepAnalysis.flatMap((a) =>
        a.suggestedFixes
          .filter((f) => f.type === 'manual')
          .map((f) => ({
            priority: 2,
            type: 'manual' as const,
            description: f.description,
            file: f.file,
            line: f.line,
            impact: 1,
          }))
      );

      // Deduplicate by description
      const seen = new Set<string>();
      for (const fix of manualFixes) {
        if (!seen.has(fix.description)) {
          seen.add(fix.description);
          actions.push(fix);
        }
      }
    }

    // Sort by priority then impact
    actions.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (b.impact || 0) - (a.impact || 0);
    });

    return actions;
  }

  /**
   * Get the primary issue description
   */
  private getPrimaryIssue(analysis: EnhancedAnalysisResult): string | null {
    const categories = analysis.aggregatedCategories?.categories || [];
    const topCategory = categories[0];

    if (!topCategory) return null;

    return `${topCategory.count} errors from ${topCategory.category}: ${topCategory.primaryRootCause}`;
  }

  /**
   * Get recommended next commands
   */
  private getNextCommands(analysis: EnhancedAnalysisResult): string[] {
    const commands: string[] = [];

    const fixableCount = analysis.aggregatedCategories?.fixableErrors ?? 0;

    if (fixableCount > 0) {
      commands.push('npm run e2e:fix -- --apply');
    }

    commands.push('npm run e2e:run');

    return commands;
  }

  /**
   * Get files to focus on
   */
  private getFocusFiles(
    analysis: EnhancedAnalysisResult,
    deepAnalysis?: RootCauseAnalysis[]
  ): string[] {
    const files = new Set<string>();

    // Files from categories
    const categories = analysis.aggregatedCategories?.categories || [];
    for (const cat of categories) {
      for (const file of cat.affectedFiles.slice(0, 3)) {
        files.add(file);
      }
    }

    // Files from deep analysis
    if (deepAnalysis) {
      for (const a of deepAnalysis) {
        if (a.importChain) {
          for (const node of a.importChain.chain) {
            if (node.problematicExports.length > 0) {
              files.add(node.file);
            }
          }
        }
      }
    }

    return [...files].slice(0, 10);
  }

  /**
   * Summarize root causes
   */
  private summarizeRootCauses(deepAnalysis?: RootCauseAnalysis[]): string[] {
    if (!deepAnalysis) return [];

    const causes = new Set<string>();
    for (const a of deepAnalysis) {
      causes.add(a.rootCause);
    }

    return [...causes].slice(0, 5);
  }
}

// Lazy singleton instance
let _aiSummaryReporter: AISummaryReporter | null = null;

/**
 * Get the singleton AISummaryReporter instance
 */
export function getAISummaryReporter(): AISummaryReporter {
  if (!_aiSummaryReporter) {
    _aiSummaryReporter = new AISummaryReporter();
  }
  return _aiSummaryReporter;
}

/**
 * Generate AI summary (convenience function)
 */
export function generateAISummary(
  analysis: EnhancedAnalysisResult,
  deepAnalysis?: RootCauseAnalysis[]
): AISummary {
  return getAISummaryReporter().generate(analysis, deepAnalysis);
}

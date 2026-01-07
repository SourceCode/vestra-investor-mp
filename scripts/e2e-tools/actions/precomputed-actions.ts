/**
 * Pre-Computed Actions Generator for E2E Tools
 *
 * Generates ready-to-use action directives based on analysis results.
 * Provides AI agents with immediate actionable commands.
 *
 * Part of Phase 7: Token Optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { TestSummary, EnhancedAnalysisResult, TestResult } from '../types/index.js';
import { getStatusCode, getActionCode, type StatusCode, type ActionCode } from '../compression/semantic-codes.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Action priority level
 */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Pre-computed action
 */
export interface PrecomputedAction {
  id: string;
  priority: ActionPriority;
  code: ActionCode;
  name: string;
  description: string;
  command: string;
  args?: string[];
  targetFiles?: string[];
  estimatedImpact: {
    testsAffected: number;
    fixableErrors: number;
  };
}

/**
 * Action set for current state
 */
export interface ActionSet {
  status: StatusCode;
  primary: PrecomputedAction;
  alternatives: PrecomputedAction[];
  sequence?: PrecomputedAction[];  // Ordered list for multi-step fixes
  metadata: {
    generated: string;
    totalActions: number;
    totalFixable: number;
  };
}

/**
 * Actions cache
 */
interface ActionsCache {
  version: string;
  generated: string;
  hash: string;
  actions: ActionSet;
}

/**
 * Pre-Computed Actions class
 */
export class PrecomputedActionsGenerator {
  private cachePath: string;

  constructor() {
    this.cachePath = path.join(process.cwd(), CACHE_DIR, 'actions.json');
  }

  /**
   * Generate action set from current state
   */
  generate(
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[] = []
  ): ActionSet {
    const fixableCount = analysis?.aggregatedCategories?.fixableErrors || 0;
    const hasFixable = fixableCount > 0;
    const status = getStatusCode(summary, hasFixable);
    const primaryCode = getActionCode(status, false);

    // Build primary action
    const primary = this.buildAction(primaryCode, summary, analysis, tests);

    // Build alternative actions
    const alternatives = this.buildAlternatives(status, summary, analysis, tests);

    // Build action sequence if multi-step fix is recommended
    const sequence = this.buildSequence(status, summary, analysis, tests);

    const actionSet: ActionSet = {
      status,
      primary,
      alternatives,
      sequence,
      metadata: {
        generated: new Date().toISOString(),
        totalActions: 1 + alternatives.length + (sequence?.length || 0),
        totalFixable: fixableCount,
      },
    };

    // Cache the action set
    this.cacheActions(actionSet, summary);

    return actionSet;
  }

  /**
   * Build a single action
   */
  private buildAction(
    code: ActionCode,
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[]
  ): PrecomputedAction {
    const failedTests = tests.filter((t) => t.status === 'failed');
    const fixableCount = analysis?.aggregatedCategories?.fixableErrors || 0;

    const actionTemplates: Record<ActionCode, Omit<PrecomputedAction, 'id' | 'estimatedImpact' | 'targetFiles'>> = {
      AF: {
        priority: 'critical',
        code: 'AF',
        name: 'Auto-Fix',
        description: 'Apply automated fixes for browser compatibility errors',
        command: 'npm run e2e:fix -- --apply',
        args: ['--apply'],
      },
      RA: {
        priority: 'high',
        code: 'RA',
        name: 'Re-Analyze',
        description: 'Re-run analysis to update error categorization',
        command: 'npm run e2e:analyze',
      },
      RT: {
        priority: 'medium',
        code: 'RT',
        name: 'Re-Test',
        description: 'Re-run tests to verify current state',
        command: 'npm run test:e2e',
      },
      DA: {
        priority: 'high',
        code: 'DA',
        name: 'Deep Analysis',
        description: 'Run deep analysis with root cause detection',
        command: 'npm run e2e:analyze -- --deep',
        args: ['--deep'],
      },
      MF: {
        priority: 'medium',
        code: 'MF',
        name: 'Manual Fix',
        description: 'Manual intervention required - review error details',
        command: 'npm run e2e:status -- -v',
        args: ['-v'],
      },
      CI: {
        priority: 'critical',
        code: 'CI',
        name: 'Check Infrastructure',
        description: 'Verify Docker and database services are running',
        command: 'docker compose ps',
      },
    };

    const template = actionTemplates[code];

    // Determine target files if applicable
    let targetFiles: string[] | undefined;
    if (code === 'AF' && analysis?.aggregatedCategories?.categories) {
      targetFiles = analysis.aggregatedCategories.categories
        .filter((c): c is typeof c & { fixableCount: number } => c.fixableCount > 0)
        .flatMap((c) => c.affectedFiles || [])
        .slice(0, 10);
    } else if (failedTests.length > 0) {
      targetFiles = failedTests.slice(0, 5).map((t) => t.file || t.name);
    }

    return {
      id: `${code}-${Date.now().toString(36)}`,
      ...template,
      targetFiles,
      estimatedImpact: {
        testsAffected: failedTests.length,
        fixableErrors: fixableCount,
      },
    };
  }

  /**
   * Build alternative actions
   */
  private buildAlternatives(
    status: StatusCode,
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[]
  ): PrecomputedAction[] {
    const alternatives: PrecomputedAction[] = [];

    // Add verbose status check as alternative
    alternatives.push(
      this.buildAction('MF', summary, analysis, tests)
    );

    // Add re-analyze as alternative if not primary
    if (status !== 'F') {
      alternatives.push(
        this.buildAction('RA', summary, analysis, tests)
      );
    }

    // Add infrastructure check for any failure
    if (status !== 'P') {
      alternatives.push(
        this.buildAction('CI', summary, analysis, tests)
      );
    }

    // Filter out duplicates of primary
    return alternatives.filter((a, index, self) =>
      self.findIndex((x) => x.code === a.code) === index
    );
  }

  /**
   * Build action sequence for multi-step fixes
   */
  private buildSequence(
    status: StatusCode,
    summary: TestSummary | null,
    analysis: EnhancedAnalysisResult | null,
    tests: TestResult[]
  ): PrecomputedAction[] | undefined {
    // Only provide sequence for fixable errors
    if (status !== 'X') {
      return undefined;
    }

    const sequence: PrecomputedAction[] = [];

    // Step 1: Apply auto-fix
    sequence.push({
      id: `seq-1-${Date.now().toString(36)}`,
      priority: 'critical',
      code: 'AF',
      name: 'Step 1: Apply Fixes',
      description: 'Apply automated fixes',
      command: 'npm run e2e:fix -- --apply',
      args: ['--apply'],
      estimatedImpact: {
        testsAffected: summary?.failed || 0,
        fixableErrors: analysis?.aggregatedCategories?.fixableErrors || 0,
      },
    });

    // Step 2: Re-run tests
    sequence.push({
      id: `seq-2-${Date.now().toString(36)}`,
      priority: 'high',
      code: 'RT',
      name: 'Step 2: Verify Fixes',
      description: 'Re-run tests to verify fixes',
      command: 'npm run test:e2e',
      estimatedImpact: {
        testsAffected: summary?.failed || 0,
        fixableErrors: 0,
      },
    });

    // Step 3: Re-analyze if still failing
    sequence.push({
      id: `seq-3-${Date.now().toString(36)}`,
      priority: 'medium',
      code: 'RA',
      name: 'Step 3: Re-Analyze (if needed)',
      description: 'Re-analyze if tests still fail',
      command: 'npm run e2e:analyze',
      estimatedImpact: {
        testsAffected: 0,
        fixableErrors: 0,
      },
    });

    return sequence;
  }

  /**
   * Cache actions for later retrieval
   */
  private cacheActions(actions: ActionSet, summary: TestSummary | null): void {
    const hash = this.computeHash(summary);

    const cache: ActionsCache = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      hash,
      actions,
    };

    const dir = path.dirname(this.cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
  }

  /**
   * Load cached actions if valid
   */
  loadCachedActions(): ActionSet | null {
    if (!fs.existsSync(this.cachePath)) {
      return null;
    }

    try {
      const cache: ActionsCache = JSON.parse(fs.readFileSync(this.cachePath, 'utf-8'));

      // Check if cache is less than 5 minutes old
      const cacheTime = new Date(cache.generated).getTime();
      if (Date.now() - cacheTime > 5 * 60 * 1000) {
        return null;
      }

      return cache.actions;
    } catch {
      return null;
    }
  }

  /**
   * Format action set for compact output
   */
  formatCompact(actions: ActionSet): string {
    const parts: string[] = [
      actions.status,
      `→${actions.primary.code}`,
    ];

    if (actions.primary.estimatedImpact.fixableErrors > 0) {
      parts.push(`FIX:${actions.primary.estimatedImpact.fixableErrors}`);
    }

    if (actions.sequence) {
      parts.push(`SEQ:${actions.sequence.length}`);
    }

    return parts.join('|');
  }

  /**
   * Format action set as JSON
   */
  formatJSON(actions: ActionSet): string {
    const output: Record<string, unknown> = {
      status: actions.status,
      action: actions.primary.code,
      cmd: actions.primary.command,
    };

    if (actions.primary.estimatedImpact.fixableErrors > 0) {
      output.fixable = actions.primary.estimatedImpact.fixableErrors;
    }

    if (actions.primary.targetFiles && actions.primary.targetFiles.length > 0) {
      output.files = actions.primary.targetFiles.length > 3
        ? actions.primary.targetFiles.slice(0, 3).concat([`+${actions.primary.targetFiles.length - 3}`])
        : actions.primary.targetFiles;
    }

    if (actions.sequence) {
      output.sequence = actions.sequence.map((s) => s.code);
    }

    return JSON.stringify(output);
  }

  /**
   * Get ready-to-run command
   */
  getCommand(actions: ActionSet): string {
    return actions.primary.command;
  }

  /**
   * Get sequence of commands
   */
  getSequenceCommands(actions: ActionSet): string[] {
    if (!actions.sequence) {
      return [actions.primary.command];
    }
    return actions.sequence.map((s) => s.command);
  }

  private computeHash(summary: TestSummary | null): string {
    const data = JSON.stringify({
      failed: summary?.failed || 0,
      passed: summary?.passed || 0,
      total: summary?.total || 0,
    });
    return crypto.createHash('md5').update(data).digest('hex').slice(0, 8);
  }
}

/**
 * Singleton instance
 */
let actionsGeneratorInstance: PrecomputedActionsGenerator | null = null;

export function getActionsGenerator(): PrecomputedActionsGenerator {
  if (!actionsGeneratorInstance) {
    actionsGeneratorInstance = new PrecomputedActionsGenerator();
  }
  return actionsGeneratorInstance;
}

export const actionsGenerator = new PrecomputedActionsGenerator();

/**
 * Generate actions from current state
 */
export function generateActions(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null,
  tests: TestResult[] = []
): ActionSet {
  return actionsGenerator.generate(summary, analysis, tests);
}

/**
 * Get compact action directive
 */
export function getActionDirective(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null
): string {
  const actions = generateActions(summary, analysis);
  return actionsGenerator.formatCompact(actions);
}

/**
 * Get recommended command
 */
export function getRecommendedCommand(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null
): string {
  const actions = generateActions(summary, analysis);
  return actionsGenerator.getCommand(actions);
}

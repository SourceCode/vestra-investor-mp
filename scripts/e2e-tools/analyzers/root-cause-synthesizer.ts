/**
 * Root Cause Synthesizer for E2E Tests
 *
 * Combines pattern matching, import tracing, browser compatibility analysis,
 * and DOM analysis to determine the root cause of test failures.
 */

import type { TestError } from '../types/index.js';
import type { PatternMatchResult } from './pattern-matcher.js';
import type { ImportChain, ImportNode } from './import-tracer.js';
import type { BrowserCompatResult, BrowserIncompatibility } from './browser-compat.js';
import type { DOMAnalysisResult } from './dom-analyzer.js';
import { getImportTracer } from './import-tracer.js';
import { getBrowserCompatAnalyzer } from './browser-compat.js';
import { getDOMAnalyzer } from './dom-analyzer.js';

/**
 * Suggested fix for a root cause
 */
export interface SuggestedFix {
  type: 'auto' | 'manual' | 'suggestion';
  description: string;
  command?: string;
  file?: string;
  line?: number;
  confidence: number;
}

/**
 * Complete root cause analysis result
 */
export interface RootCauseAnalysis {
  error: TestError;
  patternMatch: PatternMatchResult;
  confidence: number;
  rootCause: string;
  evidence: string[];
  importChain: ImportChain | null;
  browserCompatIssues: BrowserCompatResult[];
  domSnapshot: DOMAnalysisResult | null;
  suggestedFixes: SuggestedFix[];
  analysisTime: number;
}

/**
 * Root Cause Synthesizer Class
 *
 * Orchestrates all analyzers to determine the root cause
 * of a test failure with high confidence.
 */
export class RootCauseSynthesizer {
  private readonly importTracer = getImportTracer();
  private readonly browserAnalyzer = getBrowserCompatAnalyzer();
  private readonly domAnalyzer = getDOMAnalyzer();

  /**
   * Perform full root cause analysis for an error
   */
  analyze(error: TestError, patternMatch: PatternMatchResult): RootCauseAnalysis {
    const startTime = Date.now();

    const analysis: RootCauseAnalysis = {
      error,
      patternMatch,
      confidence: patternMatch.confidence,
      rootCause: patternMatch.bestMatch?.rootCause || 'Unknown - requires investigation',
      evidence: [],
      importChain: null,
      browserCompatIssues: [],
      domSnapshot: null,
      suggestedFixes: [],
      analysisTime: 0,
    };

    // Step 1: Trace imports if needed
    if (patternMatch.bestMatch?.requiresImportTrace && error.stack) {
      const stackLines = error.stack.split('\n');
      analysis.importChain = this.importTracer.traceFromStack(stackLines);

      if (analysis.importChain.found) {
        analysis.evidence.push(
          `Import chain traced from ${analysis.importChain.startFile}`
        );

        // Find the problematic node
        const problematicNode = analysis.importChain.chain.find(
          (node) => node.problematicExports.length > 0
        );

        if (problematicNode) {
          const fileName = problematicNode.file.split('/').pop();
          analysis.rootCause = `${fileName} contains browser-incompatible code: ${problematicNode.problematicExports[0]}`;
          analysis.confidence = Math.min(analysis.confidence + 0.2, 1.0);
        }
      }
    }

    // Step 2: Check browser compatibility for affected files
    const affectedFiles = this.getAffectedFiles(error, analysis.importChain);
    for (const file of affectedFiles) {
      try {
        const compatResult = this.browserAnalyzer.analyzeFile(file);
        if (compatResult.issues.length > 0) {
          analysis.browserCompatIssues.push(compatResult);
          analysis.evidence.push(
            `Found ${compatResult.issues.length} browser compatibility issue(s) in ${file.split('/').pop()}`
          );

          // Boost confidence for critical issues
          if (compatResult.hasCriticalIssues) {
            analysis.confidence = Math.min(analysis.confidence + 0.15, 1.0);
          }
        }
      } catch {
        // File may not exist locally
      }
    }

    // Step 3: Analyze DOM snapshots for UI errors
    if (
      patternMatch.category === 'element_not_found' ||
      patternMatch.category === 'assertion' ||
      error.message.toLowerCase().includes('error')
    ) {
      const snapshots = this.domAnalyzer.analyzeAllSnapshots();

      // Find relevant snapshot (most recent with error state)
      const relevantSnapshot = snapshots.find(
        (s) => s.issues.length > 0 && s.hasErrorState
      );

      if (relevantSnapshot) {
        analysis.domSnapshot = relevantSnapshot;
        analysis.evidence.push(
          `DOM snapshot shows: ${relevantSnapshot.issues.join(', ')}`
        );

        // Check if DOM state provides additional clues
        if (relevantSnapshot.visibleText.toLowerCase().includes('system error')) {
          analysis.rootCause = 'React Error Boundary triggered - check browser console';
          analysis.confidence = Math.min(analysis.confidence + 0.1, 1.0);
        }
      }
    }

    // Step 4: Generate fix suggestions
    analysis.suggestedFixes = this.generateFixes(analysis);

    // Sort fixes by confidence
    analysis.suggestedFixes.sort((a, b) => b.confidence - a.confidence);

    analysis.analysisTime = Date.now() - startTime;

    return analysis;
  }

  /**
   * Get all files that might be affected
   */
  private getAffectedFiles(
    error: TestError,
    importChain: ImportChain | null
  ): string[] {
    const files = new Set<string>();

    // Add file from error
    if (error.file) {
      files.add(error.file);
    }

    // Add files from stack
    if (error.stack) {
      const stackLines = error.stack.split('\n');
      for (const frame of stackLines) {
        const match = frame.match(/(?:at\s+.*?\()?([^:\s()]+):\d+:\d+/);
        if (match && match[1].includes('src/')) {
          // Try to resolve the file
          const file = match[1];
          if (!file.includes('node_modules')) {
            files.add(file);
          }
        }
      }
    }

    // Add files from import chain
    if (importChain) {
      for (const node of importChain.chain) {
        files.add(node.file);
      }
    }

    return [...files];
  }

  /**
   * Generate fix suggestions based on analysis
   */
  private generateFixes(analysis: RootCauseAnalysis): SuggestedFix[] {
    const fixes: SuggestedFix[] = [];

    // Fixes from pattern match
    if (analysis.patternMatch.bestMatch?.fixAvailable) {
      const template = analysis.patternMatch.bestMatch.fixTemplate || 'lazy_init';
      fixes.push({
        type: 'auto',
        description: `Apply ${template} fix pattern`,
        command: `npm run e2e:fix -- --template=${template}`,
        confidence: analysis.patternMatch.confidence,
      });
    }

    // Fixes from browser compatibility
    for (const compat of analysis.browserCompatIssues) {
      for (const issue of compat.issues) {
        fixes.push({
          type: 'manual',
          description: issue.fix,
          file: issue.file,
          line: issue.line,
          confidence: issue.severity === 'critical' ? 0.95 : 0.8,
        });
      }
    }

    // Fixes from import chain
    if (analysis.importChain?.found) {
      const problematic = analysis.importChain.chain.find(
        (n) => n.problematicExports.length > 0
      );
      if (problematic) {
        fixes.push({
          type: 'manual',
          description: `Convert eager singleton to lazy initialization in ${problematic.file.split('/').pop()}`,
          file: problematic.file,
          confidence: 0.9,
        });
      }
    }

    // Generic suggestions from pattern match
    if (analysis.patternMatch.bestMatch?.suggestions) {
      for (const suggestion of analysis.patternMatch.bestMatch.suggestions) {
        fixes.push({
          type: 'suggestion',
          description: suggestion,
          confidence: 0.5,
        });
      }
    }

    return fixes;
  }

  /**
   * Batch analyze multiple errors
   */
  analyzeAll(
    errors: Array<{ error: TestError; patternMatch: PatternMatchResult }>
  ): RootCauseAnalysis[] {
    return errors.map(({ error, patternMatch }) =>
      this.analyze(error, patternMatch)
    );
  }

  /**
   * Get compact summary of root cause analysis
   */
  getCompactSummary(analysis: RootCauseAnalysis): string {
    const parts: string[] = [];

    // Confidence
    parts.push(`C:${Math.round(analysis.confidence * 100)}%`);

    // Root cause type
    if (analysis.browserCompatIssues.length > 0) {
      parts.push('BC');
    }
    if (analysis.importChain?.found) {
      parts.push('IMP');
    }
    if (analysis.domSnapshot?.hasErrorState) {
      parts.push('DOM');
    }

    // Fix availability
    const autoFixes = analysis.suggestedFixes.filter((f) => f.type === 'auto').length;
    if (autoFixes > 0) {
      parts.push(`FIX:${autoFixes}`);
    }

    return parts.join('|');
  }

  /**
   * Get AI-optimized summary
   */
  getAISummary(analysis: RootCauseAnalysis): {
    rootCause: string;
    confidence: number;
    action: string;
    command?: string;
  } {
    const topFix = analysis.suggestedFixes[0];

    return {
      rootCause: analysis.rootCause,
      confidence: analysis.confidence,
      action: topFix?.description || 'Manual investigation required',
      command: topFix?.command,
    };
  }
}

// Lazy singleton instance
let _rootCauseSynthesizer: RootCauseSynthesizer | null = null;

/**
 * Get the singleton RootCauseSynthesizer instance
 */
export function getRootCauseSynthesizer(): RootCauseSynthesizer {
  if (!_rootCauseSynthesizer) {
    _rootCauseSynthesizer = new RootCauseSynthesizer();
  }
  return _rootCauseSynthesizer;
}

/**
 * Analyze root cause for an error (convenience function)
 */
export function analyzeRootCause(
  error: TestError,
  patternMatch: PatternMatchResult
): RootCauseAnalysis {
  return getRootCauseSynthesizer().analyze(error, patternMatch);
}

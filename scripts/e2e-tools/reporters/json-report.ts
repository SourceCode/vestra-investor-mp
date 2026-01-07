/**
 * JSON Report Generator for E2E Tools
 *
 * Generates comprehensive JSON reports for programmatic access,
 * historical tracking, and trend analysis.
 *
 * Part of Phase 6: Reporting & Dashboards
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  TestRunResult,
  EnhancedAnalysisResult,
  RootCauseAnalysis,
  JSONReport,
  TrendData,
  TrendDataPoint,
  HistoryComparison,
  HealthScore,
  RootCauseSummary,
  TestSummary,
} from '../types/index.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const HISTORY_DIR = path.join(CACHE_DIR, 'history');

/**
 * JSON Report Generator class
 */
export class JSONReporter {
  /**
   * Generate comprehensive JSON report
   */
  generate(): JSONReport {
    const lastRun = this.loadLastRun();
    const analysis = this.loadAnalysis();
    const deepAnalysis = this.loadDeepAnalysis();
    const history = this.loadHistory();

    const report: JSONReport = {
      generated: new Date().toISOString(),
      version: '1.0.0',

      // Current run data
      current: {
        timestamp: lastRun?.timestamp || null,
        summary: lastRun?.summary || null,
        duration: lastRun?.duration || null,
        analysis: analysis || null,
      },

      // Trend data
      trends: this.calculateTrends(history),

      // Root causes
      rootCauses: this.extractRootCauses(deepAnalysis),

      // Historical comparison
      comparison: this.compareToHistory(lastRun, history),

      // Health score
      health: this.calculateHealthScore(lastRun, analysis, history),
    };

    return report;
  }

  /**
   * Save report to file
   */
  save(report: JSONReport, filename?: string): string {
    const dir = path.join(process.cwd(), CACHE_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = filename || `report-${Date.now()}.json`;
    const filePath = path.join(dir, file);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    return filePath;
  }

  /**
   * Save to history
   */
  saveToHistory(report: JSONReport): void {
    const historyDir = path.join(process.cwd(), HISTORY_DIR);
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(historyDir, `${timestamp}.json`);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Load last test run results
   */
  private loadLastRun(): TestRunResult | null {
    const filePath = path.join(process.cwd(), CACHE_DIR, 'last-run.json');
    if (!fs.existsSync(filePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Load analysis results
   */
  private loadAnalysis(): EnhancedAnalysisResult | null {
    const filePath = path.join(process.cwd(), CACHE_DIR, 'analysis.json');
    if (!fs.existsSync(filePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Load deep analysis results
   */
  private loadDeepAnalysis(): RootCauseAnalysis[] | null {
    const filePath = path.join(process.cwd(), CACHE_DIR, 'deep-analysis.json');
    if (!fs.existsSync(filePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Load historical reports
   */
  private loadHistory(): JSONReport[] {
    const historyDir = path.join(process.cwd(), HISTORY_DIR);
    if (!fs.existsSync(historyDir)) return [];

    try {
      const files = fs
        .readdirSync(historyDir)
        .filter((f: string) => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 30); // Last 30 runs

      return files.map((f: string) => {
        const filePath = path.join(historyDir, f);
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      });
    } catch {
      return [];
    }
  }

  /**
   * Extract root cause summaries from deep analysis
   */
  private extractRootCauses(
    deepAnalysis: RootCauseAnalysis[] | null
  ): RootCauseSummary[] {
    if (!deepAnalysis) return [];

    return deepAnalysis.map((a) => ({
      error: a.error.message.substring(0, 100),
      rootCause: a.rootCause,
      confidence: a.confidence,
      fixable: a.suggestedFixes.some((f) => f.type === 'auto'),
    }));
  }

  /**
   * Calculate trend data from history
   */
  private calculateTrends(history: JSONReport[]): TrendData {
    if (history.length === 0) {
      return {
        passRate: [],
        failureCount: [],
        fixableCount: [],
        duration: [],
      };
    }

    return {
      passRate: history.map((h) => ({
        date: h.generated,
        value: this.calculatePassRate(h.current.summary),
      })),
      failureCount: history.map((h) => ({
        date: h.generated,
        value: h.current.summary?.failed || 0,
      })),
      fixableCount: history.map((h) => ({
        date: h.generated,
        value: this.getFixableCount(h.current.analysis),
      })),
      duration: history.map((h) => ({
        date: h.generated,
        value: this.parseDuration(h.current.duration),
      })),
    };
  }

  /**
   * Calculate pass rate from summary
   */
  private calculatePassRate(summary: TestSummary | null): number {
    if (!summary || summary.total === 0) return 0;
    return (summary.passed / summary.total) * 100;
  }

  /**
   * Get fixable error count from analysis
   */
  private getFixableCount(analysis: EnhancedAnalysisResult | null): number {
    if (!analysis?.aggregatedCategories) return 0;
    return analysis.aggregatedCategories.fixableErrors;
  }

  /**
   * Parse duration string to number (seconds)
   */
  private parseDuration(duration: string | null): number {
    if (!duration) return 0;

    // Handle formats like "45s", "1m 30s", "90s"
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Compare current run to historical data
   */
  private compareToHistory(
    current: TestRunResult | null,
    history: JSONReport[]
  ): HistoryComparison {
    const previous = history[0];

    if (!current || !previous?.current.summary) {
      return {
        passRateChange: 0,
        failureChange: 0,
        newFailures: [],
        fixedTests: [],
      };
    }

    const currentPassRate = this.calculatePassRate(current.summary);
    const previousPassRate = this.calculatePassRate(previous.current.summary);

    return {
      passRateChange: currentPassRate - previousPassRate,
      failureChange: current.summary.failed - (previous.current.summary?.failed || 0),
      newFailures: this.findNewFailures(current, previous),
      fixedTests: this.findFixedTests(current, previous),
    };
  }

  /**
   * Find new failures compared to previous run
   */
  private findNewFailures(
    current: TestRunResult,
    previous: JSONReport
  ): string[] {
    const currentFailed = new Set(
      current.tests
        .filter((t) => t.status === 'failed')
        .map((t) => t.name)
    );

    const previousFailed = new Set(previous.rootCauses.map((r) => r.error));

    const newFailures: string[] = [];
    for (const test of currentFailed) {
      if (!previousFailed.has(test)) {
        newFailures.push(test);
      }
    }
    return newFailures;
  }

  /**
   * Find tests that were fixed since previous run
   */
  private findFixedTests(
    current: TestRunResult,
    previous: JSONReport
  ): string[] {
    const currentPassed = new Set(
      current.tests
        .filter((t) => t.status === 'passed')
        .map((t) => t.name)
    );

    const previousFailed = new Set(previous.rootCauses.map((r) => r.error));

    const fixedTests: string[] = [];
    for (const test of currentPassed) {
      if (previousFailed.has(test)) {
        fixedTests.push(test);
      }
    }
    return fixedTests;
  }

  /**
   * Calculate health score based on multiple factors
   */
  private calculateHealthScore(
    lastRun: TestRunResult | null,
    analysis: EnhancedAnalysisResult | null,
    history: JSONReport[]
  ): HealthScore {
    if (!lastRun || !lastRun.summary) {
      return { score: 0, grade: 'F', factors: ['No test data available'] };
    }

    let score = 0;
    const factors: string[] = [];

    // Pass rate (0-40 points)
    const passRate = this.calculatePassRate(lastRun.summary) / 100;
    const passPoints = passRate * 40;
    score += passPoints;
    if (passRate < 0.9) {
      factors.push(`Low pass rate: ${(passRate * 100).toFixed(0)}%`);
    }

    // Fixable issues (0-20 points)
    if (analysis && lastRun.summary) {
      const fixableCount = this.getFixableCount(analysis);
      const failedCount = Math.max(1, lastRun.summary.failed);
      const fixableRatio = fixableCount / failedCount;
      const fixablePoints = fixableRatio * 20;
      score += fixablePoints;
      if (fixableRatio > 0.5 && fixableCount > 0) {
        factors.push(`${fixableCount} auto-fixable issues`);
      }
    } else {
      score += 10; // Neutral if no analysis
    }

    // Trend (0-20 points)
    if (history.length > 1) {
      const recentPassRates = history
        .slice(0, 5)
        .map((h) => this.calculatePassRate(h.current.summary) / 100);
      const avgRecent =
        recentPassRates.reduce((a, b) => a + b, 0) / recentPassRates.length;
      const trendPoints = avgRecent * 20;
      score += trendPoints;
      if (avgRecent < passRate) factors.push('Improving trend');
      if (avgRecent > passRate) factors.push('Declining trend');
    } else {
      score += 10; // Neutral if no history
    }

    // Consistency (0-20 points)
    if (history.length > 2) {
      const variance = this.calculateVariance(history);
      const consistencyPoints = Math.max(0, 20 - variance * 2);
      score += consistencyPoints;
      if (variance > 5) factors.push('Inconsistent results');
    } else {
      score += 10; // Neutral if not enough history
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score: Math.round(score), grade, factors };
  }

  /**
   * Calculate variance of pass rates in history
   */
  private calculateVariance(history: JSONReport[]): number {
    const passRates = history.map((h) =>
      this.calculatePassRate(h.current.summary)
    );
    const avg = passRates.reduce((a, b) => a + b, 0) / passRates.length;
    const squaredDiffs = passRates.map((r) => Math.pow(r - avg, 2));
    return Math.sqrt(
      squaredDiffs.reduce((a, b) => a + b, 0) / passRates.length
    );
  }

  /**
   * Get compact report summary for CLI output
   */
  getCompactSummary(report: JSONReport): string {
    const lines: string[] = [];

    lines.push(`Health: ${report.health.grade} (${report.health.score}/100)`);

    if (report.current.summary) {
      const { passed, total, failed } = report.current.summary;
      lines.push(`Tests: ${passed}/${total} passing (${failed} failed)`);
    }

    if (report.comparison.passRateChange !== 0) {
      const change = report.comparison.passRateChange;
      const direction = change > 0 ? '+' : '';
      lines.push(`Trend: ${direction}${change.toFixed(1)}% from last run`);
    }

    if (report.health.factors.length > 0) {
      lines.push(`Factors: ${report.health.factors.join(', ')}`);
    }

    return lines.join('\n');
  }
}

/**
 * Singleton instance for convenience
 */
let reporterInstance: JSONReporter | null = null;

export function getJSONReporter(): JSONReporter {
  if (!reporterInstance) {
    reporterInstance = new JSONReporter();
  }
  return reporterInstance;
}

export const jsonReporter = new JSONReporter();

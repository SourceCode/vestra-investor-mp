/**
 * Report Command for E2E Tools
 *
 * Generates and displays comprehensive test reports
 * in JSON and HTML formats.
 *
 * Part of Phase 6: Reporting & Dashboards
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { ReportOptions, JSONReport } from '../types/index.js';
import { jsonReporter } from '../reporters/json-report.js';
import { htmlDashboard } from '../reporters/html-dashboard.js';

const execAsync = promisify(exec);

/**
 * Generate and display report
 */
export async function generateReport(
  options: ReportOptions = {}
): Promise<JSONReport> {
  const { format = 'both', open = false, save = true } = options;

  console.log('\n📊 Generating Report...\n');

  // Generate JSON report
  const report = jsonReporter.generate();

  if (format === 'json' || format === 'both') {
    if (save) {
      const jsonPath = jsonReporter.save(report, 'report.json');
      console.log(`📄 JSON report: ${jsonPath}`);
    } else {
      console.log(JSON.stringify(report, null, 2));
    }
  }

  if (format === 'html' || format === 'both') {
    const html = htmlDashboard.generate(report);
    const htmlPath = htmlDashboard.save(html);
    console.log(`🌐 HTML dashboard: ${htmlPath}`);

    if (open) {
      await openInBrowser(htmlPath);
    }
  }

  // Save to history
  jsonReporter.saveToHistory(report);
  console.log('\n✅ Report saved to history\n');

  // Print summary
  printReportSummary(report);

  return report;
}

/**
 * Generate JSON report only
 */
export function generateJSONReport(): JSONReport {
  return jsonReporter.generate();
}

/**
 * Generate and save HTML dashboard
 */
export function generateHTMLDashboard(report?: JSONReport): string {
  const reportData = report || jsonReporter.generate();
  const html = htmlDashboard.generate(reportData);
  return htmlDashboard.save(html);
}

/**
 * Get compact report summary
 */
export function getCompactReport(): string {
  const report = jsonReporter.generate();
  return jsonReporter.getCompactSummary(report);
}

/**
 * Open file in default browser
 */
async function openInBrowser(filePath: string): Promise<void> {
  try {
    const command =
      process.platform === 'darwin'
        ? `open "${filePath}"`
        : process.platform === 'win32'
          ? `start "" "${filePath}"`
          : `xdg-open "${filePath}"`;

    await execAsync(command);
    console.log('📖 Opened dashboard in browser');
  } catch (error) {
    console.log('Could not open browser automatically.');
    console.log(`Open manually: file://${filePath}`);
  }
}

/**
 * Print report summary to console
 */
function printReportSummary(report: JSONReport): void {
  console.log('═'.repeat(50));
  console.log(`Health Score: ${report.health.grade} (${report.health.score}/100)`);

  if (report.current.summary) {
    const { passed, total, failed } = report.current.summary;
    const passRate = ((passed / total) * 100).toFixed(1);
    console.log(`Pass Rate: ${passRate}% (${passed}/${total})`);
    console.log(`Failed: ${failed}`);
  }

  const fixableCount = report.current.analysis?.aggregatedCategories?.fixableErrors || 0;
  console.log(`Fixable Issues: ${fixableCount}`);

  if (report.comparison.passRateChange !== 0) {
    const change = report.comparison.passRateChange;
    const direction = change > 0 ? '+' : '';
    console.log(`Trend: ${direction}${change.toFixed(1)}% from last run`);
  }

  if (report.health.factors.length > 0) {
    console.log(`\nFactors:`);
    report.health.factors.forEach((f) => console.log(`  • ${f}`));
  }

  console.log('═'.repeat(50));
}

/**
 * Get health score summary
 */
export function getHealthSummary(): {
  grade: string;
  score: number;
  factors: string[];
} {
  const report = jsonReporter.generate();
  return report.health;
}

/**
 * Get trend data for AI consumption
 */
export function getTrendSummary(): {
  direction: 'improving' | 'declining' | 'stable';
  passRateChange: number;
  lastRuns: number;
} {
  const report = jsonReporter.generate();

  let direction: 'improving' | 'declining' | 'stable' = 'stable';
  if (report.comparison.passRateChange > 1) {
    direction = 'improving';
  } else if (report.comparison.passRateChange < -1) {
    direction = 'declining';
  }

  return {
    direction,
    passRateChange: report.comparison.passRateChange,
    lastRuns: report.trends.passRate.length,
  };
}

/**
 * Format report for AI agent consumption
 */
export function formatReportForAI(report: JSONReport): string {
  const lines: string[] = [];

  // Status line
  const grade = report.health.grade;
  const score = report.health.score;
  lines.push(`HEALTH:${grade}|SCORE:${score}`);

  // Metrics line
  if (report.current.summary) {
    const { passed, total, failed } = report.current.summary;
    lines.push(`TESTS:${passed}/${total}|FAIL:${failed}`);
  }

  // Fixable line
  const fixable = report.current.analysis?.aggregatedCategories?.fixableErrors || 0;
  if (fixable > 0) {
    lines.push(`FIXABLE:${fixable}|CMD:npm run e2e:fix -- --apply`);
  }

  // Trend line
  if (report.comparison.passRateChange !== 0) {
    const change = report.comparison.passRateChange;
    lines.push(`TREND:${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
  }

  return lines.join('\n');
}

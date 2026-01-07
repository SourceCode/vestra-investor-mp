/**
 * HTML Dashboard Generator for E2E Tools
 *
 * Generates a visual HTML dashboard for test results with charts,
 * health scores, and trend analysis.
 *
 * Part of Phase 6: Reporting & Dashboards
 */

import * as fs from 'fs';
import * as path from 'path';
import type { JSONReport } from '../types/index.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * HTML Dashboard Generator class
 */
export class HTMLDashboardGenerator {
  /**
   * Generate HTML dashboard from report
   */
  generate(report: JSONReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E2E Test Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 { font-size: 24px; margin-bottom: 10px; }
    .header .timestamp { color: #666; font-size: 14px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h2 {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .metric {
      font-size: 48px;
      font-weight: bold;
      line-height: 1.2;
    }
    .metric.pass { color: #22c55e; }
    .metric.fail { color: #ef4444; }
    .metric.warn { color: #f59e0b; }
    .label { color: #666; font-size: 14px; margin-top: 5px; }
    .health-score {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .grade {
      font-size: 64px;
      font-weight: bold;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .grade.A { background: #22c55e; color: white; }
    .grade.B { background: #84cc16; color: white; }
    .grade.C { background: #f59e0b; color: white; }
    .grade.D { background: #f97316; color: white; }
    .grade.F { background: #ef4444; color: white; }
    .factors { margin-top: 10px; padding-left: 0; list-style: none; }
    .factors li {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    .factors li::before {
      content: '•';
      position: absolute;
      left: 5px;
      color: #999;
    }
    .chart-container { height: 200px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9fafb; font-weight: 600; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge.fixable { background: #dbeafe; color: #1d4ed8; }
    .badge.manual { background: #fef3c7; color: #92400e; }
    .change { font-size: 14px; margin-top: 8px; }
    .change.positive { color: #22c55e; }
    .change.negative { color: #ef4444; }
    .command-box {
      background: #1e1e1e;
      color: #f0f0f0;
      padding: 10px 15px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
      margin-top: 10px;
    }
    .full-width { grid-column: 1 / -1; }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .score-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>E2E Test Dashboard</h1>
      <div class="timestamp">Generated: ${this.formatDate(report.generated)}</div>
    </div>

    <div class="grid">
      <!-- Summary Card -->
      <div class="card">
        <h2>Test Summary</h2>
        ${this.renderSummaryCard(report)}
      </div>

      <!-- Health Score Card -->
      <div class="card">
        <h2>Health Score</h2>
        ${this.renderHealthCard(report)}
      </div>

      <!-- Fixable Issues Card -->
      <div class="card">
        <h2>Fixable Issues</h2>
        ${this.renderFixableCard(report)}
      </div>

      <!-- Duration Card -->
      <div class="card">
        <h2>Duration</h2>
        ${this.renderDurationCard(report)}
      </div>
    </div>

    <!-- Trend Charts -->
    ${this.renderTrendChart(report)}

    <!-- Root Causes Table -->
    ${this.renderRootCausesTable(report)}

    <!-- Categories Table -->
    ${this.renderCategoriesTable(report)}
  </div>

  <script>
    ${this.renderChartScript(report)}
  </script>
</body>
</html>`;
  }

  /**
   * Save dashboard to file
   */
  save(html: string, filename: string = 'dashboard.html'): string {
    const dir = path.join(process.cwd(), CACHE_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, html);
    return filePath;
  }

  /**
   * Format date for display
   */
  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString();
  }

  /**
   * Render summary card content
   */
  private renderSummaryCard(report: JSONReport): string {
    if (!report.current.summary) {
      return '<div class="empty-state">No test data available</div>';
    }

    const { passed, total, failed } = report.current.summary;
    const metricClass = failed === 0 ? 'pass' : 'fail';

    let changeHtml = '';
    if (report.comparison.passRateChange !== 0) {
      const changeClass = report.comparison.passRateChange > 0 ? 'positive' : 'negative';
      const arrow = report.comparison.passRateChange > 0 ? '↑' : '↓';
      changeHtml = `
        <div class="change ${changeClass}">
          ${arrow} ${Math.abs(report.comparison.passRateChange).toFixed(1)}% from last run
        </div>`;
    }

    return `
      <div class="metric ${metricClass}">${passed}/${total}</div>
      <div class="label">Tests Passing</div>
      ${changeHtml}`;
  }

  /**
   * Render health score card content
   */
  private renderHealthCard(report: JSONReport): string {
    const { grade, score, factors } = report.health;

    let factorsHtml = '';
    if (factors.length > 0) {
      factorsHtml = `
        <ul class="factors">
          ${factors.map(f => `<li>${this.escapeHtml(f)}</li>`).join('')}
        </ul>`;
    }

    return `
      <div class="health-score">
        <div class="grade ${grade}">${grade}</div>
        <div class="score-details">
          <div class="metric">${score}</div>
          <div class="label">out of 100</div>
        </div>
      </div>
      ${factorsHtml}`;
  }

  /**
   * Render fixable issues card content
   */
  private renderFixableCard(report: JSONReport): string {
    const fixableCount = report.current.analysis?.aggregatedCategories?.fixableErrors || 0;
    const metricClass = fixableCount > 0 ? 'warn' : 'pass';

    let commandHtml = '';
    if (fixableCount > 0) {
      commandHtml = `
        <div class="command-box">npm run e2e:fix -- --apply</div>`;
    }

    return `
      <div class="metric ${metricClass}">${fixableCount}</div>
      <div class="label">Auto-fixable errors</div>
      ${commandHtml}`;
  }

  /**
   * Render duration card content
   */
  private renderDurationCard(report: JSONReport): string {
    const duration = report.current.duration || 'N/A';

    return `
      <div class="metric">${duration}</div>
      <div class="label">Total run time</div>`;
  }

  /**
   * Render trend chart section
   */
  private renderTrendChart(report: JSONReport): string {
    if (report.trends.passRate.length === 0) {
      return '';
    }

    return `
    <div class="card full-width" style="margin-top: 20px;">
      <h2>Pass Rate Trend</h2>
      <div class="chart-container">
        <canvas id="passRateChart"></canvas>
      </div>
    </div>`;
  }

  /**
   * Render root causes table
   */
  private renderRootCausesTable(report: JSONReport): string {
    if (report.rootCauses.length === 0) {
      return '';
    }

    const rows = report.rootCauses
      .slice(0, 10)
      .map(rc => `
        <tr>
          <td>${this.escapeHtml(rc.error)}</td>
          <td>${this.escapeHtml(rc.rootCause)}</td>
          <td>${(rc.confidence * 100).toFixed(0)}%</td>
          <td>
            <span class="badge ${rc.fixable ? 'fixable' : 'manual'}">
              ${rc.fixable ? 'Auto-fix' : 'Manual'}
            </span>
          </td>
        </tr>`)
      .join('');

    return `
    <div class="card full-width" style="margin-top: 20px;">
      <h2>Root Causes (${report.rootCauses.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Error</th>
            <th>Root Cause</th>
            <th>Confidence</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Render categories table
   */
  private renderCategoriesTable(report: JSONReport): string {
    const categories = report.current.analysis?.aggregatedCategories?.categories;
    if (!categories || categories.length === 0) {
      return '';
    }

    const rows = categories
      .map(cat => `
        <tr>
          <td>${this.escapeHtml(cat.category)}</td>
          <td>${cat.count}</td>
          <td>${cat.fixableCount}</td>
          <td>${this.escapeHtml(cat.primaryRootCause)}</td>
        </tr>`)
      .join('');

    return `
    <div class="card full-width" style="margin-top: 20px;">
      <h2>Error Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Count</th>
            <th>Fixable</th>
            <th>Root Cause</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Render Chart.js initialization script
   */
  private renderChartScript(report: JSONReport): string {
    if (report.trends.passRate.length === 0) {
      return '// No trend data available';
    }

    const labels = report.trends.passRate
      .map(t => new Date(t.date).toLocaleDateString())
      .reverse();
    const data = report.trends.passRate.map(t => t.value).reverse();

    return `
    // Pass Rate Trend Chart
    const ctx = document.getElementById('passRateChart');
    if (ctx) {
      new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [{
            label: 'Pass Rate %',
            data: ${JSON.stringify(data)},
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Singleton instance for convenience
 */
let dashboardInstance: HTMLDashboardGenerator | null = null;

export function getHTMLDashboardGenerator(): HTMLDashboardGenerator {
  if (!dashboardInstance) {
    dashboardInstance = new HTMLDashboardGenerator();
  }
  return dashboardInstance;
}

export const htmlDashboard = new HTMLDashboardGenerator();

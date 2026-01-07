/**
 * Semantic Codes Module for E2E Tools
 *
 * Provides ultra-compressed output formats for AI agent consumption.
 * Converts verbose reports into compact semantic codes.
 *
 * Part of Phase 7: Token Optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import type { TestSummary, EnhancedAnalysisResult } from '../types/index.js';

const PATTERNS_DIR = path.join(process.cwd(), 'scripts/e2e-tools/patterns');

/**
 * Status code type
 */
export type StatusCode = 'P' | 'F' | 'X' | 'B';

/**
 * Category code type
 */
export type CategoryCode = 'BC' | 'TO' | 'NF' | 'NE' | 'SE' | 'AE' | 'PE' | 'DE' | 'UN';

/**
 * Action code type
 */
export type ActionCode = 'AF' | 'RA' | 'RT' | 'DA' | 'MF' | 'CI';

/**
 * Fix code type
 */
export type FixCode = 'LI' | 'DI' | 'BG' | 'DC' | 'WT' | 'RL';

/**
 * Compressed report interface
 */
export interface CompressedReport {
  raw: string;
  status: StatusCode;
  failed: number;
  total: number;
  category?: CategoryCode;
  categoryCount?: number;
  fix?: FixCode;
  action: ActionCode;
}

/**
 * Semantic codes registry
 */
interface SemanticCodesRegistry {
  status: Record<string, { code: string; name: string; description: string; action: string }>;
  categories: Record<string, { code: string; name: string; description: string; pattern: string }>;
  actions: Record<string, { code: string; name: string; description: string; command: string | null }>;
  fixes: Record<string, { code: string; name: string; description: string; template: string }>;
  errorTaxonomy: Record<string, string>;
  formatTemplates: Record<string, string>;
}

/**
 * Load semantic codes registry
 */
function loadSemanticCodes(): SemanticCodesRegistry {
  const filePath = path.join(PATTERNS_DIR, 'semantic-codes.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  throw new Error('Semantic codes registry not found');
}

let cachedCodes: SemanticCodesRegistry | null = null;

function getCodes(): SemanticCodesRegistry {
  if (!cachedCodes) {
    cachedCodes = loadSemanticCodes();
  }
  return cachedCodes;
}

/**
 * Get status code from test results
 */
export function getStatusCode(
  summary: TestSummary | null,
  hasFixableErrors: boolean = false,
  isBlocked: boolean = false
): StatusCode {
  if (isBlocked) return 'B';
  if (!summary) return 'B';
  if (summary.failed === 0) return 'P';
  if (hasFixableErrors) return 'X';
  return 'F';
}

/**
 * Map category name to code
 */
export function getCategoryCode(categoryName: string): CategoryCode {
  const categoryMap: Record<string, CategoryCode> = {
    browser_compat: 'BC',
    browser_compatibility: 'BC',
    timeout: 'TO',
    element_not_found: 'NF',
    selector_not_found: 'NF',
    network_error: 'NE',
    network: 'NE',
    server_error: 'SE',
    assertion_error: 'AE',
    assertion: 'AE',
    permission_error: 'PE',
    auth_error: 'PE',
    database_error: 'DE',
    database: 'DE',
  };
  return categoryMap[categoryName.toLowerCase()] || 'UN';
}

/**
 * Map fix template to code
 */
export function getFixCode(fixTemplate: string): FixCode {
  const fixMap: Record<string, FixCode> = {
    'lazy-initialization': 'LI',
    'lazy_initialization': 'LI',
    'dynamic-import': 'DI',
    'dynamic_import': 'DI',
    'browser-guard': 'BG',
    'browser_guard': 'BG',
    'dbclient-migration': 'DC',
    'dbclient_migration': 'DC',
    'timeout-increase': 'WT',
    'timeout_increase': 'WT',
    'retry-logic': 'RL',
    'retry_logic': 'RL',
  };
  return fixMap[fixTemplate.toLowerCase()] || 'LI';
}

/**
 * Get action code from status
 */
export function getActionCode(status: StatusCode, hasDeepAnalysis: boolean = false): ActionCode {
  switch (status) {
    case 'P': return 'RT'; // Re-test to confirm
    case 'X': return 'AF'; // Auto-fix available
    case 'F': return hasDeepAnalysis ? 'DA' : 'RA'; // Analyze or deep analyze
    case 'B': return 'CI'; // Check infrastructure
    default: return 'RA';
  }
}

/**
 * Compress a full report into ultra-compact format
 */
export function compressReport(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null
): CompressedReport {
  const fixableCount = analysis?.aggregatedCategories?.fixableErrors || 0;
  const hasFixable = fixableCount > 0;

  const status = getStatusCode(summary, hasFixable);
  const failed = summary?.failed || 0;
  const total = summary?.total || 0;

  // Get primary category
  let category: CategoryCode | undefined;
  let categoryCount: number | undefined;
  let fix: FixCode | undefined;

  if (analysis?.aggregatedCategories?.categories && analysis.aggregatedCategories.categories.length > 0) {
    const primaryCategory = analysis.aggregatedCategories.categories[0];
    category = getCategoryCode(primaryCategory.category);
    categoryCount = primaryCategory.count;

    // Determine fix based on category
    if (category === 'BC') {
      fix = 'LI';
    } else if (category === 'TO') {
      fix = 'WT';
    }
  }

  const action = getActionCode(status, false);

  // Build compressed string
  let raw = `${status}:${failed}/${total}`;
  if (category && categoryCount) {
    raw += `|${category}:${categoryCount}`;
    if (fix) {
      raw += `@${fix}`;
    }
  }
  raw += `|${action}`;

  return {
    raw,
    status,
    failed,
    total,
    category,
    categoryCount,
    fix,
    action,
  };
}

/**
 * Get minimal status string (1-5 tokens)
 */
export function getMinimalStatus(summary: TestSummary | null, hasFixable: boolean = false): string {
  const status = getStatusCode(summary, hasFixable);
  if (status === 'P') return 'P';
  return `${status}:${summary?.failed || 0}`;
}

/**
 * Get compact status with category (10-50 tokens)
 */
export function getCompactStatus(
  summary: TestSummary | null,
  analysis: EnhancedAnalysisResult | null
): string {
  const compressed = compressReport(summary, analysis);
  return compressed.raw;
}

/**
 * Expand a compressed code to full description
 */
export function expandCode(code: string): string {
  const codes = getCodes();

  // Check if it's a status code
  if (codes.status[code]) {
    return codes.status[code].description;
  }

  // Check if it's a category code
  if (codes.categories[code]) {
    return codes.categories[code].description;
  }

  // Check if it's an action code
  if (codes.actions[code]) {
    return codes.actions[code].description;
  }

  // Check if it's a fix code
  if (codes.fixes[code]) {
    return codes.fixes[code].description;
  }

  return code;
}

/**
 * Get command for an action code
 */
export function getActionCommand(actionCode: ActionCode): string | null {
  const codes = getCodes();
  return codes.actions[actionCode]?.command || null;
}

/**
 * Format taxonomy code for a category
 */
export function getTaxonomyCode(category: string, subCategory?: string): string {
  const codes = getCodes();

  // Map category to taxonomy
  const taxonomyMap: Record<string, string> = {
    browser_compat: '1.0.0',
    typeorm: '1.1.0',
    nodejs_api: '1.2.0',
    timeout: '2.1.0',
    element_not_found: '2.2.0',
    network: '3.1.0',
    server_error: '3.2.0',
  };

  return taxonomyMap[category] || '0.0.0';
}

/**
 * Parse a compressed report string
 */
export function parseCompressedReport(raw: string): Partial<CompressedReport> {
  const result: Partial<CompressedReport> = { raw };

  // Parse status:failed/total
  const statusMatch = raw.match(/^([PFXB]):(\d+)(?:\/(\d+))?/);
  if (statusMatch) {
    result.status = statusMatch[1] as StatusCode;
    result.failed = parseInt(statusMatch[2], 10);
    result.total = statusMatch[3] ? parseInt(statusMatch[3], 10) : result.failed;
  }

  // Parse category:count@fix
  const categoryMatch = raw.match(/\|([A-Z]{2}):(\d+)(?:@([A-Z]{2}))?/);
  if (categoryMatch) {
    result.category = categoryMatch[1] as CategoryCode;
    result.categoryCount = parseInt(categoryMatch[2], 10);
    if (categoryMatch[3]) {
      result.fix = categoryMatch[3] as FixCode;
    }
  }

  // Parse action
  const actionMatch = raw.match(/\|([A-Z]{2})$/);
  if (actionMatch) {
    result.action = actionMatch[1] as ActionCode;
  }

  return result;
}

/**
 * Get all available codes with descriptions
 */
export function getAllCodes(): {
  status: Record<string, string>;
  categories: Record<string, string>;
  actions: Record<string, string>;
  fixes: Record<string, string>;
} {
  const codes = getCodes();

  return {
    status: Object.fromEntries(
      Object.entries(codes.status).map(([k, v]) => [k, v.description])
    ),
    categories: Object.fromEntries(
      Object.entries(codes.categories).map(([k, v]) => [k, v.description])
    ),
    actions: Object.fromEntries(
      Object.entries(codes.actions).map(([k, v]) => [k, v.description])
    ),
    fixes: Object.fromEntries(
      Object.entries(codes.fixes).map(([k, v]) => [k, v.description])
    ),
  };
}

/**
 * Format codes reference for AI agent context
 */
export function formatCodesReference(): string {
  const allCodes = getAllCodes();

  const lines: string[] = [
    'SEMANTIC CODES REFERENCE:',
    'Status: P=Pass F=Fail X=Fixable B=Blocked',
    'Categories: BC=Browser TO=Timeout NF=NotFound NE=Network AE=Assertion',
    'Actions: AF=AutoFix RT=ReTest DA=DeepAnalyze CI=CheckInfra',
    'Fixes: LI=LazyInit DI=DynamicImport BG=BrowserGuard',
  ];

  return lines.join('\n');
}

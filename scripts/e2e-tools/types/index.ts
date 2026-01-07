/**
 * E2E Test Analysis Types
 *
 * Core type definitions for the E2E test optimization tooling.
 * These types provide structure for test results, error analysis,
 * and AI agent communication.
 */

/**
 * Result of a single test execution
 */
export interface TestResult {
  name: string;
  file: string;
  line: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: TestError;
  project: string;
}

/**
 * Detailed error information extracted from test failures
 */
export interface TestError {
  message: string;
  stack?: string;
  category: ErrorCategory;
  file?: string;
  line?: number;
  column?: number;
  snippet?: string;
  domSnapshot?: string;
  screenshotPath?: string;
}

/**
 * Error categories for classification and routing to appropriate fix strategies
 */
export type ErrorCategory =
  | 'browser_compat'      // Browser-incompatible code (AppDataSource, etc.)
  | 'element_not_found'   // DOM element missing
  | 'timeout'             // Test timeout
  | 'assertion'           // Assertion failure
  | 'network'             // Network/API error
  | 'server_error'        // 500 errors from server
  | 'unknown';

/**
 * Complete analysis result from a test run
 */
export interface AnalysisResult {
  timestamp: string;
  summary: TestSummary;
  results: TestResult[];
  categories: CategorySummary;
  rootCauses: RootCause[];
  suggestedFixes: SuggestedFix[];
  nextSteps: string[];
}

/**
 * High-level test run summary
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  projects: string[];
}

/**
 * Summary of errors by category
 */
export interface CategorySummary {
  [key: string]: {
    count: number;
    percentage: number;
    rootCause?: string;
    fixAvailable: boolean;
    examples: string[];
  };
}

/**
 * Identified root cause of test failures
 */
export interface RootCause {
  id: string;
  category: ErrorCategory;
  description: string;
  affectedTests: number;
  file?: string;
  line?: number;
  importChain?: string[];
  fixStrategy: string;
}

/**
 * Generated fix suggestion
 */
export interface SuggestedFix {
  id: string;
  priority: number;
  rootCauseId: string;
  type: FixType;
  file: string;
  description: string;
  code?: string;
  command?: string;
  confidence: number;
}

/**
 * Types of automated fixes that can be applied
 */
export type FixType =
  | 'lazy_init'           // Convert eager to lazy initialization
  | 'trpc_migration'      // Migrate to tRPC
  | 'browser_guard'       // Add isBrowser guard
  | 'dynamic_import'      // Convert to dynamic import
  | 'test_selector'       // Fix test selector
  | 'timeout_increase'    // Increase timeout
  | 'manual';             // Requires manual intervention

/**
 * Pattern definition for matching errors
 */
export interface ErrorPattern {
  id: string;
  name: string;
  category: ErrorCategory;
  patterns: RegExp[];
  extractors: {
    file?: RegExp;
    line?: RegExp;
    message?: RegExp;
  };
  fixStrategy: FixType;
  description: string;
}

/**
 * AI-optimized summary format for Claude agent consumption
 */
export interface AIAgentSummary {
  summary: TestSummary;
  categories: {
    [key: string]: {
      count: number;
      root_cause: string;
      fix_available: boolean;
      fix_command?: string;
    };
  };
  action_required: ActionItem[];
  next_steps: string[];
}

/**
 * Single action item for AI agent to execute
 */
export interface ActionItem {
  priority: number;
  type: ErrorCategory;
  file: string;
  line?: number;
  fix: string;
  command?: string;
}

// ============================================================
// Phase 7 Optimization Types (from OPTIMIZATIONS.md)
// ============================================================

/**
 * Binary status codes for ultra-minimal output
 * 0 = PASS, 1 = FAIL, 2 = FIXABLE, 3 = BLOCKED
 */
export type BinaryStatusCode = 0 | 1 | 2 | 3;

/**
 * Semantic compression codes for compact reporting
 */
export interface SemanticCodes {
  status: {
    P: 'PASS';
    F: 'FAIL';
    X: 'FIXABLE';
    B: 'BLOCKED';
  };
  categories: {
    BC: 'browser_compat';
    TO: 'timeout';
    NF: 'element_not_found';
    NE: 'network';
    SE: 'server_error';
    AE: 'assertion';
  };
  actions: {
    AF: 'auto-fix';
    RT: 're-test';
    RA: 're-analyze';
    DA: 'deep-analyze';
    MF: 'manual-fix';
  };
  fixes: {
    LI: 'lazy-init';
    DI: 'dynamic-import';
    BG: 'browser-guard';
    TM: 'trpc-migration';
  };
}

/**
 * Differential report showing only changes since last run
 */
export interface DiffReport {
  unchanged: boolean;
  newFailures?: string[];
  fixedTests?: string[];
  changedCategories?: {
    category: string;
    delta: number;
  }[];
  action?: 'FIX' | 'INVESTIGATE' | 'NONE';
  command?: string;
}

/**
 * Pre-computed action for AI agent to execute directly
 */
export interface PrecomputedAction {
  id: string;
  description: string;
  bash: string;
  tool: 'Bash' | 'Edit' | 'Read';
  params: Record<string, string>;
  expect: 'tests_pass' | 'fewer_failures' | 'fix_applied';
}

/**
 * Session context for deduplication
 */
export interface SessionContext {
  sessionId: string;
  communicated: {
    patterns: string[];
    files: string[];
    rootCauses: string[];
    fixes: string[];
  };
  lastReportHash: string;
}

/**
 * Progressive disclosure levels
 */
export type DisclosureLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Output at each disclosure level
 */
export interface ProgressiveOutput {
  level: DisclosureLevel;
  content: string;
  tokens: number;
}

// ============================================================
// Phase 2: Error Pattern Detection Types
// ============================================================

/**
 * Severity levels for error patterns
 */
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Pattern definition loaded from error-patterns.json
 */
export interface ErrorPatternDef {
  id: string;
  name: string;
  category: string;
  severity: ErrorSeverity;
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
  severity: ErrorSeverity;
  confidence: number;
  rootCause: string;
  fixAvailable: boolean;
  fixTemplate?: string;
  suggestions: string[];
  requiresImportTrace: boolean;
  semanticCode?: string;
}

/**
 * Complete match result for an error
 */
export interface PatternMatchResult {
  error: TestError;
  matches: PatternMatch[];
  bestMatch: PatternMatch | null;
  category: ErrorCategory;
  confidence: number;
}

/**
 * Summary of errors for a single category
 */
export interface CategorySummaryDetail {
  category: string;
  semanticCode: string;
  count: number;
  fixableCount: number;
  primaryRootCause: string;
  affectedFiles: string[];
  severity: ErrorSeverity;
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
  categories: CategorySummaryDetail[];
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
 * Error fingerprint for deduplication
 */
export interface ErrorFingerprint {
  hash: string;
  shortHash: string;
  features: string[];
  category: ErrorCategory;
  file?: string;
  normalizedMessage: string;
}

/**
 * Grouped errors by fingerprint
 */
export interface ErrorGroup {
  fingerprint: ErrorFingerprint;
  errors: TestError[];
  count: number;
  testNames: string[];
}

/**
 * Deduplication result
 */
export interface DeduplicationResult {
  unique: TestError[];
  groups: ErrorGroup[];
  totalCount: number;
  uniqueCount: number;
  duplicateCount: number;
  deduplicationRatio: number;
}

/**
 * Enhanced analysis result with pattern matching (Phase 2)
 */
export interface EnhancedAnalysisResult extends AnalysisResult {
  patternMatches?: PatternMatchResult[];
  aggregatedCategories?: AggregatedCategories;
  actionItems?: CategoryActionItem[];
  deduplication?: DeduplicationResult;
}

// ============================================================
// Phase 3: Root Cause Analysis Types
// ============================================================

/**
 * Node in an import chain
 */
export interface ImportNode {
  file: string;
  imports: string[];
  depth: number;
  hasTargetImport: boolean;
  problematicExports: string[];
}

/**
 * Complete import chain result
 */
export interface ImportChain {
  startFile: string;
  chain: ImportNode[];
  found: boolean;
  targetPattern?: string;
  error?: string;
}

/**
 * Browser-incompatible API definition
 */
export interface BrowserAPI {
  name: string;
  pattern: string;
  severity: ErrorSeverity;
  reason: string;
  fix: string;
}

/**
 * Single browser incompatibility issue
 */
export interface BrowserIncompatibility {
  api: string;
  pattern: string;
  severity: ErrorSeverity;
  reason: string;
  fix: string;
  file: string;
  line: number;
  column: number;
  matchedText: string;
  lineContent: string;
}

/**
 * Result of browser compatibility analysis
 */
export interface BrowserCompatResult {
  file: string;
  issues: BrowserIncompatibility[];
  isServerOnly: boolean;
  hasCriticalIssues: boolean;
  totalIssues: number;
}

/**
 * UI element from DOM snapshot
 */
export interface UIElement {
  type: string;
  attributes: Record<string, string>;
  text?: string;
  children: UIElement[];
}

/**
 * Complete DOM snapshot
 */
export interface DOMSnapshot {
  elements: UIElement[];
  raw: string;
}

/**
 * Result of DOM snapshot analysis
 */
export interface DOMAnalysisResult {
  file: string;
  testName: string;
  browser: string;
  snapshot: DOMSnapshot;
  issues: string[];
  hasErrorState: boolean;
  hasLoadingState: boolean;
  visibleText: string;
}

/**
 * Suggested fix for a root cause
 */
export interface SuggestedRootCauseFix {
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
  suggestedFixes: SuggestedRootCauseFix[];
  analysisTime: number;
}

/**
 * Deep analysis result with full root cause information
 */
export interface DeepAnalysisResult extends EnhancedAnalysisResult {
  rootCauseAnalyses?: RootCauseAnalysis[];
  browserCompatSummary?: {
    totalIssues: number;
    criticalIssues: number;
    affectedFiles: string[];
  };
  importTraceSummary?: {
    tracedFiles: number;
    problematicImports: number;
    rootCauseFiles: string[];
  };
}

// ============================================================
// Phase 4: Auto-Fix Generation Types
// ============================================================

/**
 * Pattern replacement definition
 */
export interface PatternReplacement {
  match: string;
  replace: string;
}

/**
 * Import update definition for cascading changes
 */
export interface ImportUpdate {
  match: string;
  replace: string;
}

/**
 * Fix template defining a code transformation
 */
export interface FixTemplate {
  id: string;
  name: string;
  description: string;
  patterns: PatternReplacement[];
  importUpdates?: ImportUpdate[];
  postPatterns?: Array<{ append: string }>;
  asyncWrapper?: boolean;
  manualSteps?: string[];
  validation: string;
}

/**
 * Individual code change within a fix
 */
export interface CodeChange {
  type: 'replace' | 'insert' | 'delete';
  lineStart: number;
  lineEnd: number;
  original: string;
  replacement: string;
  description: string;
}

/**
 * Complete generated fix for a file
 */
export interface GeneratedFix {
  file: string;
  templateId: string;
  templateName: string;
  changes: CodeChange[];
  originalContent: string;
  modifiedContent: string;
  manualSteps: string[];
  validation: string;
}

/**
 * Result of applying a fix
 */
export interface ApplyResult {
  success: boolean;
  file: string;
  changes?: number;
  error?: string;
  dryRun: boolean;
  preview?: string;
  backupPath?: string;
}

/**
 * Options for applying fixes
 */
export interface ApplyOptions {
  dryRun?: boolean;
  backup?: boolean;
}

/**
 * Options for fix command
 */
export interface FixCommandOptions {
  dryRun?: boolean;
  pattern?: string;
  file?: string;
  apply?: boolean;
  template?: string;
}

/**
 * Fix generation statistics
 */
export interface FixGenerationStats {
  totalAnalyzed: number;
  fixesGenerated: number;
  filesAffected: number;
  byTemplate: Record<string, number>;
  manualStepsRequired: number;
}

/**
 * Complete fix report for AI agent consumption
 */
export interface FixReport {
  timestamp: string;
  stats: FixGenerationStats;
  fixes: GeneratedFix[];
  manualSteps: string[];
  nextActions: string[];
}

// ============================================================
// Phase 5: AI Agent Commands Types
// ============================================================

/**
 * AI action item for agent consumption
 */
export interface AIActionItem {
  priority: number;
  type: 'auto' | 'manual';
  description: string;
  command?: string;
  file?: string;
  line?: number;
  impact?: number;
}

/**
 * Compact metrics for AI summary
 */
export interface AIMetrics {
  total: number;
  passed: number;
  failed: number;
  fixable: number;
  unique: number;
}

/**
 * AI-optimized summary format
 */
export interface AISummary {
  status: 'PASS' | 'FAIL' | 'FIXABLE';
  metrics: AIMetrics;
  actions: AIActionItem[];
  primary_issue: string | null;
  next_commands: string[];
  focus_files: string[];
  root_causes: string[];
}

/**
 * Options for AI command
 */
export interface AICommandOptions {
  format?: 'cli' | 'json' | 'oneline';
  deep?: boolean;
  skipRun?: boolean;
  filter?: string;
}

/**
 * Watch mode options
 */
export interface WatchOptions {
  paths?: string[];
  debounce?: number;
}

/**
 * Command alias definition
 */
export interface CommandAlias {
  command: string;
  description: string;
}

// ============================================================
// Phase 6: Reporting & Dashboards Types
// ============================================================

/**
 * Complete test run result for history tracking
 */
export interface TestRunResult {
  timestamp: string;
  summary: TestSummary;
  duration: string;
  tests: TestResult[];
}

/**
 * Trend data point for historical tracking
 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/**
 * Complete trend data for all metrics
 */
export interface TrendData {
  passRate: TrendDataPoint[];
  failureCount: TrendDataPoint[];
  fixableCount: TrendDataPoint[];
  duration: TrendDataPoint[];
}

/**
 * Comparison between current and previous run
 */
export interface HistoryComparison {
  passRateChange: number;
  failureChange: number;
  newFailures: string[];
  fixedTests: string[];
}

/**
 * Health score calculation result
 */
export interface HealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: string[];
}

/**
 * Root cause summary for report
 */
export interface RootCauseSummary {
  error: string;
  rootCause: string;
  confidence: number;
  fixable: boolean;
}

/**
 * Complete JSON report for history and dashboards
 */
export interface JSONReport {
  generated: string;
  version: string;
  current: {
    timestamp: string | null;
    summary: TestSummary | null;
    duration: string | null;
    analysis: EnhancedAnalysisResult | null;
  };
  trends: TrendData;
  rootCauses: RootCauseSummary[];
  comparison: HistoryComparison;
  health: HealthScore;
}

/**
 * Options for report generation
 */
export interface ReportOptions {
  format?: 'json' | 'html' | 'both';
  open?: boolean;
  save?: boolean;
}

// ============================================================
// Phase 7: Token Optimization Types (Extended)
// ============================================================

/**
 * Change analysis result from git diff
 */
export interface ChangeAnalysis {
  changedFiles: string[];
  affectedTests: string[];
  skipReason?: string;
  summary: {
    totalChanges: number;
    sourceChanges: number;
    testChanges: number;
    configChanges: number;
  };
}

/**
 * Import graph node for dependency tracking
 */
export interface ImportGraphNode {
  file: string;
  imports: string[];
  importedBy: string[];
  hash: string;
  lastModified: number;
}

/**
 * Cached import graph for fast dependency lookups
 */
export interface ImportGraphCache {
  version: string;
  generated: string;
  rootDir: string;
  nodes: Record<string, ImportGraphNode>;
  stats: {
    totalFiles: number;
    totalEdges: number;
    buildTime: number;
  };
}

/**
 * Session-aware report with deduplication
 */
export interface SessionAwareReport {
  isNew: boolean;
  newOnly: boolean;
  newPatterns: string[];
  newFiles: string[];
  newRootCauses: string[];
  newFixes: string[];
  newErrors: string[];
  alreadyKnown: {
    patterns: string[];
    rootCauses: string[];
    fixes: string[];
  };
  skipPatterns: boolean;
  skipRootCauses: boolean;
  skipFixes: boolean;
}

/**
 * Extended session context with metadata
 */
export interface ExtendedSessionContext extends SessionContext {
  created: string;
  lastUpdated: string;
  reportHashes: string[];
  metadata: {
    totalReports: number;
    tokensEstimated: number;
  };
}

/**
 * Action priority for precomputed actions
 */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Complete action set from precomputed actions
 */
export interface ActionSet {
  status: 'P' | 'F' | 'X' | 'B';
  primary: PrecomputedActionExtended;
  alternatives: PrecomputedActionExtended[];
  sequence?: PrecomputedActionExtended[];
  metadata: {
    generated: string;
    totalActions: number;
    totalFixable: number;
  };
}

/**
 * Extended precomputed action with impact estimates
 */
export interface PrecomputedActionExtended {
  id: string;
  priority: ActionPriority;
  code: string;
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
 * Compact status options
 */
export interface CompactStatusOptions {
  format?: 'minimal' | 'compact' | 'ultra';
  includeAction?: boolean;
  includeFix?: boolean;
}

/**
 * Diff reporter options
 */
export interface DiffReportOptions {
  baseRef?: string;
  format?: 'compact' | 'json' | 'summary';
}

/**
 * Smart run options for change-based testing
 */
export interface SmartRunOptions {
  baseRef?: string;
  useCache?: boolean;
  maxTests?: number;
}

/**
 * Output format options
 */
export interface OutputFormatOptions {
  sessionId?: string;
  diff?: boolean;
  level?: DisclosureLevel;
}

// Re-export semantic codes types
export type StatusCode = 'P' | 'F' | 'X' | 'B';
export type CategoryCode = 'BC' | 'TO' | 'NF' | 'NE' | 'SE' | 'AE' | 'PE' | 'DE' | 'UN';
export type ActionCode = 'AF' | 'RA' | 'RT' | 'DA' | 'MF' | 'CI';
export type FixCode = 'LI' | 'DI' | 'BG' | 'DC' | 'WT' | 'RL';

/**
 * Compressed report for minimal token usage
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

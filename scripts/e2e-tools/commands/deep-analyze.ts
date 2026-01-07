/**
 * Deep Analysis Command
 *
 * Performs comprehensive root cause analysis on test failures
 * including import tracing, browser compatibility checks, and DOM analysis.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  AnalysisResult,
  DeepAnalysisResult,
  RootCauseAnalysis,
  TestError,
} from '../types/index.js';
import { getPatternMatcher } from '../analyzers/pattern-matcher.js';
import { getFingerprinter } from '../analyzers/fingerprint.js';
import { getRootCauseSynthesizer } from '../analyzers/root-cause-synthesizer.js';
import { getBrowserCompatAnalyzer } from '../analyzers/browser-compat.js';
import { getImportTracer } from '../analyzers/import-tracer.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';
const RESULTS_FILE = path.join(CACHE_DIR, 'last-run.json');
const DEEP_ANALYSIS_FILE = path.join(CACHE_DIR, 'deep-analysis.json');

/**
 * Load the last test run results from cache
 */
function loadLastRun(): AnalysisResult | null {
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
 * Run deep analysis on test failures
 */
export function runDeepAnalysis(): DeepAnalysisResult | null {
  const analysis = loadLastRun();
  if (!analysis) return null;

  // Validate analysis has required data
  if (!analysis.results || !analysis.summary) {
    console.error('Invalid analysis data. Run: npm run e2e:run');
    return null;
  }

  console.log('\n🔬 Deep Analysis Mode');
  console.log('═'.repeat(50));
  console.log('Tracing imports and analyzing root causes...\n');

  const startTime = Date.now();

  // Get analyzers
  const fingerprinter = getFingerprinter();
  const patternMatcher = getPatternMatcher();
  const rootCauseSynthesizer = getRootCauseSynthesizer();
  const browserAnalyzer = getBrowserCompatAnalyzer();
  const importTracer = getImportTracer();

  // Extract errors from results
  const errors: TestError[] = (analysis.results || [])
    .filter((r) => r.error)
    .map((r) => r.error!);

  const testNames = analysis.results
    .filter((r) => r.error)
    .map((r) => r.name);

  if (errors.length === 0) {
    console.log('✅ No errors to analyze. All tests passed!\n');
    return {
      ...analysis,
      rootCauseAnalyses: [],
    };
  }

  // Deduplicate errors
  const deduplication = fingerprinter.deduplicate(errors, testNames);
  console.log(`📊 Total Errors: ${deduplication.totalCount}`);
  console.log(`🔢 Unique Errors: ${deduplication.uniqueCount}`);
  console.log(
    `♻️  Duplicates: ${deduplication.duplicateCount} (${Math.round(deduplication.deduplicationRatio * 100)}%)\n`
  );

  // Analyze each unique error
  const rootCauseAnalyses: RootCauseAnalysis[] = [];
  let analyzed = 0;

  console.log('🔍 Analyzing root causes...\n');

  for (const error of deduplication.unique) {
    analyzed++;
    const shortMessage = error.message.substring(0, 50).replace(/\n/g, ' ');
    console.log(`[${analyzed}/${deduplication.uniqueCount}] ${shortMessage}...`);

    // Match pattern first
    const patternMatch = patternMatcher.match(error);

    // Only do deep analysis for high-confidence matches
    if (patternMatch.confidence > 0.3) {
      const rootCauseAnalysis = rootCauseSynthesizer.analyze(error, patternMatch);
      rootCauseAnalyses.push(rootCauseAnalysis);

      // Print summary
      console.log(`    ├─ Category: ${patternMatch.category}`);
      console.log(`    ├─ Confidence: ${Math.round(rootCauseAnalysis.confidence * 100)}%`);
      console.log(`    ├─ Root cause: ${rootCauseAnalysis.rootCause.substring(0, 60)}...`);

      if (rootCauseAnalysis.suggestedFixes.length > 0) {
        const topFix = rootCauseAnalysis.suggestedFixes[0];
        console.log(`    └─ Top fix: ${topFix.description}`);
      }
      console.log('');
    } else {
      console.log(`    └─ Low confidence match (${Math.round(patternMatch.confidence * 100)}%) - skipped\n`);
    }
  }

  // Generate summary statistics
  const browserCompatSummary = generateBrowserCompatSummary(rootCauseAnalyses);
  const importTraceSummary = generateImportTraceSummary(rootCauseAnalyses);

  // Build result
  const deepAnalysis: DeepAnalysisResult = {
    ...analysis,
    rootCauseAnalyses,
    browserCompatSummary,
    importTraceSummary,
  };

  // Save results
  fs.writeFileSync(DEEP_ANALYSIS_FILE, JSON.stringify(deepAnalysis, null, 2));

  const duration = Date.now() - startTime;

  // Print final summary
  printDeepAnalysisSummary(deepAnalysis, duration);

  return deepAnalysis;
}

/**
 * Generate browser compatibility summary
 */
function generateBrowserCompatSummary(
  analyses: RootCauseAnalysis[]
): DeepAnalysisResult['browserCompatSummary'] {
  const allIssues = analyses.flatMap((a) =>
    a.browserCompatIssues.flatMap((bc) => bc.issues)
  );

  const affectedFiles = [
    ...new Set(allIssues.map((i) => i.file)),
  ];

  return {
    totalIssues: allIssues.length,
    criticalIssues: allIssues.filter((i) => i.severity === 'critical').length,
    affectedFiles,
  };
}

/**
 * Generate import trace summary
 */
function generateImportTraceSummary(
  analyses: RootCauseAnalysis[]
): DeepAnalysisResult['importTraceSummary'] {
  const tracedChains = analyses
    .filter((a) => a.importChain !== null)
    .map((a) => a.importChain!);

  const allFiles = tracedChains.flatMap((chain) =>
    chain.chain.map((node) => node.file)
  );

  const problematicFiles = tracedChains
    .flatMap((chain) => chain.chain)
    .filter((node) => node.problematicExports.length > 0)
    .map((node) => node.file);

  return {
    tracedFiles: [...new Set(allFiles)].length,
    problematicImports: problematicFiles.length,
    rootCauseFiles: [...new Set(problematicFiles)],
  };
}

/**
 * Print deep analysis summary
 */
function printDeepAnalysisSummary(
  analysis: DeepAnalysisResult,
  duration: number
): void {
  console.log('═'.repeat(50));
  console.log('📊 Deep Analysis Summary');
  console.log('─'.repeat(50));

  console.log(`  Total: ${analysis.summary.total} | Pass: ${analysis.summary.passed} | Fail: ${analysis.summary.failed}`);
  console.log(`  Analyzed: ${analysis.rootCauseAnalyses?.length || 0} unique errors`);
  console.log(`  Duration: ${duration}ms\n`);

  // Browser compatibility
  if (analysis.browserCompatSummary) {
    const bc = analysis.browserCompatSummary;
    console.log('🌐 Browser Compatibility');
    console.log('─'.repeat(50));
    console.log(`  Issues: ${bc.totalIssues} (${bc.criticalIssues} critical)`);
    if (bc.affectedFiles.length > 0) {
      console.log(`  Files: ${bc.affectedFiles.slice(0, 3).map(f => f.split('/').pop()).join(', ')}${bc.affectedFiles.length > 3 ? '...' : ''}`);
    }
    console.log('');
  }

  // Import traces
  if (analysis.importTraceSummary) {
    const imp = analysis.importTraceSummary;
    console.log('📦 Import Analysis');
    console.log('─'.repeat(50));
    console.log(`  Files traced: ${imp.tracedFiles}`);
    console.log(`  Problematic imports: ${imp.problematicImports}`);
    if (imp.rootCauseFiles.length > 0) {
      console.log(`  Root cause files: ${imp.rootCauseFiles.map(f => f.split('/').pop()).join(', ')}`);
    }
    console.log('');
  }

  // Top fixes
  const allFixes = (analysis.rootCauseAnalyses || [])
    .flatMap((a) => a.suggestedFixes)
    .filter((f) => f.type === 'auto')
    .sort((a, b) => b.confidence - a.confidence);

  if (allFixes.length > 0) {
    console.log('🔧 Recommended Fixes');
    console.log('─'.repeat(50));
    for (const fix of allFixes.slice(0, 3)) {
      console.log(`  [${Math.round(fix.confidence * 100)}%] ${fix.description}`);
      if (fix.command) {
        console.log(`       Run: ${fix.command}`);
      }
    }
    console.log('');
  }

  console.log(`💾 Full results saved to: ${DEEP_ANALYSIS_FILE}\n`);
}

/**
 * Run browser compatibility check on source directory
 */
export function runBrowserCompatCheck(dir: string = 'src'): void {
  console.log('\n🌐 Browser Compatibility Check');
  console.log('═'.repeat(50));
  console.log(`Scanning ${dir}/ for browser-incompatible code...\n`);

  const analyzer = getBrowserCompatAnalyzer();
  const results = analyzer.analyzeDirectory(dir);

  if (results.length === 0) {
    console.log('✅ No browser compatibility issues found!\n');
    return;
  }

  const grouped = analyzer.groupBySeverity(results);

  console.log('📊 Issues by Severity');
  console.log('─'.repeat(50));
  console.log(`  Critical: ${grouped.critical.length}`);
  console.log(`  High: ${grouped.high.length}`);
  console.log(`  Medium: ${grouped.medium.length}`);
  console.log(`  Low: ${grouped.low.length}`);
  console.log('');

  // Show critical issues
  if (grouped.critical.length > 0) {
    console.log('⚠️  Critical Issues');
    console.log('─'.repeat(50));
    for (const issue of grouped.critical.slice(0, 5)) {
      const file = issue.file.split('/').pop();
      console.log(`  ${file}:${issue.line} - ${issue.api}`);
      console.log(`    Fix: ${issue.fix}`);
    }
    if (grouped.critical.length > 5) {
      console.log(`  ... and ${grouped.critical.length - 5} more`);
    }
    console.log('');
  }

  console.log(`💾 Run: npm run e2e:deep-analyze for full analysis\n`);
}

/**
 * Trace imports for a specific file
 */
export function runImportTrace(startFile: string): void {
  console.log('\n📦 Import Trace');
  console.log('═'.repeat(50));
  console.log(`Tracing imports from ${startFile}...\n`);

  const tracer = getImportTracer();
  const chain = tracer.trace(startFile);

  if (chain.error) {
    console.log(`❌ Error: ${chain.error}\n`);
    return;
  }

  if (chain.chain.length === 0) {
    console.log('No imports found.\n');
    return;
  }

  console.log('Import Chain:');
  console.log('─'.repeat(50));

  for (const node of chain.chain) {
    const indent = '  '.repeat(node.depth);
    const file = node.file.split('/').pop();
    const marker = node.hasTargetImport ? '⚠️ ' : '  ';
    console.log(`${indent}${marker}${file}`);

    if (node.problematicExports.length > 0) {
      console.log(`${indent}   └─ Problematic: ${node.problematicExports.join(', ')}`);
    }
  }

  console.log('');

  if (chain.found) {
    const problematic = chain.chain.find((n) => n.hasTargetImport);
    if (problematic) {
      console.log(`🎯 Root cause: ${problematic.file}`);
      console.log(`   Pattern: ${problematic.problematicExports[0]}`);
    }
  }

  console.log('');
}

/**
 * Get compact status for deep analysis
 */
export function getDeepAnalysisStatus(): string {
  if (!fs.existsSync(DEEP_ANALYSIS_FILE)) {
    return 'DEEP:NONE';
  }

  try {
    const analysis: DeepAnalysisResult = JSON.parse(
      fs.readFileSync(DEEP_ANALYSIS_FILE, 'utf-8')
    );

    const rc = analysis.rootCauseAnalyses?.length || 0;
    const bc = analysis.browserCompatSummary?.totalIssues || 0;
    const fixes = (analysis.rootCauseAnalyses || [])
      .flatMap((a) => a.suggestedFixes)
      .filter((f) => f.type === 'auto').length;

    return `DEEP:${rc}|BC:${bc}|FIX:${fixes}`;
  } catch {
    return 'DEEP:ERR';
  }
}

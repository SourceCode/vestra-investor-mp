#!/usr/bin/env npx tsx
/**
 * E2E Tools CLI
 *
 * Main entry point for the E2E test optimization tooling.
 * Provides commands for running, analyzing, and fixing E2E tests
 * with AI-optimized output for Claude agent consumption.
 */

import { runTests, printSummary, type RunOptions } from './commands/run.js';
import { runAnalysis, runEnhancedAnalysis, getCompactStatus } from './commands/analyze.js';
import {
  getBinaryStatus,
  getQuickStatus,
  getStatusWithAction,
  getFullStatus,
  getNextAction,
} from './commands/status.js';
import {
  runDeepAnalysis,
  runBrowserCompatCheck,
  runImportTrace,
  getDeepAnalysisStatus,
} from './commands/deep-analyze.js';
import {
  runFix,
  listTemplates,
  scanFixableFiles,
  restoreBackups,
  getFixStatus,
} from './commands/fix.js';
import { getLazyInitSummary } from './generators/lazy-init.js';
// Phase 5: AI Agent Commands
import { runAICommand, printAIDecision, getAIDecision } from './commands/ai.js';
import {
  quickCode,
  quickStatus,
  quickOneLiner,
  quickMetrics,
  quickFiles,
  quickCauses,
  quickCommands,
  quickCheck,
  formatQuickCheck,
} from './commands/quick.js';
import { runWatch } from './commands/watch.js';
import { resolveAlias, formatAliases, isAlias } from './aliases.js';
// Phase 6: Reporting & Dashboards
import {
  generateReport,
  generateJSONReport,
  generateHTMLDashboard,
  getCompactReport,
  getHealthSummary,
  getTrendSummary,
} from './commands/report.js';
// Phase 7: Token Optimization
import { compressReport, getCompactStatus as getSemanticStatus, formatCodesReference } from './compression/semantic-codes.js';
import { generateDiffReport, getCompactDiff, diffReporter } from './reporters/diff-reporter.js';
import { sessionManager, getCurrentSessionId, formatSessionAwareOutput } from './session/session-manager.js';
import { analyzeChanges, getCompactChangeSummary, shouldSkipTests } from './analyzers/change-detector.js';
import { generateActions, getActionDirective, getRecommendedCommand } from './actions/precomputed-actions.js';
import { buildImportGraph, getAffectedTests, importGraph } from './cache/import-graph.js';

const VERSION = '1.3.0';

const HELP = `
E2E Test Tools for AI Agents v${VERSION}
========================================

Commands:
  run [options]     Run tests and generate analysis
  analyze           Analyze last test run (Phase 2 pattern matching)
  deep-analyze      Deep analysis with import tracing (Phase 3)
  status            Show status summary
  fix [options]     Apply auto-generated fixes (Phase 4)
  ai [options]      Unified AI command (Phase 5)
  watch             Watch mode with live analysis (Phase 5)
  report [options]  Generate comprehensive reports (Phase 6)

Phase 3 Commands (Root Cause Analysis):
  deep-analyze      Full root cause analysis with import tracing
  compat-check      Check source for browser compatibility issues
  trace <file>      Trace imports from a specific file

Phase 5 Commands (AI Agent Optimized):
  ai                Unified command: run → analyze → summary
  ai --deep         With deep root cause analysis
  ai --skip-run     Skip test run, analyze cached results
  ai --format=json  Output as JSON
  ai --format=cli   Output as CLI format (default)
  ai --format=oneline  Minimal one-line output
  decide            Get AI decision (action + command)
  check             Quick check (code + metrics + action)
  aliases           Show all shorthand aliases

Phase 6 Commands (Reporting & Dashboards):
  report            Generate JSON and HTML reports
  report --json     JSON report only
  report --html     HTML dashboard only
  report --open     Open dashboard in browser
  report:json       Shorthand for report --json
  report:html       Shorthand for report --html
  dashboard         Open HTML dashboard in browser
  health            Show health score summary
  trends            Show trend summary

Phase 7 Commands (Token Optimization):
  compress          Ultra-compressed status (e.g., X:18/18|BC:18@LI|AF)
  diff              Show only changes since last run
  session           Show/manage session context
  session --new     Create new session
  session --clear   Clear current session
  changes           Analyze git changes for smart run
  changes --base=X  Use custom base ref (default: HEAD~1)
  smart-run         Run only affected tests based on git changes
  graph             Build/show import dependency graph
  action            Get pre-computed action directive
  codes             Show semantic codes reference

Quick Commands (Minimal Token Usage):
  code, 0           Binary status code (0=PASS, 1=FAIL, 2=FIXABLE, 3=BLOCKED)
  q, quick, 1       Quick status with semantic codes
  next, n           Pre-computed next action
  oneline           One-line summary
  metrics           Compact metrics (T:20|P:15|F:5|X:3|U:2)
  files             Focus files list
  causes            Root causes list
  commands          Next commands list

Run Options:
  --spec <path>     Run specific test file/pattern
  --project <name>  Run specific project
  --headed          Run in headed mode
  --workers <n>     Number of workers
  --retries <n>     Number of retries
  --timeout <ms>    Test timeout
  --grep <pattern>  Filter tests by name
  --quiet, -q       Suppress verbose output

Status Options:
  --code, -0        Binary status code only
  --quick, -q, -1   Quick semantic status
  --action, -a, -2  Status with recommended action
  --full, -f, -3    Full human-readable status
  --next, -n        Get pre-computed next action

Analyze Options:
  --compact, -c     Compact semantic output
  --json, -j        JSON output

Phase 4 Commands (Auto-Fix Generation):
  fix               Generate and preview fixes
  fix --apply       Apply all suggested fixes
  fix:templates     List available fix templates
  fix:scan          Scan for fixable files
  fix:lazy          Summary of files needing lazy init
  fix:restore       Restore files from backup

Fix Options:
  --apply           Apply all suggested fixes
  --file <path>     Fix specific file
  --template <id>   Use specific fix template
  --dry-run         Show fixes without applying (default)
  --pattern <pat>   Fix pattern (browser_compat, timeout, etc.)

Watch Options:
  --paths <p1,p2>   Paths to watch (default: src,tests/e2e)
  --debounce <ms>   Debounce delay (default: 1000)

Shorthand Aliases:
  r = run           a = analyze       f = fix
  d = deep-analyze  w = watch         g = go
  n = next          fa = fix --apply  da = deep-analyze

Examples:
  # AI-optimized workflow (recommended)
  npm run e2e:ai                        # Full pipeline with AI output
  npm run e2e:ai -- --format=json       # JSON output
  npm run e2e:ai -- --deep              # With root cause analysis

  # Quick status checks
  npm run e2e:code                      # Just the code (0/1/2/3)
  npm run e2e:decide                    # What to do next
  npm run e2e:check                     # All-in-one check

  # Traditional commands
  npm run e2e:run                       # Run tests
  npm run e2e:analyze                   # Analyze results
  npm run e2e:fix -- --apply            # Apply fixes

Environment:
  E2E_CACHE_DIR     Cache directory (default: .e2e-cache)
  E2E_VERBOSE       Enable verbose output

AI Agent Workflow:
  1. Run: npm run e2e:ai
  2. If PASS (0): Done
  3. If FIXABLE (2): Run npm run e2e:fix -- --apply, goto 1
  4. If FAIL (1): Run npm run e2e:ai -- --deep
  5. If BLOCKED (3): Check infrastructure
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let command = args[0];

  // Resolve alias to actual command
  if (command && isAlias(command)) {
    const resolved = resolveAlias(command);
    // Handle compound aliases like "fix --apply"
    if (resolved.includes(' ')) {
      const parts = resolved.split(' ');
      command = parts[0];
      args.splice(1, 0, ...parts.slice(1));
    } else {
      command = resolved;
    }
  }

  switch (command) {
    // ========================================
    // Standard Commands
    // ========================================

    case 'run': {
      const options = parseRunOptions(args.slice(1));
      const analysis = await runTests(options);
      if (options.verbose !== false) {
        printSummary(analysis);
      }
      break;
    }

    case 'analyze': {
      const compact = args.includes('--compact') || args.includes('-c');
      const json = args.includes('--json') || args.includes('-j');

      if (compact) {
        console.log(getCompactStatus());
      } else {
        const summary = runAnalysis();
        if (summary) {
          if (json) {
            console.log(JSON.stringify(summary, null, 2));
          } else {
            console.log('\n' + '='.repeat(60));
            console.log('E2E ANALYSIS (AI-Optimized Format)');
            console.log('='.repeat(60));
            console.log(JSON.stringify(summary, null, 2));
          }
        }
      }
      break;
    }

    case 'status': {
      const level = parseStatusLevel(args);
      if (args.includes('--next') || args.includes('-n')) {
        const action = getNextAction();
        console.log(action ? JSON.stringify(action) : 'null');
      } else if (level === 0) {
        console.log(getBinaryStatus());
      } else if (level === 1) {
        console.log(getQuickStatus());
      } else if (level === 2) {
        console.log(getStatusWithAction());
      } else {
        console.log(getFullStatus());
      }
      break;
    }

    // ========================================
    // Quick Commands (Phase 7 Optimizations)
    // ========================================

    case 'code': {
      console.log(getBinaryStatus());
      break;
    }

    case 'q':
    case 'quick': {
      const withAction = args.includes('--action') || args.includes('-a');
      console.log(withAction ? getStatusWithAction() : getQuickStatus());
      break;
    }

    case 'next':
    case 'next-action': {
      const action = getNextAction();
      if (action) {
        console.log(JSON.stringify(action));
      } else {
        console.log('null');
      }
      break;
    }

    case 'diff':
    case 'diff-report': {
      // Placeholder for Phase 7 differential reporting
      console.log('Differential reporting will be implemented in Phase 7');
      console.log('For now, use: npm run e2e:analyze --compact');
      break;
    }

    // ========================================
    // Phase 3 Commands (Root Cause Analysis)
    // ========================================

    case 'deep-analyze':
    case 'deep': {
      runDeepAnalysis();
      break;
    }

    case 'compat-check':
    case 'compat': {
      const dir = getArgValue(args, '--dir') || 'src';
      runBrowserCompatCheck(dir);
      break;
    }

    case 'trace': {
      const file = args[1];
      if (!file) {
        console.error('Error: Please specify a file to trace');
        console.log('Usage: npm run e2e:trace -- <file>');
        process.exit(1);
      }
      runImportTrace(file);
      break;
    }

    case 'deep-status': {
      console.log(getDeepAnalysisStatus());
      break;
    }

    // ========================================
    // Fix Commands (Phase 4)
    // ========================================

    case 'fix': {
      const dryRun = !args.includes('--apply');
      const apply = args.includes('--apply');
      const file = getArgValue(args, '--file');
      const template = getArgValue(args, '--template');
      const pattern = getArgValue(args, '--pattern');

      await runFix({
        dryRun,
        apply,
        file,
        template,
        pattern,
      });
      break;
    }

    case 'fix:templates': {
      listTemplates();
      break;
    }

    case 'fix:scan': {
      const dir = getArgValue(args, '--dir') || 'src';
      scanFixableFiles(dir);
      break;
    }

    case 'fix:lazy': {
      const summary = getLazyInitSummary('src');
      console.log('\nLazy Initialization Analysis\n');
      console.log(`Files needing fix: ${summary.totalFiles}`);
      console.log(`Total singletons: ${summary.totalSingletons}\n`);

      if (summary.files.length > 0) {
        console.log('Files with singleton patterns:');
        for (const file of summary.files.slice(0, 10)) {
          console.log(`  ${file.file}: ${file.count} singleton(s)`);
        }
        if (summary.files.length > 10) {
          console.log(`  ... and ${summary.files.length - 10} more`);
        }
        console.log('\nTo fix these files, run:');
        console.log('  npm run e2e:fix -- --template=lazy-initialization --apply');
      }
      break;
    }

    case 'fix:restore': {
      const file = getArgValue(args, '--file');
      restoreBackups(file);
      break;
    }

    case 'fix:status': {
      console.log(getFixStatus());
      break;
    }

    // ========================================
    // Phase 5: AI Agent Commands
    // ========================================

    case 'ai': {
      const format = getArgValue(args, '--format') as 'cli' | 'json' | 'oneline' || 'cli';
      const deep = args.includes('--deep');
      const skipRun = args.includes('--skip-run');
      const filter = getArgValue(args, '--filter');

      await runAICommand(
        { format, deep, skipRun, filter },
        parseRunOptions(args.slice(1))
      );
      break;
    }

    case 'decide': {
      printAIDecision();
      break;
    }

    case 'check': {
      const result = quickCheck();
      console.log(formatQuickCheck(result));
      break;
    }

    case 'oneline': {
      console.log(quickOneLiner());
      break;
    }

    case 'metrics': {
      console.log(quickMetrics());
      break;
    }

    case 'files': {
      console.log(quickFiles());
      break;
    }

    case 'causes': {
      console.log(quickCauses());
      break;
    }

    case 'commands': {
      console.log(quickCommands());
      break;
    }

    case 'aliases': {
      console.log(formatAliases());
      break;
    }

    // ========================================
    // Watch Mode (Phase 5)
    // ========================================

    case 'watch':
    case 'w': {
      const pathsArg = getArgValue(args, '--paths');
      const paths = pathsArg ? pathsArg.split(',') : undefined;
      const debounceArg = getArgValue(args, '--debounce');
      const debounce = debounceArg ? parseInt(debounceArg, 10) : undefined;

      await runWatch({ paths, debounce });
      break;
    }

    // ========================================
    // Phase 6: Reporting & Dashboards
    // ========================================

    case 'report': {
      const jsonOnly = args.includes('--json');
      const htmlOnly = args.includes('--html');
      const openBrowser = args.includes('--open');
      const noSave = args.includes('--no-save');

      let format: 'json' | 'html' | 'both' = 'both';
      if (jsonOnly) format = 'json';
      if (htmlOnly) format = 'html';

      await generateReport({
        format,
        open: openBrowser,
        save: !noSave,
      });
      break;
    }

    case 'report:json': {
      const report = generateJSONReport();
      console.log(JSON.stringify(report, null, 2));
      break;
    }

    case 'report:html': {
      const htmlPath = generateHTMLDashboard();
      console.log(`Dashboard saved to: ${htmlPath}`);
      break;
    }

    case 'dashboard': {
      await generateReport({
        format: 'html',
        open: true,
        save: true,
      });
      break;
    }

    case 'health': {
      const health = getHealthSummary();
      console.log(`Grade: ${health.grade} (${health.score}/100)`);
      if (health.factors.length > 0) {
        console.log('Factors:');
        health.factors.forEach((f) => console.log(`  • ${f}`));
      }
      break;
    }

    case 'trends': {
      const trends = getTrendSummary();
      console.log(`Direction: ${trends.direction}`);
      console.log(`Pass Rate Change: ${trends.passRateChange > 0 ? '+' : ''}${trends.passRateChange.toFixed(1)}%`);
      console.log(`Historical Runs: ${trends.lastRuns}`);
      break;
    }

    case 'compact-report': {
      console.log(getCompactReport());
      break;
    }

    // ========================================
    // Phase 7: Token Optimization Commands
    // ========================================

    case 'compress':
    case 'compressed': {
      // Ultra-compressed status output
      const enhancedResult = runEnhancedAnalysis();
      if (enhancedResult) {
        const compressed = compressReport(
          enhancedResult.summary || null,
          enhancedResult
        );
        console.log(compressed.raw);
      } else {
        console.log('B:0/0|CI');
      }
      break;
    }

    case 'diff':
    case 'diff-report': {
      // Show only changes since last run
      const format = getArgValue(args, '--format') || 'compact';
      const enhancedResult = runEnhancedAnalysis();
      const diffReport = generateDiffReport(
        enhancedResult?.summary || null,
        enhancedResult || null,
        []
      );

      if (format === 'json') {
        console.log(diffReporter.formatJSON(diffReport));
      } else {
        console.log(diffReporter.formatCompact(diffReport));
      }
      break;
    }

    case 'session': {
      // Session management
      const createNew = args.includes('--new');
      const clear = args.includes('--clear');
      const sessionId = getArgValue(args, '--id');

      if (createNew) {
        const newId = sessionManager.createSession();
        console.log(`Created session: ${newId}`);
      } else if (clear) {
        const currentId = sessionId || getCurrentSessionId();
        sessionManager.clearSession(currentId);
        console.log(`Cleared session: ${currentId}`);
      } else {
        const currentId = getCurrentSessionId();
        const summary = sessionManager.getSessionSummary(currentId);
        console.log(summary || `Session: ${currentId}`);
      }
      break;
    }

    case 'changes': {
      // Analyze git changes
      const baseRef = getArgValue(args, '--base') || 'HEAD~1';
      const json = args.includes('--json');
      const analysis = analyzeChanges(baseRef);

      if (json) {
        console.log(JSON.stringify(analysis, null, 2));
      } else if (analysis.skipReason) {
        console.log(`SKIP: ${analysis.skipReason}`);
      } else {
        console.log(`Changes: ${analysis.summary.totalChanges}`);
        console.log(`  Source: ${analysis.summary.sourceChanges}`);
        console.log(`  Tests: ${analysis.summary.testChanges}`);
        console.log(`  Config: ${analysis.summary.configChanges}`);
        console.log(`Affected tests: ${analysis.affectedTests.length}`);
        if (analysis.affectedTests.length > 0 && analysis.affectedTests.length <= 5) {
          analysis.affectedTests.forEach((t) => console.log(`  • ${t}`));
        }
      }
      break;
    }

    case 'smart':
    case 'smart-run': {
      // Run only affected tests based on git changes
      const baseRef = getArgValue(args, '--base') || 'HEAD~1';
      const analysis = analyzeChanges(baseRef);

      if (analysis.skipReason) {
        console.log(`Skipping tests: ${analysis.skipReason}`);
        break;
      }

      if (analysis.affectedTests.length === 0) {
        console.log('No affected tests found. Skipping test run.');
        break;
      }

      console.log(`Running ${analysis.affectedTests.length} affected tests...`);
      const runOptions = parseRunOptions(args.slice(1));
      // Run only affected tests
      if (analysis.affectedTests.length <= 10) {
        runOptions.spec = analysis.affectedTests.join(' ');
      }
      const result = await runTests(runOptions);
      printSummary(result);
      break;
    }

    case 'graph': {
      // Build/show import dependency graph
      const rebuild = args.includes('--rebuild');
      const file = getArgValue(args, '--file');

      console.log('Building import graph...');
      const cache = await buildImportGraph(rebuild);
      console.log(`Files: ${cache.stats.totalFiles}`);
      console.log(`Edges: ${cache.stats.totalEdges}`);
      console.log(`Build time: ${cache.stats.buildTime}ms`);

      if (file) {
        const affected = await getAffectedTests([file]);
        console.log(`\nAffected tests for ${file}:`);
        affected.forEach((t) => console.log(`  • ${t}`));
      }
      break;
    }

    case 'action': {
      // Get pre-computed action directive
      const json = args.includes('--json');
      const enhancedResult = runEnhancedAnalysis();
      const actions = generateActions(
        enhancedResult?.summary || null,
        enhancedResult || null,
        []
      );

      if (json) {
        console.log(JSON.stringify({
          status: actions.status,
          action: actions.primary.code,
          command: actions.primary.command,
          sequence: actions.sequence?.map((s) => s.code),
        }, null, 2));
      } else {
        console.log(`Status: ${actions.status}`);
        console.log(`Action: ${actions.primary.name} (${actions.primary.code})`);
        console.log(`Command: ${actions.primary.command}`);
        if (actions.sequence) {
          console.log('Sequence:');
          actions.sequence.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.name}: ${s.command}`);
          });
        }
      }
      break;
    }

    case 'codes': {
      // Show semantic codes reference
      console.log(formatCodesReference());
      break;
    }

    case 'go': {
      // Full optimized pipeline
      console.log('Running optimized pipeline: run → analyze → code');
      const options = parseRunOptions(args.slice(1));
      options.verbose = false;
      await runTests(options);
      runAnalysis();
      console.log(getBinaryStatus());
      break;
    }

    // ========================================
    // Help
    // ========================================

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP);
      break;

    case 'version':
    case '--version':
    case '-v':
      console.log(VERSION);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run with --help for usage information');
      process.exit(1);
  }
}

/**
 * Parse run command options
 */
function parseRunOptions(args: string[]): RunOptions {
  const options: RunOptions = { verbose: true };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--spec':
        options.spec = args[++i];
        break;
      case '--project':
        options.project = args[++i];
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--workers':
        options.workers = parseInt(args[++i], 10);
        break;
      case '--retries':
        options.retries = parseInt(args[++i], 10);
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i], 10);
        break;
      case '--grep':
        options.grep = args[++i];
        break;
      case '--quiet':
      case '-q':
        options.verbose = false;
        break;
    }
  }

  return options;
}

/**
 * Parse status command level
 */
function parseStatusLevel(args: string[]): number {
  if (args.includes('--code') || args.includes('-0')) return 0;
  if (args.includes('--quick') || args.includes('-q') || args.includes('-1')) return 1;
  if (args.includes('--action') || args.includes('-a') || args.includes('-2')) return 2;
  if (args.includes('--full') || args.includes('-f') || args.includes('-3')) return 3;
  return 3; // Default to full
}

/**
 * Get value for a command-line argument
 */
function getArgValue(args: string[], flag: string): string | undefined {
  // Handle --flag=value format
  for (const arg of args) {
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }

  // Handle --flag value format
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return undefined;
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

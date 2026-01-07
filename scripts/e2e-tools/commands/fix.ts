/**
 * Fix Command for E2E Tools
 *
 * CLI command to generate and apply fixes based on analysis results.
 * Part of Phase 4: Auto-Fix Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  DeepAnalysisResult,
  GeneratedFix,
  FixCommandOptions,
  FixGenerationStats,
  FixReport,
} from '../types/index.js';
import { getFixGenerator } from '../generators/fix-generator.js';
import { getFixApplier } from '../generators/fix-applier.js';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Run the fix command
 */
export async function runFix(options: FixCommandOptions = {}): Promise<void> {
  const { dryRun = true, pattern, file, apply, template } = options;

  console.log('\n' + '='.repeat(50));
  console.log('Fix Generator');
  console.log('='.repeat(50) + '\n');

  const fixGenerator = getFixGenerator();
  const fixApplier = getFixApplier();

  // If template specified, scan for files matching that template (no analysis required)
  if (template) {
    const matchingFiles = fixGenerator.scanForFixableFiles('src');
    const filteredFiles = matchingFiles.filter(f => f.templates.includes(template));

    if (filteredFiles.length === 0) {
      console.log(`No files found matching template: ${template}`);
      console.log('\nAvailable templates:');
      for (const t of fixGenerator.getAllTemplates()) {
        console.log(`  - ${t.id}: ${t.name}`);
      }
      return;
    }

    console.log(`Found ${filteredFiles.length} files matching template "${template}":\n`);

    const allFixes: GeneratedFix[] = [];

    for (const { file: filePath } of filteredFiles) {
      const fix = fixGenerator.generateFixByTemplate(filePath, template);
      if (fix) {
        allFixes.push(fix);
        const shortFile = filePath.split('/').slice(-3).join('/');
        console.log(`  ${shortFile}: ${fix.changes.length} changes`);
      }
    }

    if (allFixes.length > 0) {
      await applyFixesWithOutput(allFixes, fixApplier, { dryRun, apply });
    }

    return;
  }

  // Load analysis results for analysis-based fixes
  const deepAnalysisPath = path.join(process.cwd(), CACHE_DIR, 'deep-analysis.json');
  const lastRunPath = path.join(process.cwd(), CACHE_DIR, 'last-run.json');

  let analysisData: DeepAnalysisResult | null = null;

  if (fs.existsSync(deepAnalysisPath)) {
    analysisData = JSON.parse(fs.readFileSync(deepAnalysisPath, 'utf-8'));
  } else if (fs.existsSync(lastRunPath)) {
    analysisData = JSON.parse(fs.readFileSync(lastRunPath, 'utf-8'));
  } else {
    console.error('No analysis found. Run analysis first:');
    console.error('  npm run e2e:deep-analyze');
    console.error('\nAlternatively, use --template to fix by pattern:');
    console.error('  npm run e2e:fix -- --template=lazy-initialization');
    process.exit(1);
  }

  // Generate fixes from analysis
  const allFixes: GeneratedFix[] = [];
  const rootCauseAnalyses = analysisData?.rootCauseAnalyses || [];

  // Filter analyses based on options
  let filteredAnalyses = rootCauseAnalyses;

  if (pattern) {
    filteredAnalyses = rootCauseAnalyses.filter(
      a =>
        a.patternMatch.category === pattern ||
        a.patternMatch.bestMatch?.patternId === pattern
    );
  }

  if (file) {
    filteredAnalyses = rootCauseAnalyses.filter(
      a =>
        a.error.file?.includes(file) ||
        a.importChain?.chain.some(n => n.file.includes(file))
    );
  }

  console.log(`Analyzing ${filteredAnalyses.length} root cause analyses...\n`);

  for (const analysis of filteredAnalyses) {
    const fixes = fixGenerator.generateFixes(analysis);
    allFixes.push(...fixes);
  }

  // Also generate fixes from browser compat issues
  if (analysisData?.browserCompatSummary) {
    const affectedFiles = analysisData.browserCompatSummary.affectedFiles;

    for (const filePath of affectedFiles) {
      if (fixGenerator.hasAvailableFixes(filePath)) {
        // Try each potentially applicable template
        for (const templateDef of fixGenerator.getAllTemplates()) {
          const fix = fixGenerator.generateFixByTemplate(filePath, templateDef.id);
          if (fix && !allFixes.some(f => f.file === fix.file && f.templateId === fix.templateId)) {
            allFixes.push(fix);
          }
        }
      }
    }
  }

  if (allFixes.length === 0) {
    console.log('No fixes generated. Possible reasons:');
    console.log('  - No auto-fixable issues found');
    console.log('  - Filters excluded all issues');
    console.log('  - Pattern templates not matched');
    console.log('\nTry scanning for fixable files:');
    console.log('  npm run e2e:fix -- --template=lazy-initialization\n');

    // Show available templates
    console.log('Available fix templates:');
    for (const t of fixGenerator.getAllTemplates()) {
      console.log(`  - ${t.id}: ${t.name}`);
    }
    return;
  }

  await applyFixesWithOutput(allFixes, fixApplier, { dryRun, apply });
}

/**
 * Apply fixes with formatted output
 */
async function applyFixesWithOutput(
  fixes: GeneratedFix[],
  applier: ReturnType<typeof getFixApplier>,
  options: { dryRun: boolean; apply?: boolean }
): Promise<void> {
  const { dryRun, apply } = options;

  console.log(`\nGenerated ${fixes.length} fixes:\n`);

  // Group by file
  const byFile = new Map<string, GeneratedFix[]>();
  for (const fix of fixes) {
    if (!byFile.has(fix.file)) {
      byFile.set(fix.file, []);
    }
    byFile.get(fix.file)!.push(fix);
  }

  // Display fixes
  for (const [filePath, fileFixes] of byFile) {
    const shortFile = filePath.split('/').slice(-3).join('/');
    console.log(`${shortFile}`);
    for (const fix of fileFixes) {
      console.log(`  [${fix.templateId}] ${fix.changes.length} changes`);
      if (fix.manualSteps.length > 0) {
        console.log(`     Manual steps: ${fix.manualSteps.length}`);
      }
    }
  }

  // Generate stats
  const stats: FixGenerationStats = {
    totalAnalyzed: fixes.length,
    fixesGenerated: fixes.length,
    filesAffected: byFile.size,
    byTemplate: {},
    manualStepsRequired: fixes.reduce((sum, f) => sum + f.manualSteps.length, 0),
  };

  for (const fix of fixes) {
    stats.byTemplate[fix.templateId] = (stats.byTemplate[fix.templateId] || 0) + 1;
  }

  console.log('\n' + '-'.repeat(50));
  console.log('Statistics:');
  console.log(`  Fixes generated: ${stats.fixesGenerated}`);
  console.log(`  Files affected: ${stats.filesAffected}`);
  console.log(`  Manual steps needed: ${stats.manualStepsRequired}`);
  console.log('  By template:');
  for (const [templateId, count] of Object.entries(stats.byTemplate)) {
    console.log(`    - ${templateId}: ${count}`);
  }

  // Save generated fixes
  const fixesPath = path.join(process.cwd(), CACHE_DIR, 'suggested-fixes.json');
  const report: FixReport = {
    timestamp: new Date().toISOString(),
    stats,
    fixes,
    manualSteps: [...new Set(fixes.flatMap(f => f.manualSteps))],
    nextActions: generateNextActions(fixes, apply),
  };

  fs.writeFileSync(fixesPath, JSON.stringify(report, null, 2));
  console.log(`\nFixes saved to: ${fixesPath}\n`);

  // Apply if requested
  if (apply && !dryRun) {
    console.log('='.repeat(50));
    console.log('Applying fixes...\n');

    const results = applier.applyAll(fixes, { dryRun: false, backup: true });

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Applied: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    for (const result of failed) {
      const shortFile = result.file.split('/').slice(-2).join('/');
      console.log(`  ${shortFile}: ${result.error}`);
    }

    if (successful.length > 0) {
      console.log('\nPost-fix checklist:');
      console.log('  1. Run: npm run typecheck');
      console.log('  2. Run: npm run lint');
      console.log('  3. Run: npm run e2e:run');

      // Collect manual steps
      const manualSteps = fixes.flatMap(f => f.manualSteps);
      if (manualSteps.length > 0) {
        console.log('\nManual steps required:');
        for (const step of [...new Set(manualSteps)]) {
          console.log(`  - ${step}`);
        }
      }
    }
  } else {
    console.log('-'.repeat(50));
    console.log('DRY RUN - No changes applied');
    console.log('To apply fixes, run:');
    console.log('  npm run e2e:fix -- --apply\n');

    // Show preview of first fix
    if (fixes.length > 0) {
      console.log('Preview of first fix:\n');
      const preview = applier.generateDiff(fixes[0]);
      console.log(preview);
      console.log('');
    }
  }
}

/**
 * Generate next actions based on fixes
 */
function generateNextActions(fixes: GeneratedFix[], applied?: boolean): string[] {
  const actions: string[] = [];

  if (!applied) {
    actions.push('Review suggested fixes in .e2e-cache/suggested-fixes.json');
    actions.push('Apply fixes with: npm run e2e:fix -- --apply');
  } else {
    actions.push('Run typecheck: npm run typecheck');
    actions.push('Run lint: npm run lint');
    actions.push('Re-run tests: npm run e2e:run');
  }

  const manualSteps = fixes.flatMap(f => f.manualSteps);
  if (manualSteps.length > 0) {
    actions.push(`Complete ${manualSteps.length} manual steps`);
  }

  return actions;
}

/**
 * List available fix templates
 */
export function listTemplates(): void {
  const generator = getFixGenerator();
  const templates = generator.getAllTemplates();

  console.log('\nAvailable Fix Templates:\n');

  for (const template of templates) {
    console.log(`  ${template.id}`);
    console.log(`    Name: ${template.name}`);
    console.log(`    Description: ${template.description}`);
    if (template.manualSteps && template.manualSteps.length > 0) {
      console.log(`    Manual steps: ${template.manualSteps.length}`);
    }
    console.log('');
  }
}

/**
 * Scan for fixable files
 */
export function scanFixableFiles(dir: string = 'src'): void {
  const generator = getFixGenerator();
  const files = generator.scanForFixableFiles(dir);

  console.log(`\nScanning ${dir}/ for fixable patterns...\n`);

  if (files.length === 0) {
    console.log('No files with auto-fixable patterns found.');
    return;
  }

  console.log(`Found ${files.length} files with potential fixes:\n`);

  // Group by template
  const byTemplate = new Map<string, string[]>();
  for (const { file, templates } of files) {
    for (const templateId of templates) {
      if (!byTemplate.has(templateId)) {
        byTemplate.set(templateId, []);
      }
      byTemplate.get(templateId)!.push(file);
    }
  }

  for (const [templateId, fileList] of byTemplate) {
    console.log(`${templateId}: ${fileList.length} files`);
    for (const f of fileList.slice(0, 5)) {
      const shortFile = f.split('/').slice(-3).join('/');
      console.log(`  - ${shortFile}`);
    }
    if (fileList.length > 5) {
      console.log(`  ... and ${fileList.length - 5} more`);
    }
    console.log('');
  }
}

/**
 * Restore files from backup
 */
export function restoreBackups(file?: string): void {
  const applier = getFixApplier();
  const backups = applier.listBackups();

  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }

  console.log('\nAvailable backups:\n');

  for (const backup of backups.slice(0, 5)) {
    console.log(`  ${backup.timestamp}: ${backup.files.length} files`);
  }

  if (file) {
    console.log(`\nRestoring latest backup for: ${file}`);
    const restored = applier.restoreLatest(file);
    if (restored) {
      console.log('File restored successfully.');
    } else {
      console.log('No backup found for this file.');
    }
  } else {
    console.log('\nTo restore a file, run:');
    console.log('  npm run e2e:fix -- --restore <file>\n');
  }
}

/**
 * Get compact fix status
 */
export function getFixStatus(): string {
  const fixesPath = path.join(process.cwd(), CACHE_DIR, 'suggested-fixes.json');

  if (!fs.existsSync(fixesPath)) {
    return 'FIX:NONE';
  }

  try {
    const report: FixReport = JSON.parse(fs.readFileSync(fixesPath, 'utf-8'));
    const { stats } = report;

    return `FIX:${stats.fixesGenerated}|FILES:${stats.filesAffected}|MANUAL:${stats.manualStepsRequired}`;
  } catch {
    return 'FIX:ERR';
  }
}

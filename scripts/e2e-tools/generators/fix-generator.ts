/**
 * Fix Generator for E2E Tests
 *
 * Generates code fixes based on templates and root cause analysis.
 * Part of Phase 4: Auto-Fix Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type {
  RootCauseAnalysis,
  GeneratedFix,
  FixTemplate,
  CodeChange,
  PatternMatchResult,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateDatabase {
  version: string;
  templates: FixTemplate[];
}

/**
 * Fix Generator Class
 *
 * Generates code fixes based on pattern templates and analysis results.
 */
export class FixGenerator {
  private templates: FixTemplate[];
  private templateMap: Map<string, FixTemplate>;

  constructor() {
    const templatesPath = path.join(__dirname, '../patterns/fix-templates.json');

    if (!fs.existsSync(templatesPath)) {
      console.warn('Fix templates not found at:', templatesPath);
      this.templates = [];
      this.templateMap = new Map();
      return;
    }

    const data = fs.readFileSync(templatesPath, 'utf-8');
    const db: TemplateDatabase = JSON.parse(data);
    this.templates = db.templates;
    this.templateMap = new Map(this.templates.map(t => [t.id, t]));
  }

  /**
   * Generate fixes for a root cause analysis
   */
  generateFixes(analysis: RootCauseAnalysis): GeneratedFix[] {
    const fixes: GeneratedFix[] = [];

    // Get template from pattern match
    const templateId = analysis.patternMatch.bestMatch?.fixTemplate;
    if (!templateId) {
      return fixes;
    }

    const template = this.templateMap.get(templateId);
    if (!template) {
      return fixes;
    }

    // Get files to fix
    const filesToFix = this.getFilesToFix(analysis);

    for (const file of filesToFix) {
      const fix = this.generateFixForFile(file, template, analysis);
      if (fix) {
        fixes.push(fix);
      }
    }

    return fixes;
  }

  /**
   * Generate fixes from browser compatibility issues
   */
  generateFixesFromBrowserCompat(
    file: string,
    issues: Array<{ api: string; line: number; fix: string }>
  ): GeneratedFix[] {
    const fixes: GeneratedFix[] = [];

    // Try to find matching template for each issue type
    for (const issue of issues) {
      const templateId = this.getTemplateForIssue(issue.api);
      if (templateId) {
        const template = this.templateMap.get(templateId);
        if (template) {
          const fix = this.generateFixForFile(file, template);
          if (fix) {
            fixes.push(fix);
          }
        }
      }
    }

    return fixes;
  }

  /**
   * Generate fix for a specific file using a template
   */
  generateFixForFile(
    filePath: string,
    template: FixTemplate,
    analysis?: RootCauseAnalysis
  ): GeneratedFix | null {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let modifiedContent = originalContent;
    const changes: CodeChange[] = [];

    // Apply each pattern in the template
    for (const pattern of template.patterns) {
      const regex = new RegExp(pattern.match, 'g');
      let match: RegExpExecArray | null;

      // Reset regex lastIndex for each pattern
      regex.lastIndex = 0;

      while ((match = regex.exec(originalContent)) !== null) {
        const replacement = this.expandReplacement(pattern.replace, match);

        // Calculate line number
        const beforeMatch = originalContent.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
        const matchLineCount = (match[0].match(/\n/g) || []).length;

        changes.push({
          type: 'replace',
          lineStart: lineNumber,
          lineEnd: lineNumber + matchLineCount,
          original: match[0],
          replacement,
          description: template.description,
        });

        modifiedContent = modifiedContent.replace(match[0], replacement);
      }
    }

    if (changes.length === 0) {
      return null;
    }

    // Generate import updates if needed
    const importChanges = this.generateImportUpdates(
      originalContent,
      modifiedContent,
      template
    );
    changes.push(...importChanges);

    // Apply import updates to modified content
    for (const importChange of importChanges) {
      modifiedContent = modifiedContent.replace(
        importChange.original,
        importChange.replacement
      );
    }

    return {
      file: filePath,
      templateId: template.id,
      templateName: template.name,
      changes,
      originalContent,
      modifiedContent,
      manualSteps: template.manualSteps || [],
      validation: template.validation,
    };
  }

  /**
   * Expand replacement string with captured groups
   */
  private expandReplacement(replacement: string, match: RegExpExecArray): string {
    let result = replacement;

    // Replace $1, $2, etc. with captured groups
    for (let i = 1; i < match.length; i++) {
      const capturedValue = match[i] || '';
      result = result.replace(new RegExp(`\\$${i}`, 'g'), capturedValue);
    }

    return result;
  }

  /**
   * Generate import statement updates
   */
  private generateImportUpdates(
    original: string,
    modified: string,
    template: FixTemplate
  ): CodeChange[] {
    const changes: CodeChange[] = [];

    if (!template.importUpdates) {
      return changes;
    }

    for (const update of template.importUpdates) {
      const regex = new RegExp(update.match, 'g');
      let match: RegExpExecArray | null;

      regex.lastIndex = 0;

      while ((match = regex.exec(original)) !== null) {
        const replacement = this.expandReplacement(update.replace, match);
        const beforeMatch = original.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

        changes.push({
          type: 'replace',
          lineStart: lineNumber,
          lineEnd: lineNumber,
          original: match[0],
          replacement,
          description: 'Update import statement',
        });
      }
    }

    return changes;
  }

  /**
   * Get files that need fixes from analysis
   */
  private getFilesToFix(analysis: RootCauseAnalysis): string[] {
    const files = new Set<string>();

    // Add file from error
    if (analysis.error.file) {
      const resolved = this.resolveFilePath(analysis.error.file);
      if (resolved) {
        files.add(resolved);
      }
    }

    // Add files from import chain with problematic exports
    if (analysis.importChain) {
      for (const node of analysis.importChain.chain) {
        if (node.problematicExports.length > 0) {
          files.add(node.file);
        }
      }
    }

    // Add files from browser compat issues
    for (const compat of analysis.browserCompatIssues) {
      files.add(compat.file);
    }

    return [...files].filter(f => fs.existsSync(f));
  }

  /**
   * Resolve file path (handle URL paths from browser)
   */
  private resolveFilePath(file: string): string | null {
    // Handle browser URLs
    if (file.startsWith('http://') || file.startsWith('https://')) {
      const match = file.match(/\/src\/(.+)$/);
      if (match) {
        return path.join(process.cwd(), 'src', match[1]);
      }
      return null;
    }

    // Handle relative paths
    if (!file.startsWith('/')) {
      return path.join(process.cwd(), file);
    }

    return file;
  }

  /**
   * Get template ID for a browser compatibility issue
   */
  private getTemplateForIssue(api: string): string | null {
    const apiToTemplate: Record<string, string> = {
      'TypeORM DataSource': 'dbclient-migration',
      'Direct DataSource Import': 'dbclient-migration',
      'AppDataSource': 'dbclient-migration',
      'Node.js createRequire': 'dynamic-import',
      'require()': 'dynamic-import',
      'fs module': 'fs-to-fetch',
      'path module': 'browser-env-check',
    };

    return apiToTemplate[api] || null;
  }

  /**
   * Generate fix by template ID for a file
   */
  generateFixByTemplate(filePath: string, templateId: string): GeneratedFix | null {
    const template = this.templateMap.get(templateId);
    if (!template) {
      return null;
    }

    return this.generateFixForFile(filePath, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): FixTemplate | undefined {
    return this.templateMap.get(id);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): FixTemplate[] {
    return [...this.templates];
  }

  /**
   * Check if a file has potential fixes
   */
  hasAvailableFixes(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    for (const template of this.templates) {
      for (const pattern of template.patterns) {
        const regex = new RegExp(pattern.match);
        if (regex.test(content)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Scan directory for files needing fixes
   */
  scanForFixableFiles(dir: string = 'src'): Array<{ file: string; templates: string[] }> {
    const results: Array<{ file: string; templates: string[] }> = [];
    const baseDir = path.join(process.cwd(), dir);

    const walk = (currentDir: string): void => {
      try {
        const entries = fs.readdirSync(currentDir);

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (!entry.startsWith('.') && entry !== 'node_modules') {
              walk(fullPath);
            }
          } else if (stat.isFile() && /\.(ts|tsx)$/.test(entry)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matchingTemplates: string[] = [];

            for (const template of this.templates) {
              for (const pattern of template.patterns) {
                const regex = new RegExp(pattern.match);
                if (regex.test(content)) {
                  matchingTemplates.push(template.id);
                  break;
                }
              }
            }

            if (matchingTemplates.length > 0) {
              results.push({ file: fullPath, templates: matchingTemplates });
            }
          }
        }
      } catch {
        // Ignore errors (permission issues, etc.)
      }
    };

    walk(baseDir);
    return results;
  }
}

// Lazy singleton instance
let _fixGenerator: FixGenerator | null = null;

/**
 * Get the singleton FixGenerator instance
 */
export function getFixGenerator(): FixGenerator {
  if (!_fixGenerator) {
    _fixGenerator = new FixGenerator();
  }
  return _fixGenerator;
}

/**
 * Generate fixes for an analysis (convenience function)
 */
export function generateFixes(analysis: RootCauseAnalysis): GeneratedFix[] {
  return getFixGenerator().generateFixes(analysis);
}

/**
 * Generate fix by template (convenience function)
 */
export function generateFixByTemplate(
  filePath: string,
  templateId: string
): GeneratedFix | null {
  return getFixGenerator().generateFixByTemplate(filePath, templateId);
}

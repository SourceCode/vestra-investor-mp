/**
 * Shorthand Aliases for E2E Tools
 *
 * Provides single-character and short command aliases
 * for maximum efficiency in AI agent workflows.
 *
 * Part of Phase 5: AI Agent Commands
 */

import type { CommandAlias } from './types/index.js';

/**
 * Command alias definitions
 *
 * These aliases are designed for minimal typing and token usage:
 * - Single characters for most common operations
 * - Two characters for secondary operations
 * - Descriptive names available for clarity when needed
 */
export const ALIASES: Record<string, CommandAlias> = {
  // Primary aliases (single character)
  '0': {
    command: 'code',
    description: 'Binary status code (0=pass, 1=fail, 2=fixable, 3=blocked)',
  },
  '1': {
    command: 'quick',
    description: 'Quick semantic status',
  },
  '2': {
    command: 'status --action',
    description: 'Status with recommended action',
  },
  '3': {
    command: 'status --full',
    description: 'Full human-readable status',
  },
  r: {
    command: 'run',
    description: 'Run tests',
  },
  a: {
    command: 'analyze',
    description: 'Analyze results',
  },
  f: {
    command: 'fix',
    description: 'Generate fixes',
  },
  w: {
    command: 'watch',
    description: 'Start watch mode',
  },
  d: {
    command: 'deep-analyze',
    description: 'Deep root cause analysis',
  },
  n: {
    command: 'next',
    description: 'Get next action',
  },
  g: {
    command: 'go',
    description: 'Full pipeline (run → analyze → code)',
  },

  // Secondary aliases (two characters)
  ai: {
    command: 'ai',
    description: 'Unified AI command',
  },
  fa: {
    command: 'fix --apply',
    description: 'Apply fixes',
  },
  fp: {
    command: 'fix --dry-run',
    description: 'Preview fixes',
  },
  ft: {
    command: 'fix:templates',
    description: 'List fix templates',
  },
  fs: {
    command: 'fix:scan',
    description: 'Scan for fixable files',
  },
  fl: {
    command: 'fix:lazy',
    description: 'Lazy init summary',
  },
  da: {
    command: 'deep-analyze',
    description: 'Deep analysis',
  },
  bc: {
    command: 'compat-check',
    description: 'Browser compatibility check',
  },
  tr: {
    command: 'trace',
    description: 'Import trace',
  },

  // Word aliases (for clarity)
  run: {
    command: 'run',
    description: 'Run tests',
  },
  test: {
    command: 'run',
    description: 'Run tests (alias)',
  },
  analyze: {
    command: 'analyze',
    description: 'Analyze results',
  },
  fix: {
    command: 'fix',
    description: 'Generate fixes',
  },
  watch: {
    command: 'watch',
    description: 'Start watch mode',
  },
  deep: {
    command: 'deep-analyze',
    description: 'Deep analysis',
  },
  quick: {
    command: 'quick',
    description: 'Quick status',
  },
  code: {
    command: 'code',
    description: 'Binary status code',
  },
  next: {
    command: 'next',
    description: 'Next action',
  },
  go: {
    command: 'go',
    description: 'Full pipeline',
  },
  status: {
    command: 'status',
    description: 'Status display',
  },
  help: {
    command: 'help',
    description: 'Show help',
  },
};

/**
 * Resolve alias to actual command
 */
export function resolveAlias(input: string): string {
  const alias = ALIASES[input];
  if (alias) {
    return alias.command;
  }
  return input;
}

/**
 * Check if input is an alias
 */
export function isAlias(input: string): boolean {
  return input in ALIASES;
}

/**
 * Get alias description
 */
export function getAliasDescription(alias: string): string | null {
  return ALIASES[alias]?.description || null;
}

/**
 * List all aliases grouped by type
 */
export function listAliases(): {
  primary: Array<{ alias: string; command: string; description: string }>;
  secondary: Array<{ alias: string; command: string; description: string }>;
  word: Array<{ alias: string; command: string; description: string }>;
} {
  const primary: Array<{ alias: string; command: string; description: string }> = [];
  const secondary: Array<{ alias: string; command: string; description: string }> = [];
  const word: Array<{ alias: string; command: string; description: string }> = [];

  for (const [alias, info] of Object.entries(ALIASES)) {
    const entry = { alias, command: info.command, description: info.description };

    if (alias.length === 1) {
      primary.push(entry);
    } else if (alias.length === 2) {
      secondary.push(entry);
    } else {
      word.push(entry);
    }
  }

  return { primary, secondary, word };
}

/**
 * Format aliases for display
 */
export function formatAliases(): string {
  const { primary, secondary, word } = listAliases();
  const lines: string[] = [];

  lines.push('Shorthand Aliases');
  lines.push('═'.repeat(40));
  lines.push('');

  lines.push('Primary (single character):');
  for (const { alias, description } of primary) {
    lines.push(`  ${alias}  ${description}`);
  }
  lines.push('');

  lines.push('Secondary (two characters):');
  for (const { alias, description } of secondary) {
    lines.push(`  ${alias}  ${description}`);
  }
  lines.push('');

  lines.push('Word aliases:');
  for (const { alias, description } of word.slice(0, 10)) {
    lines.push(`  ${alias}  ${description}`);
  }

  return lines.join('\n');
}

/**
 * AI-optimized alias lookup
 *
 * Given a natural language intent, returns the best alias.
 */
export function suggestAlias(intent: string): string | null {
  const lower = intent.toLowerCase();

  // Status checks
  if (lower.includes('pass') || lower.includes('status')) {
    return '0';
  }

  // Running tests
  if (lower.includes('run') || lower.includes('test') || lower.includes('execute')) {
    return 'r';
  }

  // Fixing
  if (lower.includes('fix') || lower.includes('repair') || lower.includes('apply')) {
    if (lower.includes('apply') || lower.includes('auto')) {
      return 'fa';
    }
    return 'f';
  }

  // Analysis
  if (lower.includes('analyze') || lower.includes('analysis')) {
    if (lower.includes('deep') || lower.includes('root')) {
      return 'd';
    }
    return 'a';
  }

  // Watch
  if (lower.includes('watch') || lower.includes('monitor')) {
    return 'w';
  }

  // Next action
  if (lower.includes('next') || lower.includes('what') || lower.includes('should')) {
    return 'n';
  }

  // Full pipeline
  if (lower.includes('everything') || lower.includes('full') || lower.includes('pipeline')) {
    return 'g';
  }

  return null;
}

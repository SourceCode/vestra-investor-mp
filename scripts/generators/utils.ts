import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '../../');

// String helpers
export const toPascalCase = (str: string) =>
    str.replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));

export const toCamelCase = (str: string) => {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

export const toKebabCase = (str: string) =>
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('-') || str;

export const toSnakeCase = (str: string) =>
    toKebabCase(str).replace(/-/g, '_');

// File helpers
export const safeWriteFile = (filePath: string, content: string) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
        console.log(chalk.yellow(`  ⚠ File already exists (skipping): ${filePath}`));
        return false;
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(chalk.green(`  ✓ Created: ${path.relative(PROJECT_ROOT, filePath)}`));
    return true;
};

export const readFile = (filePath: string): string | null => {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
};

export const writeFile = (filePath: string, content: string) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(chalk.blue(`  ✎ Updated: ${path.relative(PROJECT_ROOT, filePath)}`));
};

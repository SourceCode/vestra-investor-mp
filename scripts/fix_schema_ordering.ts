/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { basename, join, resolve } from 'path';

const SCHEMA_DIR = resolve(process.cwd(), 'src/db/schemas');

async function fixSchemas() {
    const files = await glob(join(SCHEMA_DIR, '*.sql'));

    for (const file of files) {
        const content = readFileSync(file, 'utf-8');

        // Match CREATE TABLE block
        const createTableRegex = /(CREATE TABLE IF NOT EXISTS\s+\w+\s*\()([\s\S]+?)(\);)/i;
        const match = content.match(createTableRegex);

        if (!match) continue;

        const [_, header, body, footer] = match;

        // Split body into lines/statements
        // Use simpler splitting by comma + newline, assuming formatted
        // But some lines might handle multiple things? 
        // Our schemas are usually one item per line.
        // We will split by `,\n` or just newline and trim commas.

        const lines = body.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0);

        const columns: string[] = [];
        const constraints: string[] = [];
        const orderedLines: string[] = []; // To preserve comments/empty lines in their original positions

        // Process table body
        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('--')) {
                orderedLines.push(line); // Keep comments and empty lines as is
                return;
            }

            // Remove trailing comma for analysis
            const lineContent = trimmed.replace(/,$/, '');

            // Check if constraint
            // Starts with FOREIGN KEY, PRIMARY KEY (, UNIQUE (, CHECK (, CONSTRAINT
            const upper = lineContent.toUpperCase();
            if (
                upper.startsWith('FOREIGN KEY') ||
                (upper.startsWith('PRIMARY KEY') && upper.includes('(')) ||
                (upper.startsWith('UNIQUE') && upper.includes('(')) ||
                (upper.startsWith('CHECK') && upper.includes('(')) ||
                upper.startsWith('CONSTRAINT')
            ) {
                constraints.push(lineContent);
            } else if (lineContent.startsWith('--') || lineContent === '') {
                // comment or empty
                // We'll ignore comments inside body for now to simplify
            } else {
                columns.push(lineContent);
            }
        });

        if (constraints.length === 0) continue; // No need to reorder if no constraints

        // Reassemble
        // Columns first, joined by commas
        // Constraints second, joined by commas

        const allItems = [...columns, ...constraints];
        const newBody = '\n    ' + allItems.join(',\n    ') + '\n';

        const newContent = content.replace(createTableRegex, `${header}${newBody}${footer}`);

        if (newContent !== content) {
            console.log(`Reordering ${basename(file)}`);
            writeFileSync(file, newContent);
        }
    }
}

fixSchemas().catch(console.error);

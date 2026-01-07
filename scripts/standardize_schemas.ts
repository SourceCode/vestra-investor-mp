/* eslint-disable no-console */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// CONFIGURATION
const SCHEMA_DIR = join(process.cwd(), 'src/db/schemas');

function log(message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

const files = readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.sql'));

const standardBlockRaw = [
    '    is_active INTEGER NOT NULL DEFAULT 1',
    '    create_date TEXT NOT NULL DEFAULT (datetime(\'now\'))',
    '    update_date TEXT NOT NULL DEFAULT (datetime(\'now\'))',
    '    created_by_id TEXT',
    '    updated_by_id TEXT',
    '    version_num INTEGER NOT NULL DEFAULT 1',
    '    version_note TEXT',
    '    FOREIGN KEY (created_by_id) REFERENCES users(id)',
    '    FOREIGN KEY (updated_by_id) REFERENCES users(id)'
];

files.forEach(file => {
    const filePath = join(SCHEMA_DIR, file);
    let content = readFileSync(filePath, 'utf-8');

    // Regex to match CREATE TABLE block
    // Matches: CREATE TABLE [IF NOT EXISTS] tableName ( ... );
    const createTableRegex = /(CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)\s*\()([\s\S]*?)(\);)/i;
    const match = content.match(createTableRegex);

    if (match) {
        const preamble = match[1]; // CREATE TABLE ... (
        const closing = match[4]; // );

        // Split body into lines
        const lines = match[3].split('\n');

        const filteredLines: string[] = [];

        const auditKeywords = [
            'is_active', 'create_date', 'update_date', 'created_by_id', 'updated_by_id',
            'version_num', 'version_note', 'created_at', 'updated_at', 'created_by', 'updated_by',
            'FOREIGN KEY (created_by_id)', 'FOREIGN KEY (updated_by_id)', 'FOREIGN KEY (created_by)', 'FOREIGN KEY (updated_by)'
        ];

        // Check for and remove IF NOT EXISTS from the preamble
        if (preamble.includes('IF NOT EXISTS')) {
            const newPreamble = preamble.replace('IF NOT EXISTS ', '');
            content = content.replace(preamble, newPreamble);
            log(`- Removed IF NOT EXISTS from table creation in ${file}`);
            // hasChanges = true;
        }

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return; // Skip empty lines
            if (trimmed.startsWith('--')) return; // Skip comments inside body (rare but possible)

            // Check for ID
            if (/^id\s+/i.test(trimmed) || /^"id"\s+/i.test(trimmed)) {
                // We will reconstruct ID
                return;
            }

            // Check for Reference
            if (/^reference\s+/i.test(trimmed)) {
                // We will reconstruct Reference
                return;
            }

            // Check for Audit fields to remove
            const isAudit = auditKeywords.some(kw => {
                // specific check to avoid matching "id" as "created_by_id" false positive?
                // No, line.includes(kw) is robust enough for column definitions usually.
                // But "create_date" matches. "created_by_id" matches.
                // "created_by" matches "created_by_id"? Yes.
                // So "created_by" might remove "created_by_id". That's fine, we remove all variations.
                return line.includes(kw);
            });

            if (!isAudit) {
                // Keep this line. Remove trailing comma for now, we'll re-add later.
                // Preserve indentation?
                // We'll just push trimmed and re-indent
                filteredLines.push('    ' + ((line.trim().endsWith(',')) ? line.trim().slice(0, -1) : line.trim()));
            }
        });

        // Reconstruct Body
        const newBodyLines: string[] = [];

        // 1. ID (Always first)
        newBodyLines.push('    id TEXT PRIMARY KEY NOT NULL');

        // 2. Existing Columns (Filtered)
        newBodyLines.push(...filteredLines);

        // 3. Reference (if not present in filtered, but we stripped it above, so add it back)
        newBodyLines.push('    reference TEXT');

        // 4. Standard Audit Block
        newBodyLines.push(...standardBlockRaw);

        // Join with commas
        // All lines except LAST one need comma
        const bodyString = '\n' + newBodyLines.join(',\n') + '\n';

        const newContent = content.replace(createTableRegex, `${preamble}${bodyString}${closing}`);

        writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file} (No CREATE TABLE found)`);
    }
});

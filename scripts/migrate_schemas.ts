/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCHEMA_DIR = join(__dirname, '../src/db/schemas');

async function migrateSchemas() {
    const files = readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.sql'));

    console.log(`Found ${files.length} schema files.`);

    for (const file of files) {
        const filePath = join(SCHEMA_DIR, file);
        let content = readFileSync(filePath, 'utf-8');

        // 1. Rename created_at -> create_date
        if (content.includes('created_at TEXT')) {
            content = content.replace(/created_at TEXT/g, 'create_date TEXT');
        }

        // 2. Rename updated_at -> update_date
        if (content.includes('updated_at TEXT')) {
            content = content.replace(/updated_at TEXT/g, 'update_date TEXT');
        }

        // 3. Add version fields if missing
        // We look for the closing parenthesis of the CREATE TABLE statement to insert fields before it.
        // However, table definitions might end with FOREIGN KEY clauses or other constraints.
        // A robust way to insert fields is to find the last column definition or constraint and append.
        // But since we are renaming update_date (formerly updated_at), we can anchor on that if it exists.
        // Or we can just find the end of the table.

        // Let's assume most tables follow the pattern ... );
        // We want to verify if 'version_num' already exists.
        if (!content.includes('version_num INTEGER')) {
            // Strategy: Insert before the closing `);` of the table definition.
            // We find the last occurrence of `);` which closes the CREATE TABLE.
            // Caution: There might be indexes after the table.
            // We need to find `CREATE TABLE` and then the matching closing parenthesis.

            const createTableRegex = /CREATE TABLE IF NOT EXISTS [a-z_]+ \(([\s\S]*?)\);/gm;
            const match = createTableRegex.exec(content);

            if (match) {
                // We append the new columns to the end of the body.
                // Check if loop needs a comma. The last line might not have a comma if it was the last column.
                // But usually in SQL definitions in this project, lines end with comma except the last one.

                // Let's look for `update_date` which we just verified/renamed.
                // Usually `update_date` is near the end.

                // Simpler approach: replace `update_date TEXT NOT NULL DEFAULT (datetime('now'))` with
                // `update_date TEXT NOT NULL DEFAULT (datetime('now')),\n    version_num INTEGER NOT NULL DEFAULT 1,\n    version_note TEXT,\n    reference TEXT`

                // `update_date TEXT NOT NULL DEFAULT (datetime('now')),\n    version_num INTEGER NOT NULL DEFAULT 1,\n    version_note TEXT,\n    reference TEXT`

                // Alternatively, just inject before the last closing `)` of the table body.
                // Note: `lastIndexOf(')')` might be the closing of a foreign key or check constraint.
                // We need the closing parenthesis of the table.

                // Let's replace the last known common field to append our new ones.
                // If `updated_by_id` exists, append after it.
                // If not, append after `update_date`.

                // The following lines were unused and are being removed to fix lint errors.
                // const insertionPoint = match.index + match[0].length;
                // const replacement = '';

                if (content.includes('updated_by_id TEXT')) {
                    // Append after updated_by_id
                    // It might be followed by foreign keys or be the last item.
                    // We'll trust regex to handle the comma logic if we can.
                    // Actually, blindly appending might break syntax if the previous line didn't have a comma.

                    // Let's try to rewrite the whole "Standard Audit Block"
                    // PATTERN: 
                    // create_date ...
                    // update_date ...
                    // created_by_id ...
                    // updated_by_id ...

                    // We'll replace `updated_by_id TEXT` with `updated_by_id TEXT,\n    version_num INTEGER NOT NULL DEFAULT 1,\n    version_note TEXT,\n    reference TEXT`
                    // This works if updated_by_id is not the last line (e.g. followed by FKs).
                    // If it IS the last line, we need to ensure we don't add a trailing comma to reference TEXT if strict SQLite checks (SQLite allows trailing comma usually but let's be safe).
                    // Actually SQLite allows trailing comma in create table? No, standard SQL doesn't.

                    content = content.replace(
                        /updated_by_id TEXT(,?)/,
                        'updated_by_id TEXT,\n    version_num INTEGER NOT NULL DEFAULT 1,\n    version_note TEXT,\n    reference TEXT$1'
                    );

                } else if (content.includes('update_date TEXT NOT NULL DEFAULT (datetime(\'now\'))')) {
                    // If tables don't have created_by/updated_by columns
                    content = content.replace(
                        /update_date TEXT NOT NULL DEFAULT \(datetime\('now'\)\)(,?)/,
                        'update_date TEXT NOT NULL DEFAULT (datetime(\'now\')),\n    version_num INTEGER NOT NULL DEFAULT 1,\n    version_note TEXT,\n    reference TEXT$1'
                    );
                }
            }
        }

        writeFileSync(filePath, content, 'utf-8');
        console.log(`Processed ${file}`);
    }
}

migrateSchemas().catch(console.error);

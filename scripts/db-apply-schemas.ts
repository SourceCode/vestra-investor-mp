
import { AppDataSource } from '../src/db/data-source';
import { config } from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

config();

const SCHEMA_DIR = join(process.cwd(), 'src/db/schemas');

async function applySchemas() {
    console.log('Initializing database connection...');
    try {
        await AppDataSource.initialize();
    } catch (e) {
        if (!AppDataSource.isInitialized) {
            console.error("Failed to initialize data source:", e);
            process.exit(1);
        }
    }

    const queryRunner = AppDataSource.createQueryRunner();

    try {
        const files = readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.sql')).sort();
        console.log(`Found ${files.length} schema files.`);

        for (const file of files) {
            const filePath = join(SCHEMA_DIR, file);
            let content = readFileSync(filePath, 'utf-8');

            // Transformations for Postgres compatibility
            // 1. datetime('now') -> CURRENT_TIMESTAMP
            content = content.replace(/datetime\('now'\)/g, 'CURRENT_TIMESTAMP');

            // 2. INTEGER PRIMARY KEY AUTOINCREMENT -> SERIAL PRIMARY KEY
            content = content.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');

            // 3. Remove "IF NOT EXISTS" if it causes issues? Postgres supports it.
            // But some files might perform UPDATE/ALTER.

            // 4. Handle multiple statements (split by ;)
            const statements = content.split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            console.log(`Processing ${file} (${statements.length} statements)...`);

            for (const stmt of statements) {
                try {
                    await queryRunner.query(stmt);
                } catch (err: any) {
                    // Ignore "relation already exists" or "column already exists" errors
                    if (err.code === '42P07' || // relation "x" already exists
                        err.code === '42701' || // column "x" of relation "y" already exists
                        err.message.includes('already exists')) {
                        // console.log(`  - Skipped (already exists): ${stmt.substring(0, 50)}...`);
                    } else {
                        console.error(`  - Error executing statement in ${file}:`);
                        console.error(`    Statement: ${stmt}`);
                        console.error(`    Error: ${err.message}`);
                    }
                }
            }
        }

        console.log('Schema application completed.');

    } catch (err) {
        console.error('Schema application failed:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

applySchemas();

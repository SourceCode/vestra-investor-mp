
import { AppDataSource } from '../src/db/data-source';
import { config } from 'dotenv';

config();

async function repair() {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();

    console.log('Repairing files table...');
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        // Drop table if it exists to ensure clean slate (or we could alter, but this is a dev env repair)
        await queryRunner.query(`DROP TABLE IF EXISTS files`);

        // Create table with Postgres syntax and missing columns
        await queryRunner.query(`
            CREATE TABLE files (
                id TEXT PRIMARY KEY NOT NULL,
                parent_id TEXT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT,
                reference TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                create_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                update_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by_id TEXT,
                updated_by_id TEXT,
                version_num INTEGER NOT NULL DEFAULT 1,
                version_note TEXT,
                created_at BIGINT,
                updated_at BIGINT
            );
        `);

        await queryRunner.query(`CREATE INDEX idx_files_parent_id ON files (parent_id)`);

        console.log('Files table created successfully.');

        // Seed root folder?
        // FileSystemService.listRequests('root') expects items with parent_id = 'root' ?
        // Or items with parent_id IS NULL?
        // FileSystemService.listRequests handles 'root' by setting parentId = 'root'.
        // So we need items with parent_id = 'root' if we want them to show up.
        // Or we can leave it empty.

    } catch (err) {
        console.error('Repair failed:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

repair();

import { execSync } from 'child_process';
import * as path from 'path';

const args = process.argv.slice(2);
const migrationName = args[0];

if (!migrationName) {
    console.error('Please provide a migration name.');
    console.error('Usage: npm run db:gen-migration -- <MigrationName>');
    process.exit(1);
}

const dataSourcePath = 'src/db/data-source.ts';
const migrationPath = `src/db/migrations/${migrationName}`;

const command = `npx tsx ./node_modules/typeorm/cli.js migration:generate -d ${dataSourcePath} ${migrationPath}`;

console.log(`Running: ${command}`);

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('Migration generation failed.');
    process.exit(1);
}

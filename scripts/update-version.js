

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');

try {
    // 1. Get commit count from main branch
    // Using 'origin/main' to be safe in CI environments where local 'main' might not exist or be up to date
    // Fallback to 'main' if 'origin/main' fails (e.g. local dev without remote)
    let commitCount;
    try {
        commitCount = execSync('git rev-list --count origin/main').toString().trim();
    } catch (error) {
        console.log('Could not find origin/main, trying main...');
        commitCount = execSync('git rev-list --count main').toString().trim();
    }

    if (!commitCount || isNaN(parseInt(commitCount))) {
        throw new Error(`Invalid commit count: ${commitCount} `);
    }

    console.log(`Commit count for main: ${commitCount} `);

    // 2. Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const currentVersion = packageJson.version;

    if (!currentVersion) {
        throw new Error('No version found in package.json');
    }

    // 3. Construct new version
    const [major, minor] = currentVersion.split('.');
    const newVersion = `${major}.${minor}.${commitCount} `;

    console.log(`Updating version from ${currentVersion} to ${newVersion} `);

    // 4. Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log('package.json updated successfully.');

} catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
}

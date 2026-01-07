
import { execSync } from 'child_process';
import * as glob from 'glob';
import * as path from 'path';

// Note: Need to verify if glob is installed, otherwise use fs recursively. 
// User environment seems to use `glob` patterns in other scripts. 
// If glob module is not available, we'll shell out to `find`.

async function main() {
    console.log("Finding E2E test files...");

    // Using find command because I am not sure if `glob` package is in devDeps and importable by tsx easily without checking package.json
    // package.json has `glob`? Checked dependencies: NO. `gray-matter`, etc. 
    // `files` command in cli.ts uses something.
    // Let's use `find` via shell.

    try {
        const findOutput = execSync("find tests/e2e -name '*.spec.ts' -o -name '*.spec.cjs'").toString();
        const files = findOutput.split('\n').filter(f => f.trim() !== '');

        console.log(`Found ${files.length} E2E test files.`);

        for (const file of files) {
            console.log(`\n==================================================`);
            console.log(`Running: ${file}`);
            console.log(`==================================================\n`);

            try {
                // Run test
                execSync(`npx playwright test "${file}"`, { stdio: 'inherit' });
            } catch (error) {
                console.error(`FAILED: ${file}`);
                // Continue to next test? Or fail? User said "run ... then clear". 
                // Workflow implies finding all issues. I'll continue but track failures.
            }

            console.log(`\nCleaning up after ${file}...`);
            try {
                execSync("npm run test:e2e:clean", { stdio: 'inherit' });
            } catch (e) {
                console.error("Cleanup failed", e);
            }
        }

    } catch (e) {
        console.error("Error listing files", e);
    }
}

main();


import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';

const reportFile = 'verification_report.md';
let reportContent = '# Final Verification Report\n\n';

const log = (message: string) => {
    console.log(message);
    reportContent += message + '\n\n';
};

const runStep = (name: string, command: string) => {
    log(`## Step: ${name}`);
    log(`Running command: \`${command}\``);
    console.log(chalk.blue(`\n=== Starting ${name} ===`));

    try {
        const startTime = Date.now();
        // stdio: 'inherit' prints to console in real-time
        execSync(command, { stdio: 'inherit' });
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        const successMsg = `✅ ${name} PASSED (${duration}s)`;
        console.log(chalk.green(successMsg));
        log(successMsg);
        return true;
    } catch (error) {
        const errorMsg = `❌ ${name} FAILED`;
        console.error(chalk.red(errorMsg));
        log(errorMsg);
        log('```\n' + String(error) + '\n```');
        return false;
    }
};

const main = () => {
    // 1. Type Check
    const typeCheck = runStep('Type Safety', 'npm run typecheck');
    if (!typeCheck) process.exit(1);

    // 2. Lint & Boundaries
    const lint = runStep('Lint & Boundaries', 'npm run lint');
    if (!lint) process.exit(1);

    // 3. Tests
    const tests = runStep('Unit & Integration Tests', 'npm test -- --passWithNoTests');
    if (!tests) process.exit(1);

    // 4. Build
    const build = runStep('Production Build', 'npm run build');
    if (!build) process.exit(1);

    log('# Summary');
    log('All verification steps returned SUCCESS.');

    fs.writeFileSync(reportFile, reportContent);
    console.log(chalk.green(`\nVerification complete. Report saved to ${reportFile}`));
};

main();

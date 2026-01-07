import chalk from 'chalk';
import path from 'path';

export default function customFormatter(results) {
    let output = '';

    // Determine the repository root (assumes the formatter is run from the root)
    const repoRoot = process.cwd();

    results.forEach((result) => {
        if (result.messages.length > 0) {
            // Make the file path relative to the repository root
            const relativePath = path.relative(repoRoot, result.filePath);

            // Display the file path once for all associated messages
            output += `${chalk.underline(relativePath)}\n`;

            result.messages.forEach((message) => {
                const severity =
                    message.severity === 2
                        ? chalk.red('Error') // Errors in red
                        : chalk.yellow('Warning'); // Warnings in yellow

                const location = `${message.line}:${message.column}`;
                const ruleId = message.ruleId ? chalk.gray(`(${message.ruleId})`) : '';

                // Combine severity, message, and clickable relative file path with location
                output += `  ${severity}: ${message.message} ${ruleId}\n`;
                output += `  ${chalk.gray(`at ${location}`)}\n`; // Location indented under the file path
            });

            output += '\n'; // Separate each file's messages with a blank line
        }
    });

    return output || chalk.green('✔ No issues found!\n');
}
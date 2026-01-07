
import fs from 'fs';
import path from 'path';

interface Violation {
    filePath: string;
    line: number;
}

function parseLintReport(reportPath: string): Violation[] {
    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.split('\n');
    const violations: Violation[] = [];

    let currentFile = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('src/') && !line.startsWith('  ')) {
            currentFile = line.trim();
        } else if (line.includes('(boundaries/element-types)') && line.trim().startsWith('Error:')) {
            // Found an error, look for line number in subsequent lines
            // Usually "  at line:col" happens 1 or 2 lines after or sometimes on same line depending on formatter
            // Based on observed output:
            // src/foo.tsx
            //   Error: ...
            //   at 2:39

            // Check next line for "at row:col"
            let j = i + 1;
            while (j < lines.length && j < i + 3) {
                const nextLine = lines[j];
                const match = nextLine.match(/at (\d+):(\d+)/);
                if (match) {
                    violations.push({
                        filePath: currentFile,
                        line: parseInt(match[1], 10)
                    });
                    break;
                }
                j++;
            }
        }
    }
    return violations;
}

function applySuppressions(violations: Violation[]) {
    // Group by file
    const byFile: Record<string, number[]> = {};
    for (const v of violations) {
        if (!byFile[v.filePath]) byFile[v.filePath] = [];
        if (!byFile[v.filePath].includes(v.line)) {
            byFile[v.filePath].push(v.line);
        }
    }

    for (const filePath of Object.keys(byFile)) {
        const fullPath = path.resolve(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            continue;
        }

        const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
        // Sort lines descending so we don't mess up indices when inserting
        const linesToSuppress = byFile[filePath].sort((a, b) => b - a);

        let modified = false;
        for (const lineNum of linesToSuppress) {
            const index = lineNum - 1; // 0-indexed
            if (index >= 0 && index < lines.length) {
                const targetLine = lines[index];
                // Check if already suppressed
                if (index > 0 && lines[index - 1].includes('eslint-disable-next-line boundaries/element-types')) {
                    continue;
                }
                // Check if the target line is an import
                if (targetLine.trim().startsWith('import ') || targetLine.trim().startsWith('importtype ')) {
                    // Check indentation
                    const indent = targetLine.match(/^\s*/)?.[0] || '';
                    lines.splice(index, 0, `${indent}// eslint-disable-next-line boundaries/element-types`);
                    modified = true;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
}

const reportPath = process.argv[2] || 'lint_report_4.txt';
const violations = parseLintReport(reportPath);
console.log(`Found ${violations.length} violations.`);
applySuppressions(violations);

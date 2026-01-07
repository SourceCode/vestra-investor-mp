import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PROJECT_ROOT, safeWriteFile, toPascalCase } from '../generators/utils';

const COMPONENT_DIRS = [
    path.join(PROJECT_ROOT, 'src/components/shared'),
    path.join(PROJECT_ROOT, 'src/os/ui'),
];
const DOCS_COMP_DIR = path.join(PROJECT_ROOT, 'docs/components');

if (!fs.existsSync(DOCS_COMP_DIR)) {
    fs.mkdirSync(DOCS_COMP_DIR, { recursive: true });
}

interface PropDoc {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface ComponentDoc {
    name: string;
    description: string;
    props: PropDoc[];
}

const parseComponentFile = (filename: string, content: string): ComponentDoc | null => {
    // 1. Identify Component Name (export const Name)
    // Heuristic: matching props usage or simple export
    const componentMatch = content.match(/export const (\w+)\s*=/);
    if (!componentMatch) return null;
    const componentName = componentMatch[1];

    // 2. Description (Top level JSDoc)
    const descMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*export const/);
    const description = descMatch
        ? descMatch[1].replace(/\*/g, '').split('\n').map(l => l.trim()).filter(l => l).join(' ')
        : `UI Component: ${componentName}`;

    // 3. Props Interface
    // Look for "interface NameProps" or "type NameProps"
    // Handle optional "extends ..." part before the opening brace
    const propsMatch = content.match(/(interface|type)\s+(\w+Props|Props)[\s\S]*?(=|\{)/);

    const props: PropDoc[] = [];

    if (propsMatch) {
        // Find the block
        const propStartCoords = content.indexOf(propsMatch[0]);
        if (propStartCoords !== -1) {
            const lines = content.slice(propStartCoords).split('\n');
            let inBlock = false;
            let braceBalance = 0;

            for (let line of lines) {
                line = line.trim();

                if (line.includes('{')) {
                    braceBalance += (line.match(/{/g) || []).length;
                    inBlock = true;
                }
                if (line.includes('}')) {
                    braceBalance -= (line.match(/}/g) || []).length;
                }

                // Parse Prop Line: name?: type; // comment
                if (inBlock && braceBalance > 0) {
                    // Check for JSDoc content above the line if needed, but simple regex here:
                    // name?: type;
                    const propLineMatch = line.match(/^(\w+)(\??):\s*(.*?)(;|$)/);
                    if (propLineMatch) {
                        const name = propLineMatch[1];
                        const optional = propLineMatch[2] === '?';
                        let type = propLineMatch[3];

                        // Clean trailing comments from type
                        if (type.includes('//')) type = type.split('//')[0].trim();

                        // Simple description from trailing comment
                        let propDesc = '';
                        if (line.includes('//')) propDesc = line.split('//')[1].trim();

                        props.push({
                            name,
                            type,
                            required: !optional,
                            description: propDesc
                        });
                    }
                }

                if (inBlock && braceBalance === 0) break;
            }
        }
    }

    return {
        name: componentName,
        description,
        props
    };
};

const generateMarkdown = (doc: ComponentDoc): string => {
    let md = `# ${toPascalCase(doc.name)}\n\n`;
    md += `${doc.description}\n\n`;

    if (doc.props.length > 0) {
        md += `## Props\n\n`;
        md += `| Prop | Type | Required | Description |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;

        doc.props.forEach(p => {
            const req = p.required ? '✅' : '❌';
            const safeType = p.type.replace(/\|/g, '\\|'); // escape pipes in table
            md += `| **${p.name}** | \`${safeType}\` | ${req} | ${p.description} |\n`;
        });
    }

    return md;
};

const getAllFiles = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return [];
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            // Skip __tests__ 
            if (file !== '__tests__') {
                results = results.concat(getAllFiles(fullPath));
            }
        } else {
            if (file.endsWith('.tsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
};

const main = async () => {
    console.log(chalk.cyan('Generating Component Documentation...'));

    let allFiles: string[] = [];
    COMPONENT_DIRS.forEach(d => {
        allFiles = allFiles.concat(getAllFiles(d));
    });

    const indexList: { name: string, file: string }[] = [];

    for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const filename = path.basename(filePath);
        const doc = parseComponentFile(filename, content);

        if (doc) {
            const mdContent = generateMarkdown(doc);
            const outFile = `${doc.name}.md`;
            safeWriteFile(path.join(DOCS_COMP_DIR, outFile), mdContent);
            indexList.push({ name: doc.name, file: outFile });
        }
    }

    // Generate Index
    let indexMd = `# Component Catalog\n\n`;
    indexList.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        indexMd += `- [${item.name}](${item.file})\n`;
    });
    safeWriteFile(path.join(DOCS_COMP_DIR, 'README.md'), indexMd);

    console.log(chalk.green(`\n✓ Generated docs for ${indexList.length} components`));
};

main();

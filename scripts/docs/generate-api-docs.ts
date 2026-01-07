import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PROJECT_ROOT, safeWriteFile, toPascalCase } from '../generators/utils';

const ROUTERS_DIR = path.join(PROJECT_ROOT, 'src/server/api/routers');
const DOCS_API_DIR = path.join(PROJECT_ROOT, 'docs/api');

if (!fs.existsSync(DOCS_API_DIR)) {
    fs.mkdirSync(DOCS_API_DIR, { recursive: true });
}

interface ProcedureDoc {
    name: string;
    type: 'query' | 'mutation' | 'subscription';
    description: string;
    input?: string;
}

interface RouterDoc {
    name: string;
    description: string;
    procedures: ProcedureDoc[];
}

const parseRouter = (filename: string, content: string): RouterDoc | null => {
    // Basic regex parsing (can be improved with AST if needed)

    // 1. Identify Router Name
    const routerNameMatch = content.match(/export const (\w+)Router = createTRPCRouter/);
    if (!routerNameMatch) return null;
    const routerName = routerNameMatch[1];

    // 2. Identify Router Description (JSDoc before createTRPCRouter or top of file)
    // Looking for JSDoc immediately before the export
    const routerDescMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*export const/);
    const description = routerDescMatch
        ? routerDescMatch[1].replace(/\*/g, '').split('\n').map(l => l.trim()).filter(l => l).join(' ')
        : `${toPascalCase(routerName)} API Endpoints`;

    const procedures: ProcedureDoc[] = [];

    // 3. Parse Procedures
    // We split by keys in the object
    const lines = content.split('\n');
    let currentDoc: string = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Capture JSDoc
        if (line.startsWith('/**')) {
            currentDoc = '';
            // multiline handling could be improved, but assuming standard format
            continue;
        }
        if (line.startsWith('*')) {
            currentDoc += line.replace(/^\*\s*/, '') + ' ';
            continue;
        }
        if (line.includes('*/')) {
            continue;
        }

        // Capture Procedure Definition
        // e.g. "checkDuplicates: protectedProcedure"
        const procMatch = line.match(/^(\w+):\s*(publicProcedure|protectedProcedure|adminProcedure)/);
        if (procMatch) {
            const procName = procMatch[1];

            // Look ahead for .query | .mutation
            let type: ProcedureDoc['type'] = 'query'; // default
            let input = '';

            // simple lookahead for next few lines
            let j = i;
            while (j < lines.length && j < i + 20) {
                const nextLine = lines[j].trim();

                if (nextLine.includes('.mutation(')) {
                    type = 'mutation';
                }
                if (nextLine.includes('.subscription(')) {
                    type = 'subscription';
                }

                // Try to grab input schema name or shape
                // .input(ContactFiltersSchema) or .input(z.object({...}))
                const inputMatch = nextLine.match(/\.input\(([\s\S]*?)\)/);
                if (inputMatch) {
                    input = inputMatch[1];
                    // If it's a multiline z.object, this simple regex fails. 
                    // For now, simpler is better. We'll capture the first line.
                    if (input.includes('z.object')) {
                        input = 'z.object({ ... })';
                    }
                }

                if (nextLine.includes('}),')) break; // End of procedure usually
                j++;
            }

            procedures.push({
                name: procName,
                type,
                description: currentDoc.trim(),
                input: input || 'void',
            });

            currentDoc = ''; // reset
        }
    }

    return {
        name: routerName,
        description,
        procedures
    };
};

const generateMarkdown = (doc: RouterDoc): string => {
    let md = `# ${toPascalCase(doc.name)} Router\n\n`;
    md += `${doc.description}\n\n`;

    md += `## Procedures\n\n`;
    md += `| Name | Type | Input | Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    doc.procedures.forEach(proc => {
        const typeBadge = proc.type === 'mutation' ? '🔴 Mutation' : '🔵 Query';
        const inputCode = `\`${proc.input}\``;
        md += `| **${proc.name}** | ${typeBadge} | ${inputCode} | ${proc.description} |\n`;
    });

    return md;
};

const main = async () => {
    console.log(chalk.cyan('Generating API Documentation...'));

    const files = fs.readdirSync(ROUTERS_DIR).filter(f => f.endsWith('.ts'));
    const indexList: { name: string, file: string }[] = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(ROUTERS_DIR, file), 'utf-8');
        const doc = parseRouter(file, content);

        if (doc) {
            const mdContent = generateMarkdown(doc);
            const outFile = `${doc.name}.md`;
            safeWriteFile(path.join(DOCS_API_DIR, outFile), mdContent);
            indexList.push({ name: doc.name, file: outFile });
        }
    }

    // Generate Index
    let indexMd = `# API Documentation\n\n`;
    indexList.forEach(item => {
        indexMd += `- [${toPascalCase(item.name)}](${item.file})\n`;
    });
    safeWriteFile(path.join(DOCS_API_DIR, 'README.md'), indexMd);

    console.log(chalk.green(`\n✓ Generated docs for ${indexList.length} routers`));
};

main();

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PROJECT_ROOT, safeWriteFile, toPascalCase } from '../generators/utils';

const SCHEMAS_DIR = path.join(PROJECT_ROOT, 'src/lib/schemas');
const DOCS_SCHEMA_DIR = path.join(PROJECT_ROOT, 'docs/schemas');

if (!fs.existsSync(DOCS_SCHEMA_DIR)) {
    fs.mkdirSync(DOCS_SCHEMA_DIR, { recursive: true });
}

interface FieldDoc {
    name: string;
    type: string;
    description: string;
    required: boolean;
}

interface SchemaDoc {
    name: string;
    fields: FieldDoc[];
}

const parseSchemaFile = (filename: string, content: string): SchemaDoc[] => {
    const schemas: SchemaDoc[] = [];
    const lines = content.split('\n');

    let currentSchema: SchemaDoc | null = null;
    let braceBalance = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 1. Detect Start of Schema
        // export const ContactSchema = BaseEntitySchema.extend({
        // export const SomeSchema = z.object({
        const startMatch = line.match(/export const (\w+) = .*?(\.extend\(|\.object\(|\.merge\()/);
        if (startMatch && !currentSchema) {
            currentSchema = {
                name: startMatch[1],
                fields: []
            };
            // count braces to find end
            braceBalance = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            continue;
        }

        if (currentSchema) {
            braceBalance += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

            // 2. Parse Fields
            // name: z.string().min(1, 'First name is required'),
            const fieldMatch = line.match(/^(\w+):\s*z\.(.*?)(,|$)/);
            if (fieldMatch) {
                const fieldName = fieldMatch[1];
                const typeChain = fieldMatch[2];

                // Heuristic type Extraction
                let type = 'any';
                if (typeChain.includes('string()')) type = 'string';
                else if (typeChain.includes('number()')) type = 'number';
                else if (typeChain.includes('boolean()')) type = 'boolean';
                else if (typeChain.includes('date()') || typeChain.includes('datetime()')) type = 'date';
                else if (typeChain.includes('array(')) type = 'array';
                else if (typeChain.includes('object(')) type = 'object';
                else if (typeChain.includes('literal(')) type = 'literal';
                else if (typeChain.includes('union(')) type = 'union';

                const isOptional = typeChain.includes('optional()');
                const isNullable = typeChain.includes('nullable()');

                // Description extraction from .min(1, 'Desc') or .regex(..., 'Desc') or comments
                let description = '';
                const descMatch = typeChain.match(/['"`](.*?)['"`]/);
                if (descMatch) {
                    description = descMatch[1];
                }

                // Check for comment on same line
                const commentMatch = line.match(/\/\/ (.*)$/);
                if (commentMatch) {
                    description = description ? `${description} (${commentMatch[1]})` : commentMatch[1];
                }

                let fullType = type;
                if (isNullable) fullType += ' | null';

                currentSchema.fields.push({
                    name: fieldName,
                    type: fullType,
                    required: !isOptional,
                    description
                });
            }

            // End of schema detection
            if (braceBalance === 0 || (line.startsWith('});') && braceBalance <= 0) || (line.startsWith('})') && braceBalance <= 0)) {
                schemas.push(currentSchema);
                currentSchema = null;
            }
        }
    }

    return schemas;
};

const generateMarkdown = (filename: string, schemas: SchemaDoc[]): string => {
    let md = `# Schema: ${path.basename(filename, '.ts')}\n\n`;

    schemas.forEach(schema => {
        md += `## ${schema.name}\n\n`;
        md += `| Field | Type | Required | Description |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;

        if (schema.fields.length === 0) {
            md += `| *Extensions/Composition* | - | - | See inherited schema |\n`;
        } else {
            schema.fields.forEach(f => {
                const req = f.required ? '✅' : '❌';
                md += `| **${f.name}** | \`${f.type}\` | ${req} | ${f.description} |\n`;
            });
        }
        md += `\n`;
    });

    return md;
};

const getAllFiles = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
        } else {
            if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
};

const main = async () => {
    console.log(chalk.cyan('Generating Schema Documentation...'));

    const files = getAllFiles(SCHEMAS_DIR);
    const indexList: { name: string, file: string }[] = [];

    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(SCHEMAS_DIR, filePath);
        const docs = parseSchemaFile(relativePath, content);

        if (docs.length > 0) {
            const mdContent = generateMarkdown(relativePath, docs);
            const flatName = relativePath.replace(/\//g, '_').replace('.ts', '.md');
            safeWriteFile(path.join(DOCS_SCHEMA_DIR, flatName), mdContent);
            indexList.push({ name: relativePath.replace('.ts', ''), file: flatName });
        }
    }

    // Generate Index
    let indexMd = `# Schema Documentation\n\n`;
    indexList.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        indexMd += `- [${item.name}](${item.file})\n`;
    });
    safeWriteFile(path.join(DOCS_SCHEMA_DIR, 'README.md'), indexMd);

    console.log(chalk.green(`\n✓ Generated docs for ${indexList.length} schema files`));
};

main();

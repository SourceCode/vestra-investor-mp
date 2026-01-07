
import { Project, SyntaxKind, QuoteKind } from 'ts-morph';
import path from 'path';
import * as fs from 'fs';

const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
    skipAddingFilesFromTsConfig: false,
});

const paths = {
    "@/lib/utils": "src/lib/utils",
    "@/lib/consts": "src/lib/consts",
    "@/lib/types": "src/lib/types",
    "@/lib/schemas": "src/lib/schemas",
    "@/lib/classes": "src/lib/classes",
    "@/lib/enums": "src/lib/enums",
    "@/lib/interfaces": "src/lib/interfaces",
    "@/services": "src/services",
    "@/db": "src/db",
    "@/hooks": "src/hooks",
    "@/components": "src/components",
    "@/store": "src/store",
    "@/apps": "src/apps",
    "@/os": "src/os",
    "@/server": "src/server",
    "@/utils": "src/utils", // Note: src/utils/api.ts is covered here if it matches
};

// Sort paths by length descending to match most specific first
const sortedAliases = Object.entries(paths).sort((a, b) => b[1].length - a[1].length);

let modifiedCount = 0;

const sourceFiles = project.getSourceFiles();

console.log(`Processing ${sourceFiles.length} files...`);

sourceFiles.forEach(sourceFile => {
    const filePath = sourceFile.getFilePath();
    const fileDir = path.dirname(filePath);
    let fileModified = false;

    sourceFile.getImportDeclarations().forEach(importDecl => {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();

        if (moduleSpecifier.startsWith('.')) {
            // Resolve absolute path
            const absoluteImportPath = path.resolve(fileDir, moduleSpecifier);
            // Get relative path from project root
            // ts-morph uses standardized paths (forward slash), possibly. 
            // path.resolve uses system separator.
            // We need to be careful with separators.
            const relativeToRoot = path.relative(process.cwd(), absoluteImportPath).split(path.sep).join('/');

            // Check against aliases
            for (const [alias, srcPath] of sortedAliases) {
                if (relativeToRoot.startsWith(srcPath)) {
                    // Found a match
                    const remainder = relativeToRoot.slice(srcPath.length);
                    // If remainder is empty or starts with /, it's a match.
                    // e.g. src/db/client -> @/db/client (remainder "/client")
                    // src/db -> @/db (remainder "")
                    if (remainder === '' || remainder.startsWith('/')) {
                        let newPath = alias + remainder;
                        // Special case: /index is often omitted, but let's keep it simple or follow existing style.
                        // Replacing...
                        importDecl.setModuleSpecifier(newPath);
                        fileModified = true;
                        break;
                    }
                }
            }
        }
    });

    if (fileModified) {
        sourceFile.saveSync();
        modifiedCount++;
        console.log(`Updated: ${sourceFile.getBaseName()}`);
    }
});

console.log(`Refactoring complete. Modified ${modifiedCount} files.`);

import path from 'path';
import { PROJECT_ROOT, safeWriteFile, toCamelCase, toPascalCase, toSnakeCase } from './utils';
import chalk from 'chalk';

interface EntityGeneratorOptions {
    name: string;      // e.g., "ProjectTask"
    domain: string;    // e.g., "crm" or "projects"
    tableName?: string; // e.g., "project_tasks" (optional override)
}

export const generateEntity = async ({ name, domain, tableName }: EntityGeneratorOptions) => {
    const pascalName = toPascalCase(name);
    const camelName = toCamelCase(name);
    const snakeName = tableName || toSnakeCase(name);
    const domainPath = domain.toLowerCase();

    console.log(chalk.blue(`\nGenerating Entity: ${pascalName} in domain ${domainPath}...`));

    // 1. SQL Schema
    const sqlContent = `
CREATE TABLE IF NOT EXISTS ${snakeName} (
    -- Primary Key with prefix (adjust prefix as needed)
    id TEXT PRIMARY KEY,

    -- Core Fields
    name TEXT NOT NULL,
    description TEXT,
    
    -- Audit Fields (Required)
    is_active INTEGER DEFAULT 1,
    create_date TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    update_date TEXT NOT NULL,
    updated_by_id TEXT NOT NULL,
    version_num INTEGER DEFAULT 1,
    version_note TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_${snakeName}_created ON ${snakeName}(create_date);
`;
    const sqlPath = path.join(PROJECT_ROOT, 'src/db/schemas', domainPath, `2000_${snakeName}.sql`);
    safeWriteFile(sqlPath, sqlContent.trim());

    // 2. TypeORM Entity
    const entityContent = `
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/db/entities/base/BaseEntity';

@Entity('${snakeName}')
export class ${pascalName} extends BaseEntity {
    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
`;
    const entityPath = path.join(PROJECT_ROOT, 'src/db/entities', domainPath, `${pascalName}.entity.ts`);
    safeWriteFile(entityPath, entityContent.trim());

    // 3. Zod Schema
    const zodContent = `
import { z } from 'zod';
import { BaseEntitySchema } from '@/lib/schemas/common';

export const ${pascalName}Schema = BaseEntitySchema.extend({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export type ${pascalName} = z.infer<typeof ${pascalName}Schema>;

export const Create${pascalName}Input = ${pascalName}Schema.pick({
    name: true,
    description: true,
});

export const Update${pascalName}Input = Create${pascalName}Input.partial();
`;
    const zodPath = path.join(PROJECT_ROOT, 'src/lib/schemas', domainPath, `${camelName}.ts`);
    safeWriteFile(zodPath, zodContent.trim());

    // 4. Repository
    const repoContent = `
import { AppDataSource } from '@/db/data-source';
import { ${pascalName} } from '@/db/entities/${domainPath}/${pascalName}.entity';
import { BaseRepository } from '@/db/repositories/BaseRepository';

export class ${pascalName}Repository extends BaseRepository<${pascalName}> {
    constructor() {
        super(AppDataSource.getRepository(${pascalName}));
    }
}
`;
    const repoPath = path.join(PROJECT_ROOT, 'src/db/repositories', `${pascalName}Repository.ts`);
    safeWriteFile(repoPath, repoContent.trim());

    // 5. Service
    const serviceContent = `
import { ${pascalName}Repository } from '@/db/repositories/${pascalName}Repository';
import { ${pascalName}, Create${pascalName}Input, Update${pascalName}Input } from '@/lib/schemas/${domainPath}/${camelName}';
import { AppError } from '@/lib/errors';
import { generateId } from '@/lib/utils';
import { z } from 'zod';

class ${pascalName}Service {
    private repo = new ${pascalName}Repository();

    async getById(id: string): Promise<${pascalName} | null> {
        const entity = await this.repo.findById(id);
        if (!entity) return null;
        return entity as unknown as ${pascalName};
    }

    async create(data: z.infer<typeof Create${pascalName}Input>, userId: string): Promise<${pascalName}> {
        const now = new Date().toISOString();
        const entity = {
            id: generateId('${camelName.slice(0, 3)}-'), // Adjust prefix
            ...data,
            isActive: true,
            createDate: now,
            createdById: userId,
            updateDate: now,
            updatedById: userId,
            versionNum: 1,
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.repo.save(entity as any);
        return entity as unknown as ${pascalName};
    }

    async update(id: string, data: z.infer<typeof Update${pascalName}Input>, userId: string): Promise<${pascalName}> {
        const existing = await this.repo.findById(id);
        if (!existing) throw new AppError('NOT_FOUND', '${pascalName} not found');

        const updates = {
            ...data,
            updateDate: new Date().toISOString(),
            updatedById: userId,
            versionNum: (existing.versionNum || 0) + 1,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.repo.update(id, updates as any, userId);
        return { ...existing, ...updates } as unknown as ${pascalName};
    }

    async delete(id: string, userId: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.update(id, { isActive: false } as any, userId);
    }
}

export const ${camelName}Service = new ${pascalName}Service();
`;
    const servicePath = path.join(PROJECT_ROOT, 'src/services', domainPath, `${camelName}.service.ts`);
    safeWriteFile(servicePath, serviceContent.trim());

    // 6. Router
    const routerContent = `
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { ${camelName}Service } from '@/services/${domainPath}/${camelName}.service';
import { Create${pascalName}Input, Update${pascalName}Input } from '@/lib/schemas/${domainPath}/${camelName}';
import { z } from 'zod';

export const ${camelName}Router = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return ${camelName}Service.getById(input.id);
        }),

    create: protectedProcedure
        .input(Create${pascalName}Input)
        .mutation(async ({ input, ctx }) => {
            return ${camelName}Service.create(input, ctx.user.id);
        }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), data: Update${pascalName}Input }))
        .mutation(async ({ input, ctx }) => {
            return ${camelName}Service.update(input.id, input.data, ctx.user.id);
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            return ${camelName}Service.delete(input.id, ctx.user.id);
        }),
});
`;
    const routerPath = path.join(PROJECT_ROOT, 'src/server/api/routers', `${camelName}.ts`);
    safeWriteFile(routerPath, routerContent.trim());

    console.log(chalk.green(`\n✓ Entity ${pascalName} generation complete!`));
    console.log(chalk.yellow(`  ⚠ NEXT STEPS:`));
    console.log(`  1. Register entity in src/db/entities/index.ts`);
    console.log(`  2. Add router to src/server/api/root.ts`);
    console.log(`  3. Run 'npm run db:gen-schemas' to sync`);
};

import 'reflect-metadata';
import { config as dotenvConfig } from 'dotenv';

// Load .env file for database connection settings BEFORE any other imports
// This must happen before TypeORM DataSource is created
dotenvConfig();

// Verify env is loaded
console.log('Environment loaded:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE,
    DB_MIGRATIONS: process.env.DB_MIGRATIONS
});

async function runSeeders() {
    try {
        // Dynamic imports to ensure dotenv is loaded first
        const { AppDataSource } = await import('../src/db/data-source');
        const { seedReferences } = await import('../src/db/seeders/ReferenceSeeder');
        const { seedCore } = await import('../src/db/seeders/CoreSeeder');
        const { seedDomain } = await import('../src/db/seeders/DomainSeeder');
        const { ApprovalSeeder } = await import('../src/db/seeders/ApprovalSeeder');

        console.log('Initializing DataSource for seeding...');
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        console.log('Starting Seeding Process...');
        await AppDataSource.synchronize(true);

        // 1. References (Static Data)
        await seedReferences(AppDataSource);

        // 2. Core (Roles, Permissions, Users)
        await seedCore(AppDataSource);

        // 2b. Approval Config
        await ApprovalSeeder.seed(AppDataSource);

        // 3. Domain (Sample Data)
        await seedDomain(AppDataSource);

        console.log('Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

runSeeders();

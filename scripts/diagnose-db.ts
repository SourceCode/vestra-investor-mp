
import 'reflect-metadata'; // Required for TypeORM
import 'dotenv/config'; // Load .env
import { initializeDatabase, AppDataSource } from '../src/db/data-source';
import { entities } from '../src/db/entities';

async function main() {
    console.log('--- STARTING DB DIAGNOSIS ---');

    console.log('Checking exported entities array...');
    const undefinedEntities = entities.map((e, i) => ({ e, i })).filter(x => !x.e);
    if (undefinedEntities.length > 0) {
        console.error('CRITICAL ERROR: The following entity indices are undefined/null:', undefinedEntities.map(x => x.i));
        console.error('This indicates a Circular Import in src/db/entities/index.ts');
        console.error(`First undefined index: ${undefinedEntities[0].i}`);
    } else {
        console.log(`Exported entities array is valid (${entities.length} items).`);
        const sample = entities[0];
        console.log('Sample Entity (Index 0):', sample);
        console.log('Sample Type:', typeof sample);
        console.log('Sample Name:', sample?.name);
        console.log('Sample Prototype:', Object.getPrototypeOf(sample));
    }

    try {
        console.log('Calling initializeDatabase()...');
        await initializeDatabase();
        console.log('Database initialized successfully!');

        console.log('Checking entities...');
        const meta = AppDataSource.entityMetadatas;
        console.log(`Loaded ${meta.length} entities.`);

        if (meta.length === 0) {
            console.error('ERROR: No entities loaded!');
        } else {
            console.log('Sample entities:', meta.slice(0, 5).map(m => m.name).join(', '));

            // Check specific entities
            const required = ['FundingRequest', 'Payroll', 'Property'];
            const missing = required.filter(name => !meta.find(m => m.name === name));
            if (missing.length > 0) {
                console.error('ERROR: Missing required entities:', missing);
            } else {
                console.log('All required entities found.');
            }
        }

        await AppDataSource.destroy();
        console.log('Database connection closed.');

    } catch (error) {
        console.error('--- DB INITIALIZATION FAILED ---');
        console.error(error);
        process.exit(1);
    }
}

main().catch(console.error);

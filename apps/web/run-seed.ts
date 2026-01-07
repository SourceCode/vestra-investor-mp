import { seedRBAC } from './src/db/seeders/rbac.seeder';
import { AppDataSource } from './src/db/data-source';

const run = async () => {
    try {
        await AppDataSource.initialize();
        await seedRBAC();
        console.log('Seeding Complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();

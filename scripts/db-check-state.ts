
import { AppDataSource } from '../src/db/data-source';
import { config } from 'dotenv';

config();

async function checkState() {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        console.log('Listing tables...');
        const tables = await queryRunner.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('Tables found:', tables.map((t: any) => t.table_name));

        if (tables.find((t: any) => t.table_name === 'users')) {
            const userCount = await queryRunner.query('SELECT count(*) as c FROM users');
            console.log('Users count:', userCount[0].c);
        } else {
            console.log('CRITICAL: users table NOT found.');
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

checkState();

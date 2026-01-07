
import 'dotenv/config';
import { AppDataSource, initializeDatabase } from '@/db/data-source';
import { contactService } from '../src/services/crm/contact-service';

async function testContacts() {
    console.log('Initializing database...');
    try {
        await initializeDatabase();
        console.log('Database initialized status:', AppDataSource.isInitialized);
    } catch (e) {
        console.error('Failed to init DB:', e);
        process.exit(1);
    }

    try {
        console.log('Fetching contacts...');
        const result = await contactService.getAll({ limit: 5 });
        console.log('Contacts fetched:', result.length);
        console.log(result);
    } catch (err: any) {
        console.error('Error fetching contacts:', err);
        if (err.stack) console.error(err.stack);
    } finally {
        await AppDataSource.destroy();
    }
}

testContacts();

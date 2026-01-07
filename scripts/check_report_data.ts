
import { db } from '@/db/client';

async function check() {
    try {
        const folders = await db.query('SELECT count(*) as c FROM report_folders');
        const types = await db.query('SELECT count(*) as c FROM report_types');
        console.log('Folders:', folders.data);
        console.log('Types:', types.data);
    } catch (e) {
        console.error(e);
    }
}

check();

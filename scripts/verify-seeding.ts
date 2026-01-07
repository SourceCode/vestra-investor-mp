import { AppDataSource } from '@/db/data-source';
import { User } from '@/db/entities/core/User.entity';
import { Role } from '@/db/entities/core/Role.entity';
import { Property } from '@/db/entities/crm/Property.entity';
import { Contact } from '@/db/entities/crm/Contact.entity';
import { Deal } from '@/db/entities/crm/Deal.entity';
import { Agent } from '@/db/entities/crm/Agent.entity';
import { Address } from '@/db/entities/crm/Address.entity';
import { Office } from '@/db/entities/crm/Office.entity';
import { Market } from '@/db/entities/crm/Market.entity';

async function verifySeeding() {
    console.log('Verifying Seeding...');
    await AppDataSource.initialize();

    const users = await AppDataSource.getRepository(User).count();
    const roles = await AppDataSource.getRepository(Role).count();
    const properties = await AppDataSource.getRepository(Property).count();
    const contacts = await AppDataSource.getRepository(Contact).count();
    const deals = await AppDataSource.getRepository(Deal).count();
    const agents = await AppDataSource.getRepository(Agent).count();
    const addresses = await AppDataSource.getRepository(Address).count();
    const offices = await AppDataSource.getRepository(Office).count();
    const markets = await AppDataSource.getRepository(Market).count();

    console.log('--------------------------------');
    console.log(`Users: ${users}`);
    console.log(`Roles: ${roles}`);
    console.log(`Properties: ${properties}`);
    console.log(`Contacts: ${contacts}`);
    console.log(`Deals: ${deals}`);
    console.log(`Agents: ${agents}`);
    console.log(`Addresses: ${addresses}`);
    console.log(`Offices: ${offices}`);
    console.log(`Markets: ${markets}`);
    console.log('--------------------------------');

    if (users > 0 && roles > 0 && properties > 0 && deals > 0) {
        console.log('VERIFICATION SUCCESS: Data present in all key tables.');
    } else {
        console.error('VERIFICATION FAILED: Missing data in one or more key tables.');
        process.exit(1);
    }
}

verifySeeding().catch(console.error);

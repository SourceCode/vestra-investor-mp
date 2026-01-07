import { Deal, User, ActivityEvent } from '../../types';
import { CrmAdapter } from './crm-adapter.interface';
import { SalesforceAdapter } from './salesforce-adapter';

export class CrmService {
    private adapters: CrmAdapter[] = [];

    constructor() {
        // Automatically register standard adapters
        this.registerAdapter(new SalesforceAdapter());
    }

    registerAdapter(adapter: CrmAdapter) {
        this.adapters.push(adapter);
    }

    async syncContact(contact: User): Promise<void> {
        await Promise.all(this.adapters.map(adapter => adapter.syncContact(contact)));
    }

    async syncDeal(deal: Deal): Promise<void> {
        await Promise.all(this.adapters.map(adapter => adapter.syncDeal(deal)));
    }

    async syncActivity(activity: ActivityEvent): Promise<void> {
        await Promise.all(this.adapters.map(adapter => adapter.syncActivity(activity)));
    }
}

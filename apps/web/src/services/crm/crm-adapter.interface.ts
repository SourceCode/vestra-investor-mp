import { Deal, User, ActivityEvent } from '../../types';

export interface CrmAdapter {
    name: string;
    isEnabled: boolean;

    syncContact(contact: User): Promise<void>;
    syncDeal(deal: Deal): Promise<void>;
    syncActivity(activity: ActivityEvent): Promise<void>;
}

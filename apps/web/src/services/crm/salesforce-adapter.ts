import { Deal, User, ActivityEvent, DealStatus } from '../../types';
import { CrmAdapter } from './crm-adapter.interface';

// Salesforce Field Mappings (Mock)
interface SalesforceContact {
    FirstName: string;
    LastName: string;
    Email: string;
    Phone?: string;
    Homify_User_Id__c: string;
}

interface SalesforceOpportunity {
    Name: string;
    StageName: string;
    CloseDate: string; // ISO Date
    Amount?: number;
    Homify_Deal_Id__c: string;
}

export class SalesforceAdapter implements CrmAdapter {
    name = 'Salesforce';
    isEnabled = true; // Would likely come from FeatureFlags or OrgSettings in real app

    private baseUrl = 'https://mock.salesforce.com/services/data/v60.0';

    async syncContact(contact: User): Promise<void> {
        if (!this.isEnabled) return;

        const sfContact: SalesforceContact = {
            FirstName: contact.firstName,
            LastName: contact.lastName,
            Email: contact.email,
            Phone: contact.phone,
            Homify_User_Id__c: contact.id
        };

        await this.mockApiCall('POST', '/sobjects/Contact', sfContact);
        console.log(`[SalesforceAdapter] Synced Contact: ${contact.email}`);
    }

    async syncDeal(deal: Deal): Promise<void> {
        if (!this.isEnabled) return;

        const sfOpportunity: SalesforceOpportunity = {
            Name: deal.title,
            StageName: this.mapStatusToStage(deal.status),
            CloseDate: new Date().toISOString().split('T')[0], // Default to today/future
            Amount: deal.price,
            Homify_Deal_Id__c: deal.id
        };

        await this.mockApiCall('POST', '/sobjects/Opportunity', sfOpportunity);
        console.log(`[SalesforceAdapter] Synced Deal: ${deal.title} as Opportunity`);
    }

    async syncActivity(activity: ActivityEvent): Promise<void> {
        if (!this.isEnabled) return;

        // Map Activity to Task
        const sfTask = {
            Subject: `Activity: ${activity.type}`,
            Description: activity.description,
            ActivityDate: new Date().toISOString().split('T')[0],
            Status: 'Completed',
            WhatId: activity.propertyId // simplified association
        };

        await this.mockApiCall('POST', '/sobjects/Task', sfTask);
        console.log(`[SalesforceAdapter] Synced Activity: ${activity.type}`);
    }

    private mapStatusToStage(status: DealStatus): string {
        switch (status) {
            case DealStatus.DRAFT: return 'Prospecting';
            case DealStatus.PUBLISHED: return 'Qualification';
            case DealStatus.OFFER_SUBMITTED: return 'Proposal/Price Quote';
            case DealStatus.OFFER_ACCEPTED: return 'Negotiation/Review';
            case DealStatus.UNDER_CONTRACT: return 'Closed Won'; // In some flows
            case DealStatus.CLOSED: return 'Closed Won';
            case DealStatus.CANCELLED: return 'Closed Lost';
            default: return 'Prospecting';
        }
    }

    private async mockApiCall(method: string, endpoint: string, data: any): Promise<void> {
        // Simulate network delay
        return new Promise(resolve => setTimeout(resolve, 50));
    }
}

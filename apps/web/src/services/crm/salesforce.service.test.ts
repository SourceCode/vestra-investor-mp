import { SalesforceAdapter } from './salesforce-adapter';
import { Deal, User, DealStatus, OrganizationMember, Role } from '../../types';

describe('SalesforceAdapter', () => {
    let adapter: SalesforceAdapter;
    let mockApiSpy: jest.SpyInstance;

    beforeEach(() => {
        adapter = new SalesforceAdapter();
        // @ts-ignore - access private method for spying
        mockApiSpy = jest.spyOn(adapter, 'mockApiCall');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should map User to Salesforce Contact', async () => {
        const mockUser: User = {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '555-1234',
            memberships: [],
            role: 'USER' // Required legacy field
        };

        await adapter.syncContact(mockUser);

        expect(mockApiSpy).toHaveBeenCalledWith('POST', '/sobjects/Contact', {
            FirstName: 'John',
            LastName: 'Doe',
            Email: 'john@example.com',
            Phone: '555-1234',
            Homify_User_Id__c: 'user-1'
        });
    });

    it('should map Deal to Salesforce Opportunity', async () => {
        const mockDeal: Deal = {
            id: 'deal-1',
            title: '123 Main St',
            price: 500000,
            status: DealStatus.OFFER_ACCEPTED,
            // ... minimal required fields
            address: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            organizationId: 'org-1',
            createdById: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await adapter.syncDeal(mockDeal);

        expect(mockApiSpy).toHaveBeenCalledWith('POST', '/sobjects/Opportunity', expect.objectContaining({
            Name: '123 Main St',
            Amount: 500000,
            StageName: 'Negotiation/Review',
            Homify_Deal_Id__c: 'deal-1'
        }));
    });

    it('should map Deal Status CLOSED to Closed Won', async () => {
        const mockDeal: Deal = {
            id: 'deal-2',
            title: 'Closed Deal',
            price: 100,
            status: DealStatus.CLOSED,
            address: '', city: '', state: '', zip: '', organizationId: '', createdById: '', createdAt: '', updatedAt: ''
        };

        await adapter.syncDeal(mockDeal);

        expect(mockApiSpy).toHaveBeenCalledWith('POST', '/sobjects/Opportunity', expect.objectContaining({
            StageName: 'Closed Won'
        }));
    });
});

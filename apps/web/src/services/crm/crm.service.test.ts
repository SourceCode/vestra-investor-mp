import { CrmService } from './crm.service';
import { SalesforceAdapter } from './salesforce-adapter';
import { Deal, User, ActivityEvent, DealStatus } from '../../types';

// Mock console.log to avoid clutter
const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

describe('CrmService', () => {
    let service: CrmService;

    beforeEach(() => {
        service = new CrmService();
        jest.clearAllMocks();
    });

    afterAll(() => {
        logSpy.mockRestore();
    });

    it('should register Salesforce adapter by default', async () => {
        // Access private property for testing or check side effects
        // Since adapters is private, we verify via side effect (logging)
        const mockContact = { id: 'user-1', email: 'test@example.com' } as User;
        await service.syncContact(mockContact);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[SalesforceAdapter] Synced Contact'));
    });

    it('should delegate syncDeal to all adapters', async () => {
        const mockDeal = { id: 'deal-1', title: 'Test Deal', status: DealStatus.DRAFT } as Deal;
        await service.syncDeal(mockDeal);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[SalesforceAdapter] Synced Deal'));
    });

    it('should delegate syncActivity to all adapters', async () => {
        const mockActivity = { id: 'act-1', type: 'NOTE', propertyId: 'prop-1' } as ActivityEvent;
        await service.syncActivity(mockActivity);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[SalesforceAdapter] Synced Activity'));
    });

    it('should allow registering custom adapters', async () => {
        const customSpy = jest.fn();
        const customAdapter = {
            name: 'Custom',
            isEnabled: true,
            syncContact: customSpy,
            syncDeal: customSpy,
            syncActivity: customSpy
        };

        service.registerAdapter(customAdapter);

        const mockContact = { id: 'user-2' } as User;
        await service.syncContact(mockContact);

        expect(customSpy).toHaveBeenCalledWith(mockContact);
        // Salesforce should still be called
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[SalesforceAdapter] Synced Contact'));
    });
});

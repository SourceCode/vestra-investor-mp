import { AnalyticsService } from './analytics.service';
import { Deal } from '../../db/entities/Deal.entity';
import { AppDataSource } from '../../db/data-source';
import { DealStatus } from '../../types';

// Mock AppDataSource
jest.mock('../../db/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('AnalyticsService', () => {
    let service: AnalyticsService;
    let mockDealRepo: any;

    beforeEach(() => {
        mockDealRepo = {
            find: jest.fn(),
            count: jest.fn()
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockDealRepo);
        service = new AnalyticsService();
    });

    it('should calculate Total Revenue correctly', async () => {
        const mockDeals = [
            { id: '1', status: DealStatus.CLOSED, price: 100000, createdAt: new Date() },
            { id: '2', status: DealStatus.CLOSED, price: 200000, createdAt: new Date() },
            { id: '3', status: DealStatus.DRAFT, price: 500000, createdAt: new Date() } // Should be ignored
        ] as unknown as Deal[];

        mockDealRepo.find.mockResolvedValue(mockDeals);
        mockDealRepo.count.mockResolvedValue(5); // Active deals

        const data = await service.getDashboardData('30d');

        const revenueKpi = data.kpis.find(k => k.label === 'Total Revenue');
        expect(revenueKpi).toBeDefined();
        // 100k + 200k = 300k
        expect(revenueKpi?.value).toBe('$300,000');
    });

    it('should count Closed Deals correctly', async () => {
        const mockDeals = [
            { status: DealStatus.CLOSED },
            { status: DealStatus.CLOSED },
            { status: DealStatus.UNDER_CONTRACT }
        ] as unknown as Deal[];

        mockDealRepo.find.mockResolvedValue(mockDeals);
        mockDealRepo.count.mockResolvedValue(5);

        const data = await service.getDashboardData('30d');
        const closedKpi = data.kpis.find(k => k.label === 'Closed Deals');

        expect(closedKpi?.value).toBe(2);
    });
});

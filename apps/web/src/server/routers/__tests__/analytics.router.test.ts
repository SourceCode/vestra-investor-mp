import { analyticsRouter } from '../analytics.router';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { TimeRange } from '../../../types';

jest.mock('../../../services/analytics/analytics.service');

describe('AnalyticsRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('dashboard', () => {
        it('should call service methods to aggregate dashboard data', async () => {
            const range: TimeRange = '30d';

            const mockResult = {
                kpis: [{ label: 'Revenue', value: 1000 }],
                charts: { main: [], distribution: [] },
                insights: ['Insight 1']
            };

            (AnalyticsService.prototype.getDashboardData as jest.Mock).mockResolvedValue(mockResult);

            const caller = analyticsRouter.createCaller({});
            const result = await caller.dashboard({ timeRange: range });

            expect(AnalyticsService.prototype.getDashboardData).toHaveBeenCalledWith(range);
            expect(result).toEqual(mockResult);
        });
    });
});

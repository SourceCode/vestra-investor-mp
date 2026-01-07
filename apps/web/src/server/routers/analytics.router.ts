import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { TimeRange } from '../../types';

const service = new AnalyticsService();

// Zod schema for TimeRange
const TimeRangeSchema = z.enum(['7d', '30d', '90d', 'all']);

export const analyticsRouter = router({
    dashboard: publicProcedure
        .input(z.object({
            timeRange: TimeRangeSchema
        }))
        .query(async ({ input }) => {
            return service.getDashboardData(input.timeRange as TimeRange);
        })
});

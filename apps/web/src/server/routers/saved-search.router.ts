import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { SavedSearchService } from '../../services/search/saved-search.service';
import { SearchFrequency } from '../../db/entities/SavedSearch.entity';

const service = new SavedSearchService();

export const savedSearchRouter = router({
    create: publicProcedure
        .input(z.object({
            name: z.string(),
            criteria: z.record(z.any()), // flexible JSON
            frequency: z.nativeEnum(SearchFrequency).optional(),
            organizationId: z.string(),
            userId: z.string().uuid()
        }))
        .mutation(async ({ input }) => {
            return await service.create({
                ...input
            });
        }),

    list: publicProcedure
        .input(z.object({
            userId: z.string().uuid()
        }))
        .query(async ({ input }) => {
            return await service.list(input.userId);
        }),

    delete: publicProcedure
        .input(z.object({
            id: z.string(),
            userId: z.string().uuid()
        }))
        .mutation(async ({ input }) => {
            await service.delete(input.id, input.userId);
            return { success: true };
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            userId: z.string().uuid(),
            data: z.object({
                name: z.string().optional(),
                frequency: z.nativeEnum(SearchFrequency).optional(),
                criteria: z.record(z.any()).optional()
            })
        }))
        .mutation(async ({ input }) => {
            return await service.update(input.id, input.userId, input.data);
        })
});

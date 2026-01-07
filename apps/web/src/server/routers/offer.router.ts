import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { OfferService } from '../../services/offers/offer.service';
import { OfferStatus } from '../../types';

const service = new OfferService();

export const offerRouter = router({
    create: publicProcedure
        .input(z.object({
            dealId: z.string().uuid(),
            userId: z.string().uuid(),
            amount: z.number().positive(),
            earnestMoney: z.number().positive(),
            timelineDays: z.number().int().positive(),
            notes: z.string().optional()
        }))
        .mutation(async ({ input }) => {
            return service.createOffer(
                input.dealId,
                input.userId,
                input.amount,
                input.earnestMoney,
                input.timelineDays,
                input.notes
            );
        }),

    byDeal: publicProcedure
        .input(z.object({ dealId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getOffersByDeal(input.dealId);
        }),

    byUser: publicProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getOffersByUser(input.userId);
        }),

    updateStatus: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(OfferStatus)
        }))
        .mutation(async ({ input }) => {
            return service.updateStatus(input.id, input.status);
        }),
});

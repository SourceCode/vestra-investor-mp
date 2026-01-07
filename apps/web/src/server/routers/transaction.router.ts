import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TransactionService } from '../../services/transaction/transaction.service';
import { TransactionStepStatus } from '../../types';

const service = new TransactionService();

export const transactionRouter = router({
    byDeal: publicProcedure
        .input(z.object({ dealId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getStepsByDeal(input.dealId);
        }),

    updateStep: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(TransactionStepStatus)
        }))
        .mutation(async ({ input }) => {
            return service.updateStepStatus(input.id, input.status);
        }),

    closeDeal: publicProcedure
        .input(z.object({
            dealId: z.string()
        }))
        .mutation(async ({ input }) => {
            return service.closeDeal(input.dealId);
        })
});

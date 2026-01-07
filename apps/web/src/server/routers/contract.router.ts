import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { ContractService } from '../../services/contract/contract.service';
import { ContractStatus, ContractType } from '../../types';

const service = new ContractService();

export const contractRouter = router({
    byDeal: publicProcedure
        .input(z.object({ dealId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getContractsByDeal(input.dealId);
        }),

    generate: publicProcedure
        .input(z.object({
            dealId: z.string().uuid(),
            type: z.nativeEnum(ContractType).optional()
        }))
        .mutation(async ({ input }) => {
            return service.generateContract(input.dealId, input.type);
        }),

    updateStatus: publicProcedure
        .input(z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(ContractStatus)
        }))
        .mutation(async ({ input }) => {
            return service.updateStatus(input.id, input.status);
        })
});

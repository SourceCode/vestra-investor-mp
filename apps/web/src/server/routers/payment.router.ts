import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { PaymentService } from '../../services/payments/payment.service';

const service = new PaymentService();

export const paymentRouter = router({
    createIntent: publicProcedure
        .input(z.object({
            offerId: z.string().uuid(),
            amount: z.number().positive(),
            userId: z.string().uuid()
        }))
        .mutation(async ({ input }) => {
            return service.createPaymentIntent(input.offerId, input.amount, input.userId);
        }),

    process: publicProcedure
        .input(z.object({
            paymentId: z.string().uuid()
        }))
        .mutation(async ({ input }) => {
            return service.processPayment(input.paymentId);
        }),

    byOffer: publicProcedure
        .input(z.object({ offerId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getPaymentsByOffer(input.offerId);
        })
});

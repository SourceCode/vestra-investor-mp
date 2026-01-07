import { paymentRouter } from '../payment.router';
import { PaymentService } from '../../../services/payments/payment.service';

jest.mock('../../../services/payments/payment.service');

describe('PaymentRouter', () => {
    const validOfferId = '123e4567-e89b-12d3-a456-426614174000';
    const validUserId = '123e4567-e89b-12d3-a456-426614174001';
    const validPaymentId = '123e4567-e89b-12d3-a456-426614174002';
    const amount = 5000;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createIntent', () => {
        it('should call service.createPaymentIntent', async () => {
            const mockPayment = { id: validPaymentId, amount, status: 'PENDING' };
            (PaymentService.prototype.createPaymentIntent as jest.Mock).mockResolvedValue(mockPayment);

            const caller = paymentRouter.createCaller({});
            const result = await caller.createIntent({ offerId: validOfferId, amount, userId: validUserId });

            expect(PaymentService.prototype.createPaymentIntent).toHaveBeenCalledWith(validOfferId, amount, validUserId);
            expect(result).toEqual(mockPayment);
        });
    });

    describe('process', () => {
        it('should call service.processPayment', async () => {
            const mockProcessed = { id: validPaymentId, status: 'COMPLETED' };
            (PaymentService.prototype.processPayment as jest.Mock).mockResolvedValue(mockProcessed);

            const caller = paymentRouter.createCaller({});
            const result = await caller.process({ paymentId: validPaymentId });

            expect(PaymentService.prototype.processPayment).toHaveBeenCalledWith(validPaymentId);
            expect(result).toEqual(mockProcessed);
        });
    });

    describe('byOffer', () => {
        it('should call service.getPaymentsByOffer', async () => {
            const mockPayments = [{ id: validPaymentId, amount }];
            (PaymentService.prototype.getPaymentsByOffer as jest.Mock).mockResolvedValue(mockPayments);

            const caller = paymentRouter.createCaller({});
            const result = await caller.byOffer({ offerId: validOfferId });

            expect(PaymentService.prototype.getPaymentsByOffer).toHaveBeenCalledWith(validOfferId);
            expect(result).toEqual(mockPayments);
        });
    });
});

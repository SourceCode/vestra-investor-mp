import { AppDataSource } from '../../db/data-source';
import { Payment, PaymentProvider, PaymentStatus } from '../../db/entities/Payment.entity';
import { OfferStatus } from '../../types';
import { Offer } from '../../db/entities/Offer.entity';

export class PaymentService {
    private paymentRepo = AppDataSource.getRepository(Payment);
    private offerRepo = AppDataSource.getRepository(Offer);

    /**
     * Creates a mock payment intent for an accepted offer.
     */
    async createPaymentIntent(
        offerId: string,
        amount: number,
        userId: string
    ): Promise<Payment> {
        const offer = await this.offerRepo.findOneBy({ id: offerId });
        if (!offer) throw new Error('Offer not found');
        if (offer.status !== OfferStatus.ACCEPTED) throw new Error('Offer must be accepted to pay earnest money');

        const payment = this.paymentRepo.create({
            offerId,
            userId,
            amount,
            status: PaymentStatus.PENDING,
            provider: PaymentProvider.MOCK,
            metadata: {
                description: `Earnest Money for Offer #${offerId}`
            }
        });

        return this.paymentRepo.save(payment);
    }

    /**
     * Processes a payment (Mock Implementation).
     * In a real system, this would be a webhook handler or a client-side confirm.
     */
    async processPayment(paymentId: string): Promise<Payment> {
        const payment = await this.paymentRepo.findOneBy({ id: paymentId });
        if (!payment) throw new Error('Payment not found');

        if (payment.status === PaymentStatus.COMPLETED) return payment;

        // Mock Processing Success
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionId = `mock_tx_${Date.now()}`;

        await this.paymentRepo.save(payment);

        // Update Offer / Deal Status if needed
        // For now, we just track the payment. 
        // Real implementation might trigger "Under Contract" workflow.

        return payment;
    }

    async getPaymentsByOffer(offerId: string): Promise<Payment[]> {
        return this.paymentRepo.findBy({ offerId });
    }
}

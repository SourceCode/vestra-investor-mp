import { AppDataSource } from '../../db/data-source';
import { OfferStatus } from '../../types';
import { Offer } from '../../db/entities/Offer.entity';

export class OfferService {
    private offerRepo = AppDataSource.getRepository(Offer);

    /**
     * Creates a new offer for a deal.
     */
    async createOffer(
        dealId: string,
        userId: string,
        amount: number,
        earnestMoney: number,
        timelineDays: number,
        notes?: string
    ): Promise<Offer> {
        // In a real app, might want to check if deal exists and is active
        const offer = this.offerRepo.create({
            dealId,
            userId,
            offerAmount: amount,
            earnestMoney,
            timelineDays,
            notes,
            status: OfferStatus.SUBMITTED
        });
        return this.offerRepo.save(offer);
    }

    /**
     * Lists all offers for a specific deal (For Agents/Sellers).
     */
    async getOffersByDeal(dealId: string): Promise<Offer[]> {
        return this.offerRepo.find({
            where: { dealId },
            order: { createdAt: 'DESC' },
            relations: ['user'] // Include bidder info
        });
    }

    /**
     * Lists all offers made by a specific user (For Investors).
     */
    async getOffersByUser(userId: string): Promise<Offer[]> {
        return this.offerRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            relations: ['deal'] // Include deal info
        });
    }

    /**
     * Updates the status of an offer (Accept, Reject, Counter).
     */
    async updateStatus(id: string, status: OfferStatus): Promise<Offer | null> {
        const offer = await this.offerRepo.findOneBy({ id });
        if (!offer) return null;

        offer.status = status;
        return this.offerRepo.save(offer);
    }
}

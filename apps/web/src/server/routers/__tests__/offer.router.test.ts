
import { offerRouter } from '../offer.router';
import { OfferService } from '../../../services/offers/offer.service';
import { OfferStatus } from '../../../types';

jest.mock('../../../services/offers/offer.service');

describe('OfferRouter', () => {
    let mockService: jest.Mocked<OfferService>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockService = new OfferService() as jest.Mocked<OfferService>;
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const validDealId = '123e4567-e89b-12d3-a456-426614174001';

    describe('create', () => {
        it('should call service.createOffer', async () => {
            const input = {
                dealId: validDealId,
                userId: validUUID,
                amount: 500000,
                earnestMoney: 5000,
                timelineDays: 30,
                notes: 'Test offer'
            };

            const mockOffer = { id: 'offer-1', ...input, status: OfferStatus.SUBMITTED };
            (OfferService.prototype.createOffer as jest.Mock).mockResolvedValue(mockOffer);

            const caller = offerRouter.createCaller({});
            const result = await caller.create(input);

            expect(OfferService.prototype.createOffer).toHaveBeenCalledWith(
                input.dealId,
                input.userId,
                input.amount,
                input.earnestMoney,
                input.timelineDays,
                input.notes
            );
            expect(result).toEqual(mockOffer);
        });
    });

    describe('byDeal', () => {
        it('should call service.getOffersByDeal', async () => {
            const mockOffers = [{ id: 'offer-1' }];
            (OfferService.prototype.getOffersByDeal as jest.Mock).mockResolvedValue(mockOffers);

            const caller = offerRouter.createCaller({});
            const result = await caller.byDeal({ dealId: validDealId });

            expect(OfferService.prototype.getOffersByDeal).toHaveBeenCalledWith(validDealId);
            expect(result).toEqual(mockOffers);
        });
    });

    describe('byUser', () => {
        it('should call service.getOffersByUser', async () => {
            const mockOffers = [{ id: 'offer-1' }];
            (OfferService.prototype.getOffersByUser as jest.Mock).mockResolvedValue(mockOffers);

            const caller = offerRouter.createCaller({});
            const result = await caller.byUser({ userId: validUUID });

            expect(OfferService.prototype.getOffersByUser).toHaveBeenCalledWith(validUUID);
            expect(result).toEqual(mockOffers);
        });
    });

    describe('updateStatus', () => {
        it('should call service.updateStatus', async () => {
            const offerId = validUUID;
            const status = OfferStatus.ACCEPTED;
            const mockUpdated = { id: offerId, status };

            (OfferService.prototype.updateStatus as jest.Mock).mockResolvedValue(mockUpdated);

            const caller = offerRouter.createCaller({});
            const result = await caller.updateStatus({ id: offerId, status });

            expect(OfferService.prototype.updateStatus).toHaveBeenCalledWith(offerId, status);
            expect(result).toEqual(mockUpdated);
        });
    });
});

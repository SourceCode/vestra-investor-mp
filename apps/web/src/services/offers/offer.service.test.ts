import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AppDataSource } from '../../db/data-source';
import { OfferService } from './offer.service';
import { User } from '../../db/entities/User.entity';
import { Deal } from '../../db/entities/Deal.entity';
import { Organization, OrganizationType } from '../../db/entities/Organization.entity';
import { OfferStatus } from '../../types';
import { DealStatus as DealStatusEnum, PropertyType } from '../../types';

describe('OfferService', () => {
    let service: OfferService;
    let testUser: User;
    let testDeal: Deal;
    let testOrg: Organization;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        await AppDataSource.synchronize(true); // Reset DB

        service = new OfferService();

        const userRepo = AppDataSource.getRepository(User);
        const dealRepo = AppDataSource.getRepository(Deal);
        const orgRepo = AppDataSource.getRepository(Organization);

        // Create Org
        testOrg = orgRepo.create({
            name: 'Test Org',
            slug: 'test-org-offer',
            type: OrganizationType.INVESTOR
        });
        await orgRepo.save(testOrg);

        // Create User
        testUser = userRepo.create({
            firstName: 'Bidder',
            lastName: 'One',
            email: 'bidder@test.com',
            passwordHash: 'hash',
        });
        await userRepo.save(testUser);

        // Create Deal
        testDeal = dealRepo.create({
            title: 'Test Deal',
            organizationId: testOrg.id,
            createdById: testUser.id,
            description: 'A great deal',
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zip: '12345',
            price: 100000,
            status: DealStatusEnum.PUBLISHED,
            propertyType: PropertyType.SINGLE_FAMILY,
            beds: 3,
            baths: 2,
            sqft: 1500,
            yearBuilt: 2000
        });
        await dealRepo.save(testDeal);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    it('should create an offer', async () => {
        const offer = await service.createOffer(
            testDeal.id,
            testUser.id,
            95000,
            1000,
            30,
            'Can close fast'
        );

        expect(offer).toBeDefined();
        expect(offer.id).toBeDefined();
        expect(Number(offer.offerAmount)).toBe(95000);
        expect(offer.status).toBe(OfferStatus.SUBMITTED);
    });

    it('should list offers by deal', async () => {
        const offers = await service.getOffersByDeal(testDeal.id);
        expect(offers.length).toBeGreaterThanOrEqual(1);
        expect(offers[0].userId).toBe(testUser.id);
    });

    it('should list offers by user', async () => {
        const offers = await service.getOffersByUser(testUser.id);
        expect(offers.length).toBeGreaterThanOrEqual(1);
        expect(offers[0].dealId).toBe(testDeal.id);
    });

    it('should update offer status', async () => {
        const list = await service.getOffersByDeal(testDeal.id);
        const target = list[0];

        const updated = await service.updateStatus(target.id, OfferStatus.ACCEPTED);
        expect(updated).not.toBeNull();
        expect(updated!.status).toBe(OfferStatus.ACCEPTED);
    });
});

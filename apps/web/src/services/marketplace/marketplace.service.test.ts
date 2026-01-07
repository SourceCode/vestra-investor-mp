import { DataSource } from 'typeorm';
import { AppDataSource } from '../../db/data-source';
import { MarketplaceService } from './marketplace.service';
import { Deal } from '../../db/entities/Deal.entity';
import { Organization, OrganizationType } from '../../db/entities/Organization.entity';
import { User } from '../../db/entities/User.entity';
import { Media, MediaType } from '../../db/entities/Media.entity';
import { PropertyType, DealStatus } from '../../types';
import { randomUUID } from 'crypto';

describe('MarketplaceService', () => {
    let connection: DataSource;
    let service: MarketplaceService;
    let org: Organization;
    let user: User;

    beforeAll(async () => {
        if (AppDataSource.isInitialized) {
            connection = AppDataSource;
        } else {
            connection = await AppDataSource.initialize();
        }
        await connection.synchronize(true); // Reset DB
        service = new MarketplaceService();
    });

    afterAll(async () => {
        if (connection.isInitialized) {
            await connection.destroy();
        }
    });

    beforeEach(async () => {
        await connection.synchronize(true);

        // Seed basic data
        const orgRepo = connection.getRepository(Organization);
        org = orgRepo.create({
            name: 'Test Setup Org',
            slug: 'test-setup-org',
            type: OrganizationType.INVESTOR,
            id: randomUUID(),
            logo: 'https://placehold.co/100x100'
        });
        await orgRepo.save(org);

        const userRepo = connection.getRepository(User);
        user = userRepo.create({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            id: randomUUID()
        });
        await userRepo.save(user);
    });

    it('should return only PUBLISHED deals', async () => {
        const dealRepo = connection.getRepository(Deal);

        // Created PUBLISHED deal
        const publishedDeal = dealRepo.create({
            title: 'Published Home',
            address: '123 Published St',
            price: 500000,
            status: DealStatus.PUBLISHED,
            organization: org,
            createdBy: user,
            beds: 3,
            baths: 2,
            sqft: 2000,
            yearBuilt: 2000,
            propertyType: PropertyType.SINGLE_FAMILY
        });
        await dealRepo.save(publishedDeal);

        // Create DRAFT deal
        const draftDeal = dealRepo.create({
            title: 'Draft Home',
            address: '456 Draft Ave',
            price: 300000,
            status: DealStatus.DRAFT,
            organization: org,
            createdBy: user
        });
        await dealRepo.save(draftDeal);

        const listings = await service.getListings();

        expect(listings).toHaveLength(1);
        expect(listings[0].id).toBe(publishedDeal.id);
        expect(listings[0].status).toBe('PUBLISHED');
    });

    it('should correctly map Deal entity to Property interface', async () => {
        const dealRepo = connection.getRepository(Deal);
        const mediaRepo = connection.getRepository(Media);

        const deal = dealRepo.create({
            title: 'Luxury Condo',
            address: '789 Ocean Dr',
            city: 'Miami',
            state: 'FL',
            zip: '33101',
            price: 1200000,
            status: DealStatus.PUBLISHED,
            organization: org,
            createdBy: user,
            beds: 2,
            baths: 2.5,
            sqft: 1500,
            yearBuilt: 2018,
            propertyType: PropertyType.MULTI_FAMILY, // Closest map for condo/mf used for test
            description: 'Beautiful view'
        });
        await dealRepo.save(deal);

        // Create media
        const media = mediaRepo.create({
            entityType: MediaType.DEAL,
            entityId: deal.id,
            filename: 'ocean-view.jpg',
            path: '/uploads/ocean-view.jpg',
            mimeType: 'image/jpeg',
            size: 1024,
            uploaderId: user.id
        });
        await mediaRepo.save(media);

        const listings = await service.getListings();
        const listing = listings[0];

        expect(listing.price).toBe(1200000);
        expect(listing.beds).toBe(2);
        expect(listing.baths).toBe(2.5);
        expect(listing.sqft).toBe(1500);
        expect(listing.yearBuilt).toBe(2018);
        expect(listing.type).toBe(PropertyType.MULTI_FAMILY);
        expect(listing.image).toContain('ocean-view.jpg');
        expect(listing.images).toHaveLength(1);
    });
});

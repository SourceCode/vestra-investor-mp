import { InvestorService } from './investor.service';
import { AppDataSource } from '../../db/data-source';
import { User } from '../../db/entities/User.entity';
import { InvestorProfile, InvestorStatus } from '../../db/entities/InvestorProfile.entity';

describe('InvestorService', () => {
    let service: InvestorService;
    let userRepo = AppDataSource.getRepository(User);
    let profileRepo = AppDataSource.getRepository(InvestorProfile);
    let testUser: User;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) await AppDataSource.initialize();
        service = new InvestorService();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    beforeEach(async () => {
        // clear dependencies first to avoid FK constraint errors
        await AppDataSource.query('TRUNCATE "investor_profiles", "users" CASCADE');

        testUser = userRepo.create({
            email: 'investor-test@example.com',
            firstName: 'Test',
            lastName: 'Investor',
            isActive: true
        });
        await userRepo.save(testUser);
    });

    it('should create an investor profile for a user', async () => {
        const profile = await service.createProfile(testUser.id, {
            investmentPreferences: {
                locations: ['NY'],
                minBudget: 100000,
                maxBudget: 500000,
                propertyTypes: ['SFH']
            }
        });

        expect(profile).toBeDefined();
        expect(profile.userId).toBe(testUser.id);
        expect(profile.status).toBe(InvestorStatus.PENDING);
        expect(profile.investmentPreferences.locations).toContain('NY');
    });

    it('should retrieve an existing profile', async () => {
        await service.createProfile(testUser.id);
        const profile = await service.getProfile(testUser.id);
        expect(profile).toBeDefined();
        expect(profile!.userId).toBe(testUser.id);
    });

    it('should update a profile', async () => {
        await service.createProfile(testUser.id);

        const updated = await service.updateProfile(testUser.id, {
            status: InvestorStatus.APPROVED,
            totalOffersMade: 5
        });

        expect(updated.status).toBe(InvestorStatus.APPROVED);
        expect(updated.totalOffersMade).toBe(5);

        const fetched = await service.getProfile(testUser.id);
        expect(fetched!.status).toBe(InvestorStatus.APPROVED);
    });
});

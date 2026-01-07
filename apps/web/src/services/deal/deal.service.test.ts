import { DataSource } from 'typeorm';
import { AppDataSource } from '../../db/data-source';
import { Deal } from '../../db/entities/Deal.entity';
import { Organization, OrganizationType } from '../../db/entities/Organization.entity';
import { User } from '../../db/entities/User.entity';
import { Role } from '../../db/entities/Role.entity';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';
import { DealStatus } from '../../types';
import { randomUUID } from 'crypto';
import { DealService } from './deal.service';

describe('DealService', () => {
    let connection: DataSource;
    let dealService: DealService;
    let user: User;
    let org: Organization;
    let role: Role;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
        dealService = new DealService();
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        // Use synchronize(true) to drop tables and recreate schema
        // This ensures a clean state without FK constraint issues from TRUNCATE
        await connection.synchronize(true);

        const userRepo = connection.getRepository(User);
        const orgRepo = connection.getRepository(Organization);
        const roleRepo = connection.getRepository(Role);
        const memberRepo = connection.getRepository(OrganizationMember);

        // Create Role
        role = roleRepo.create({
            name: 'Agent',
            permissions: []
        });
        await roleRepo.save(role);

        // Create Org
        org = orgRepo.create({
            name: 'Test Org',
            slug: 'test-org-deal',
            type: OrganizationType.RE_AGENT
        });
        await orgRepo.save(org);

        // Create User
        user = userRepo.create({
            email: 'test@example.com',
            passwordHash: 'hash',
            firstName: 'Test',
            lastName: 'User'
        });
        await userRepo.save(user);

        // Create membership
        await memberRepo.save({
            user: user,
            organization: org,
            role: role
        });
    });

    it('should create a deal', async () => {
        const dealData = {
            title: '123 Main St',
            address: '123 Main St',
            city: 'Test City',
            price: 500000
        };

        const deal = await dealService.createDeal(org.id, dealData, user.id);

        expect(deal).toBeDefined();
        expect(deal.id).toBeDefined();
        expect(deal.title).toBe('123 Main St');
        expect(deal.status).toBe(DealStatus.DRAFT);
        expect(deal.organizationId).toBe(org.id);
        expect(deal.createdById).toBe(user.id);
    });

    it('should get organization deals', async () => {
        await dealService.createDeal(org.id, { title: 'Deal 1', address: 'Addr 1' }, user.id);
        await dealService.createDeal(org.id, { title: 'Deal 2', address: 'Addr 2' }, user.id);

        const deals = await dealService.getOrganizationDeals(org.id);
        expect(deals.length).toBe(2);
        expect(deals[0].title).toBe('Deal 2');
    });

    it('should update a deal', async () => {
        const deal = await dealService.createDeal(org.id, { title: 'Old Title', address: 'Addr' }, user.id);

        const updated = await dealService.updateDeal(deal.id, { title: 'New Title' }, org.id);
        expect(updated).not.toBeNull();
        expect(updated!.title).toBe('New Title');

        const fetched = await dealService.getDealById(deal.id);
        expect(fetched!.title).toBe('New Title');
    });

    it('should update deal status', async () => {
        const deal = await dealService.createDeal(org.id, { title: 'Deal', address: 'Addr' }, user.id);

        const updated = await dealService.updateDealStatus(deal.id, DealStatus.PUBLISHED, org.id);
        expect(updated!.status).toBe(DealStatus.PUBLISHED);
    });

    it('should prevent updates across organizations', async () => {
        const otherOrg = await connection.getRepository(Organization).save({
            name: 'Other Org',
            slug: 'other',
            type: OrganizationType.RE_AGENT
        });
        const deal = await dealService.createDeal(org.id, { title: 'Org 1 Deal', address: 'Addr' }, user.id);

        const result = await dealService.updateDeal(deal.id, { title: 'Hacked' }, otherOrg.id);
        expect(result).toBeNull();

        const fetched = await dealService.getDealById(deal.id);
        expect(fetched!.title).toBe('Org 1 Deal');
    });
});

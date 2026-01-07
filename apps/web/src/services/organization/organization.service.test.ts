import { OrganizationService } from './organization.service';
import { AppDataSource } from '../../db/data-source';
import { User } from '../../db/entities/User.entity';
import { Role } from '../../db/entities/Role.entity';
import { Organization } from '../../db/entities/Organization.entity';
import { OrganizationType } from '../../db/entities/Organization.entity';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';

describe('OrganizationService', () => {
    let service: OrganizationService;
    let userRepo: any;
    let roleRepo: any;
    let orgRepo: any;
    let memberRepo: any;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        service = new OrganizationService();
        userRepo = AppDataSource.getRepository(User);
        roleRepo = AppDataSource.getRepository(Role);
        orgRepo = AppDataSource.getRepository(Organization);
        memberRepo = AppDataSource.getRepository(OrganizationMember);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        await AppDataSource.query('TRUNCATE TABLE users, roles, organizations, organization_members CASCADE');

        // Seed Roles
        await roleRepo.save([
            { name: 'OrgOwner', description: 'Owner' },
            { name: 'OrgAdmin', description: 'Admin' },
            { name: 'OrgMember', description: 'Member' }
        ]);
    });

    const createTestUser = async (email: string) => {
        return userRepo.save({
            email,
            password: 'password',
            firstName: 'Test',
            lastName: 'User'
        });
    };

    it('should create an organization with an owner', async () => {
        const user = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, user);

        expect(org).toBeDefined();
        expect(org.name).toBe('Test Org');

        const members = await service.getOrganizationMembers(org.id);
        expect(members).toHaveLength(1);
        expect(members[0].userId).toBe(user.id);
        expect(members[0].role.name).toBe('OrgOwner');
    });

    it('should add a member to an organization', async () => {
        const owner = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, owner);

        const newUser = await createTestUser('member@test.com');
        const memberRole = await roleRepo.findOneBy({ name: 'OrgMember' });

        await service.addMember(org.id, newUser.id, memberRole.id);

        const members = await service.getOrganizationMembers(org.id);
        expect(members).toHaveLength(2);
        const addedMember = members.find(m => m.userId === newUser.id);
        expect(addedMember).toBeDefined();
        expect(addedMember?.role.name).toBe('OrgMember');
    });

    it('should remove a member from an organization', async () => {
        const owner = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, owner);

        const newUser = await createTestUser('member@test.com');
        const memberRole = await roleRepo.findOneBy({ name: 'OrgMember' });
        await service.addMember(org.id, newUser.id, memberRole.id);

        await service.removeMember(org.id, newUser.id);

        const members = await service.getOrganizationMembers(org.id);
        expect(members).toHaveLength(1);
        expect(members[0].userId).toBe(owner.id);
    });

    it('should prevent removing the last owner', async () => {
        const owner = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, owner);

        await expect(service.removeMember(org.id, owner.id))
            .rejects
            .toThrow('Cannot remove the last owner of the organization');
    });

    it('should update a member role', async () => {
        const owner = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, owner);

        const newUser = await createTestUser('member@test.com');
        const memberRole = await roleRepo.findOneBy({ name: 'OrgMember' });
        await service.addMember(org.id, newUser.id, memberRole.id);

        const adminRole = await roleRepo.findOneBy({ name: 'OrgAdmin' });
        await service.updateMemberRole(org.id, newUser.id, adminRole.id);

        const members = await service.getOrganizationMembers(org.id);
        const updatedMember = members.find(m => m.userId === newUser.id);
        expect(updatedMember?.role.name).toBe('OrgAdmin');
    });

    it('should update organization details', async () => {
        const owner = await createTestUser('owner@test.com');
        const org = await service.createOrganization('Test Org', OrganizationType.WHOLESALER, owner);

        await service.updateOrganization(org.id, { name: 'Updated Org', settings: { theme: 'dark' } });

        const updatedOrg = await service.getOrganizationById(org.id);
        expect(updatedOrg?.name).toBe('Updated Org');
        expect(updatedOrg?.settings).toEqual({ theme: 'dark' });
    });
});

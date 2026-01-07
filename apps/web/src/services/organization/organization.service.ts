import { AppDataSource } from '../../db/data-source';
import { Organization, OrganizationType } from '../../db/entities/Organization.entity';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';
import { User } from '../../db/entities/User.entity';
import { Role } from '../../db/entities/Role.entity';

export class OrganizationService {
    private orgRepo = AppDataSource.getRepository(Organization);
    private memberRepo = AppDataSource.getRepository(OrganizationMember);
    private roleRepo = AppDataSource.getRepository(Role);

    async createOrganization(name: string, type: OrganizationType, owner: User): Promise<Organization> {
        // Generate a simple slug (ensure uniqueness logic is more robust in prod)
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(7);

        const org = this.orgRepo.create({
            name,
            slug,
            type
        });

        await this.orgRepo.save(org);

        // Find OrgOwner Role
        const ownerRole = await this.roleRepo.findOneBy({ name: 'OrgOwner' });
        if (!ownerRole) {
            throw new Error('System Error: OrgOwner role not found. Please run seeders.');
        }

        const membership = this.memberRepo.create({
            userId: owner.id,
            organizationId: org.id,
            role: ownerRole // Assign Role entity
        });

        await this.memberRepo.save(membership);

        return org;
    }

    async getUserOrganizations(userId: string): Promise<Organization[]> {
        const memberships = await this.memberRepo.find({
            where: { userId },
            relations: ['organization']
        });
        return memberships.map(m => m.organization);
    }

    async getOrganizationById(orgId: string): Promise<Organization | null> {
        return this.orgRepo.findOne({
            where: { id: orgId },
            relations: ['members']
        });
    }

    async updateOrganization(orgId: string, data: Partial<Organization>): Promise<Organization> {
        const org = await this.orgRepo.findOneBy({ id: orgId });
        if (!org) throw new Error('Organization not found');

        Object.assign(org, data);
        return this.orgRepo.save(org);
    }

    async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
        return this.memberRepo.find({
            where: { organizationId: orgId },
            relations: ['user', 'role']
        });
    }

    async addMember(orgId: string, userId: string, roleId: string): Promise<OrganizationMember> {
        const existing = await this.memberRepo.findOneBy({ organizationId: orgId, userId });
        if (existing) throw new Error('User is already a member of this organization');

        const role = await this.roleRepo.findOneBy({ id: roleId });
        if (!role) throw new Error('Role not found');

        const member = this.memberRepo.create({
            organizationId: orgId,
            userId,
            role
        });

        return this.memberRepo.save(member);
    }

    async removeMember(orgId: string, userId: string): Promise<void> {
        const member = await this.memberRepo.findOne({
            where: { organizationId: orgId, userId },
            relations: ['role']
        });

        if (!member) throw new Error('Member not found');

        // Protect against removing the last owner
        if (member.role?.name === 'OrgOwner') {
            const ownerCount = await this.memberRepo.count({
                where: {
                    organizationId: orgId,
                    role: { name: 'OrgOwner' }
                },
                relations: ['role']
            });

            if (ownerCount <= 1) {
                throw new Error('Cannot remove the last owner of the organization');
            }
        }

        await this.memberRepo.remove(member);
    }

    async updateMemberRole(orgId: string, userId: string, roleId: string): Promise<OrganizationMember> {
        const member = await this.memberRepo.findOne({
            where: { organizationId: orgId, userId }
        });

        if (!member) throw new Error('Member not found');

        const role = await this.roleRepo.findOneBy({ id: roleId });
        if (!role) throw new Error('Role not found');

        member.role = role;
        return this.memberRepo.save(member);
    }
}

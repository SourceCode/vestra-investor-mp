import { AppDataSource } from '../../db/data-source';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';
import { RolePermission } from '../../db/entities/RolePermission.entity';
import { Role } from '../../db/entities/Role.entity';

export class RbacService {
    private memberRepo = AppDataSource.getRepository(OrganizationMember);
    private roleRepo = AppDataSource.getRepository(Role);
    private rolePermRepo = AppDataSource.getRepository(RolePermission);

    async hasPermission(userId: string, organizationId: string, action: string): Promise<boolean> {
        // 1. Find User's Role in Org
        const membership = await this.memberRepo.findOne({
            where: { userId, organizationId },
            relations: ['role']
        });

        if (!membership || !membership.role) {
            return false;
        }

        // 2. Check if Role has Permission
        // This is a simple check; in prod cache this or use a more optimized query
        const rolePermission = await this.rolePermRepo.findOne({
            where: {
                roleId: membership.role.id,
                permission: { action }
            },
            relations: ['permission']
        });

        return !!rolePermission;
    }

    async assignRole(userId: string, organizationId: string, roleName: string): Promise<void> {
        const role = await this.roleRepo.findOneBy({ name: roleName });
        if (!role) throw new Error(`Role ${roleName} not found`);

        const membership = await this.memberRepo.findOneBy({ userId, organizationId });
        if (!membership) throw new Error('User is not a member of this organization');

        membership.role = role;
        await this.memberRepo.save(membership);
    }
}

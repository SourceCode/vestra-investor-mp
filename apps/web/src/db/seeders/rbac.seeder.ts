import { AppDataSource } from '../../db/data-source';
import { Role } from '../../db/entities/Role.entity';
import { Permission } from '../../db/entities/Permission.entity';
import { RolePermission } from '../../db/entities/RolePermission.entity';

export const seedRBAC = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);
    const rolePermissionRepo = AppDataSource.getRepository(RolePermission);

    // 1. Define Standard Roles
    const roles = [
        { name: 'OrgOwner', description: 'Owner of the organization with full access' },
        { name: 'OrgAdmin', description: 'Administrator with management access' },
        { name: 'AcquisitionAgent', description: 'Agent focused on acquiring deals' },
        { name: 'DispositionAgent', description: 'Agent focused on selling deals' },
        { name: 'Investor', description: 'External investor with read-only access to specific deals' }
    ];

    for (const r of roles) {
        await roleRepo.upsert(r, ['name']);
    }

    // 2. Define Example Permissions
    const permissions = [
        'org:update',
        'org:invite',
        'deal:create',
        'deal:read',
        'deal:update',
        'deal:delete',
        'marketing:campaign:create'
    ];

    for (const p of permissions) {
        await permissionRepo.upsert({ action: p, description: `Permission to ${p}` }, ['action']);
    }

    // 3. Assign Permissions to Roles (Simplified for now)
    const ownerRole = await roleRepo.findOneBy({ name: 'OrgOwner' });
    if (ownerRole) {
        // Owner gets all permissions
        const allPermissions = await permissionRepo.find();
        for (const p of allPermissions) {
            const hasPerm = await rolePermissionRepo.findOneBy({
                role: { id: ownerRole.id },
                permission: { id: p.id }
            });

            if (!hasPerm) {
                await rolePermissionRepo.save(rolePermissionRepo.create({ role: ownerRole, permission: p }));
            }
        }
    }

    // TODO: Assign other role permissions specifics
};

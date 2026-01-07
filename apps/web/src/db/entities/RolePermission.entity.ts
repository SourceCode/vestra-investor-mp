import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from './Role.entity';
import { Permission } from './Permission.entity';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
    @Column({ type: 'uuid', name: 'role_id' })
    roleId: string;

    @Column({ type: 'uuid', name: 'permission_id' })
    permissionId: string;

    @ManyToOne(() => Role, role => role.permissions)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Permission, permission => permission.roles)
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;
}

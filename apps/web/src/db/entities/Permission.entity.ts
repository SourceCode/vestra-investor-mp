import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { RolePermission } from './RolePermission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    action: string; // e.g. 'deal:create'

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => RolePermission, rp => rp.permission)
    roles: RolePermission[];
}

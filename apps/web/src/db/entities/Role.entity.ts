import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { RolePermission } from './RolePermission.entity';
import { OrganizationMember } from './OrganizationMember.entity';

@Entity('roles')
export class Role extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => RolePermission, rp => rp.role)
    permissions: RolePermission[];

    @OneToMany(() => OrganizationMember, om => om.role)
    members: OrganizationMember[];
}

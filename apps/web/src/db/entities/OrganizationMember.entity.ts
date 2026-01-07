import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Organization } from './Organization.entity';
import { Role } from './Role.entity';

@Entity('organization_members')
export class OrganizationMember extends BaseEntity {
    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'organization_id' })
    organizationId: string;

    @Column({ type: 'uuid', name: 'role_id', nullable: true })
    roleId: string;

    @ManyToOne(() => User, user => user.memberships)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Organization, org => org.members)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @ManyToOne(() => Role, role => role.members)
    @JoinColumn({ name: 'role_id' })
    role: Role;
}

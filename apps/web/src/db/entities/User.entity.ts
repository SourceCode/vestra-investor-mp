import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { OrganizationMember } from './OrganizationMember.entity';
import { InvestorProfile } from './InvestorProfile.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ type: 'varchar', name: 'email', unique: true })
    email: string;

    @Column({ type: 'varchar', name: 'password_hash', nullable: true })
    passwordHash: string;

    @Column({ type: 'varchar', name: 'first_name', nullable: true })
    firstName: string;

    @Column({ type: 'varchar', name: 'last_name', nullable: true })
    lastName: string;

    @Column({ type: 'boolean', name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => OrganizationMember, member => member.user)
    memberships: OrganizationMember[];

    @OneToOne(() => InvestorProfile, profile => profile.user)
    investorProfile: InvestorProfile;
}

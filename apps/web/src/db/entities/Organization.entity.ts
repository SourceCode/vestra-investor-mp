import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { OrganizationMember } from './OrganizationMember.entity';

export enum OrganizationType {
    WHOLESALER = 'WHOLESALER',
    LENDER = 'LENDER',
    TITLE = 'TITLE',
    INSURANCE = 'INSURANCE',
    RE_AGENT = 'RE_AGENT',
    INVESTOR = 'INVESTOR'
}

@Entity('organizations')
export class Organization extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'varchar', unique: true })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    logo: string;

    @Column({ type: 'varchar', enum: OrganizationType })
    type: OrganizationType;

    @Column({ type: 'jsonb', default: {} })
    settings: Record<string, any>;

    @OneToMany(() => OrganizationMember, member => member.organization)
    members: OrganizationMember[];
}

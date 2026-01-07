import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Organization } from './Organization.entity';
import { User } from './User.entity';

import { PropertyType, DealStatus } from '../../types';

@Entity('deals')
export class Deal extends BaseEntity {
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'varchar' })
    address: string;

    @Column({ type: 'varchar', nullable: true })
    city: string;

    @Column({ type: 'varchar', nullable: true })
    state: string;

    @Column({ type: 'varchar', nullable: true })
    zip: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    price: number;

    // Property Specs
    @Column({ type: 'int', nullable: true })
    beds: number;

    @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
    baths: number;

    @Column({ type: 'int', nullable: true })
    sqft: number;

    @Column({ name: 'year_built', type: 'int', nullable: true })
    yearBuilt: number;

    @Column({
        name: 'property_type',
        type: 'varchar',
        nullable: true,
        enum: PropertyType
    })
    propertyType: PropertyType;

    @Column({
        type: 'varchar',
        default: DealStatus.DRAFT
    })
    status: DealStatus;

    @Column({ name: 'organization_id', type: 'uuid' })
    organizationId: string;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ name: 'created_by_id', type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;
}

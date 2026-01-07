import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User.entity';
import { Organization } from './Organization.entity';

export enum SearchFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    INSTANT = 'INSTANT',
    NEVER = 'NEVER'
}

@Entity('saved_searches')
export class SavedSearch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    name: string;

    @Column({ type: 'jsonb' })
    criteria: {
        text?: string;
        priceMin?: number;
        priceMax?: number;
        beds?: number;
        baths?: number;
        propertyTypes?: string[];
        location?: string;
    };

    @Column({
        type: 'enum',
        enum: SearchFrequency,
        default: SearchFrequency.NEVER
    })
    frequency: SearchFrequency;

    @Column({ type: 'timestamp', nullable: true })
    lastRunAt: Date;

    @Column('uuid')
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('uuid')
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

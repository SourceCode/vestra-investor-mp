import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User.entity';

export enum InvestorStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum AccreditationStatus {
    ACCREDITED = 'ACCREDITED',
    NON_ACCREDITED = 'NON_ACCREDITED',
    UNKNOWN = 'UNKNOWN'
}

@Entity('investor_profiles')
export class InvestorProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: InvestorStatus,
        default: InvestorStatus.PENDING
    })
    status: InvestorStatus;

    @Column({
        type: 'enum',
        enum: AccreditationStatus,
        default: AccreditationStatus.UNKNOWN
    })
    accreditationStatus: AccreditationStatus;

    @Column('simple-json', { nullable: true })
    investmentPreferences: {
        locations: string[];
        minBudget: number;
        maxBudget: number;
        propertyTypes: string[];
    };

    @Column({ type: 'int', default: 0 })
    totalOffersMade: number;

    @Column({ type: 'int', default: 0 })
    dealsViewed: number;

    @OneToOne(() => User, user => user.investorProfile)
    @JoinColumn()
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

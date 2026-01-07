import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Deal } from './Deal.entity';

import { OfferStatus } from '../../types';

@Entity('offers')
export class Offer extends BaseEntity {
    @Column({ type: 'uuid', name: 'deal_id' })
    dealId: string;

    @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deal_id' })
    deal: Deal;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 12, scale: 2, name: 'offer_amount' })
    offerAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, name: 'earnest_money' })
    earnestMoney: number;

    @Column({ type: 'int', name: 'timeline_days' })
    timelineDays: number;

    @Column({
        type: 'varchar',
        length: 20,
        default: OfferStatus.SUBMITTED
    })
    status: OfferStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;
}

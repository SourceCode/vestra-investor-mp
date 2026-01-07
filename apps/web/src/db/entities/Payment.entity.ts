import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import { Offer } from './Offer.entity';

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export enum PaymentProvider {
    STRIPE = 'STRIPE',
    MOCK = 'MOCK'
}

@Entity('payments')
export class Payment extends BaseEntity {
    @Column({ type: 'uuid', name: 'offer_id' })
    offerId: string;

    @ManyToOne(() => Offer)
    @JoinColumn({ name: 'offer_id' })
    offer: Offer;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'varchar',
        length: 20,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({
        type: 'varchar',
        length: 20,
        default: PaymentProvider.MOCK
    })
    provider: PaymentProvider;

    @Column({ type: 'varchar', name: 'transaction_id', nullable: true })
    transactionId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
}

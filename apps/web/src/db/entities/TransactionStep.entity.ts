import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Deal } from './Deal.entity';
import { TransactionRole, TransactionStepStatus } from '../../types';

@Entity('transaction_steps')
export class TransactionStep extends BaseEntity {
    @Column({ type: 'uuid', name: 'deal_id' })
    dealId: string;

    @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deal_id' })
    deal: Deal;

    @Column({ type: 'varchar', length: 255 })
    label: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({
        type: 'varchar',
        length: 20,
        default: TransactionStepStatus.PENDING
    })
    status: TransactionStepStatus;

    @Column({
        type: 'varchar',
        length: 20,
        name: 'assigned_to',
        default: TransactionRole.AGENT
    })
    assignedTo: TransactionRole;

    @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
    completedAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;
}

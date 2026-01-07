import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Deal } from './Deal.entity';
import { ContractStatus, ContractType } from '../../types';

@Entity('contracts')
export class Contract extends BaseEntity {
    @Column({ type: 'uuid', name: 'deal_id' })
    dealId: string;

    @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deal_id' })
    deal: Deal;

    @Column({
        type: 'varchar',
        length: 50,
        default: ContractType.PURCHASE_AGREEMENT
    })
    type: ContractType;

    @Column({
        type: 'varchar',
        length: 20,
        default: ContractStatus.DRAFT
    })
    status: ContractStatus;

    @Column({ type: 'text', nullable: true })
    content: string; // Mock URL or text content

    @Column({ type: 'timestamp', name: 'generated_at', nullable: true })
    generatedAt: Date;

    @Column({ type: 'timestamp', name: 'signed_at', nullable: true })
    signedAt: Date;
}

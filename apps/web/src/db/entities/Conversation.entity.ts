import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Deal } from './Deal.entity';
import { ConversationParticipant } from './ConversationParticipant.entity';
import { Message } from './Message.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
    @Column({ name: 'deal_id', type: 'uuid', nullable: true })
    dealId: string | null;

    @Column({ type: 'varchar', nullable: true })
    title: string;

    @ManyToOne(() => Deal, { nullable: true })
    @JoinColumn({ name: 'deal_id' })
    deal: Deal | null;

    @OneToMany(() => ConversationParticipant, (participant) => participant.conversation)
    participants: ConversationParticipant[];

    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];
}

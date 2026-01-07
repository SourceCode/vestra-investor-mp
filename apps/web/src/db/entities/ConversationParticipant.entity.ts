import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Conversation } from './Conversation.entity';
import { User } from './User.entity';

@Entity('conversation_participants')
export class ConversationParticipant extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    conversationId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
    lastReadAt: Date | null;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

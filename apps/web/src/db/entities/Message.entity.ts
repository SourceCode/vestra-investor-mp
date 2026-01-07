import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Conversation } from './Conversation.entity';
import { User } from './User.entity';

@Entity('messages')
export class Message extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    conversationId: string;

    @Column({ name: 'sender_id', type: 'uuid' })
    senderId: string;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender: User;
}

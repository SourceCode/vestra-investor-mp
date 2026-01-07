import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';
import type { NotificationType } from '../../types';

@Entity('notifications')
export class Notification extends BaseEntity {
    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'varchar',
        length: 50
    })
    type: NotificationType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    body: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    link: string;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;
}

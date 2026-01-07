import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User.entity';

export enum MediaType {
    DEAL = 'DEAL',
    USER_AVATAR = 'USER_AVATAR',
    ORG_LOGO = 'ORG_LOGO'
}

@Entity('media')
export class Media extends BaseEntity {
    @Column({ type: 'varchar' })
    filename: string;

    @Column({ type: 'varchar' })
    path: string;

    @Column({ type: 'varchar', name: 'mime_type' })
    mimeType: string;

    @Column({ type: 'int' })
    size: number;

    @Column({
        type: 'varchar',
        name: 'entity_type',
        enum: MediaType
    })
    entityType: MediaType;

    @Column({ type: 'uuid', name: 'entity_id' })
    entityId: string;

    @Column({ name: 'uploader_id', type: 'uuid' })
    uploaderId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploader_id' })
    uploader: User;
}

import { AppDataSource } from '../../db/data-source';
import { Notification } from '../../db/entities/Notification.entity';
import { NotificationType } from '../../types';

export class NotificationService {
    private notificationRepo = AppDataSource.getRepository(Notification);

    /**
     * Creates a new notification for a user.
     */
    async create(
        userId: string,
        type: NotificationType,
        title: string,
        body: string,
        link?: string
    ): Promise<Notification> {
        const notification = this.notificationRepo.create({
            userId,
            type,
            title,
            body,
            link
        });
        return this.notificationRepo.save(notification);
    }

    /**
     * Lists all notifications for a user, ordered by creation date (newest first).
     */
    async listByUser(userId: string): Promise<Notification[]> {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Gets the count of unread notifications for a user.
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepo.count({
            where: { userId, isRead: false }
        });
    }

    /**
     * Marks a specific notification as read.
     */
    async markAsRead(id: string): Promise<void> {
        await this.notificationRepo.update(id, { isRead: true });
    }

    /**
     * Marks all notifications for a user as read.
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    }
}

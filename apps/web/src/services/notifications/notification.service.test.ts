import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AppDataSource } from '../../db/data-source';
import { NotificationService } from './notification.service';
import { User } from '../../db/entities/User.entity';
import { NotificationType } from '../../types';

describe('NotificationService', () => {
    let service: NotificationService;
    let testUser: User;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        await AppDataSource.synchronize(true); // Reset DB

        service = new NotificationService();

        // Create test user
        const userRepo = AppDataSource.getRepository(User);
        testUser = userRepo.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test.notification@test.com',
            passwordHash: 'hash', // Assuming this field exists or is optional/handled
        });
        await userRepo.save(testUser);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    it('should create a notification', async () => {
        const notification = await service.create(
            testUser.id,
            'MESSAGE' as NotificationType,
            'New Message',
            'You have a new message'
        );

        expect(notification).toBeDefined();
        expect(notification.id).toBeDefined();
        expect(notification.type).toBe('MESSAGE');
        expect(notification.userId).toBe(testUser.id);
        expect(notification.isRead).toBe(false);
    });

    it('should list notifications for a user', async () => {
        await service.create(testUser.id, 'DEAL_STATUS' as NotificationType, 'Deal Update', 'Status changed');

        const notifications = await service.listByUser(testUser.id);
        expect(notifications.length).toBeGreaterThanOrEqual(2); // MESSAGE + DEAL_STATUS
        expect(notifications[0].title).toBe('Deal Update'); // Descending order
    });

    it('should count unread notifications', async () => {
        const count = await service.getUnreadCount(testUser.id);
        expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should mark a notification as read', async () => {
        const list = await service.listByUser(testUser.id);
        const target = list[0];

        await service.markAsRead(target.id);

        const updated = await AppDataSource.getRepository('Notification').findOneBy({ id: target.id }) as any;
        expect(updated.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
        await service.markAllAsRead(testUser.id);
        const count = await service.getUnreadCount(testUser.id);
        expect(count).toBe(0);
    });
});

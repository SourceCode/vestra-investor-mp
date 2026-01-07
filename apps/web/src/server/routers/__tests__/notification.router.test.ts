import { notificationRouter } from '../notification.router';
import { NotificationService } from '../../../services/notifications/notification.service';
import { z } from 'zod';

jest.mock('../../../services/notifications/notification.service');

describe('NotificationRouter', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174000';
    const validNotifId = '123e4567-e89b-12d3-a456-426614174001';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should call service.listByUser', async () => {
            const mockList = [{ id: validNotifId, title: 'Alert' }];
            (NotificationService.prototype.listByUser as jest.Mock).mockResolvedValue(mockList);

            const caller = notificationRouter.createCaller({});
            const result = await caller.list({ userId: validUserId });

            expect(NotificationService.prototype.listByUser).toHaveBeenCalledWith(validUserId);
            expect(result).toEqual(mockList);
        });
    });

    describe('unreadCount', () => {
        it('should call service.getUnreadCount', async () => {
            const mockCount = 5;
            (NotificationService.prototype.getUnreadCount as jest.Mock).mockResolvedValue(mockCount);

            const caller = notificationRouter.createCaller({});
            const result = await caller.unreadCount({ userId: validUserId });

            expect(NotificationService.prototype.getUnreadCount).toHaveBeenCalledWith(validUserId);
            expect(result).toEqual(mockCount);
        });
    });

    describe('markRead', () => {
        it('should call service.markAsRead', async () => {
            (NotificationService.prototype.markAsRead as jest.Mock).mockResolvedValue(true);

            const caller = notificationRouter.createCaller({});
            const result = await caller.markRead({ id: validNotifId });

            expect(NotificationService.prototype.markAsRead).toHaveBeenCalledWith(validNotifId);
            expect(result).toBe(true);
        });
    });

    describe('markAllRead', () => {
        it('should call service.markAllAsRead', async () => {
            (NotificationService.prototype.markAllAsRead as jest.Mock).mockResolvedValue(true);

            const caller = notificationRouter.createCaller({});
            const result = await caller.markAllRead({ userId: validUserId });

            expect(NotificationService.prototype.markAllAsRead).toHaveBeenCalledWith(validUserId);
            expect(result).toBe(true);
        });
    });
});

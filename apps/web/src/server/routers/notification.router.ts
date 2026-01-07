import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { NotificationService } from '../../services/notifications/notification.service';
import { NotificationType } from '../../types';

const service = new NotificationService();

// Validation schema for creating a notification (internal use mainly, but good to have)
const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    type: z.enum(['ACCESS_APPROVED', 'BID_ALERT', 'DEAL_STATUS', 'MESSAGE', 'OFFER_STATUS']),
    title: z.string(),
    body: z.string(),
    link: z.string().optional()
});

export const notificationRouter = router({
    list: publicProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.listByUser(input.userId);
        }),

    unreadCount: publicProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input }) => {
            return service.getUnreadCount(input.userId);
        }),

    markRead: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
            return service.markAsRead(input.id);
        }),

    markAllRead: publicProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .mutation(async ({ input }) => {
            return service.markAllAsRead(input.userId);
        }),
});

import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { MessagingService } from '../../services/messaging/messaging.service';

export const messagingRouter = router({
    createConversation: publicProcedure
        .input(z.object({
            dealId: z.string().nullable(),
            participantIds: z.array(z.string()),
            title: z.string().optional()
        }))
        .mutation(async ({ input }) => {
            return await MessagingService.createConversation(input.dealId, input.participantIds, input.title);
        }),

    sendMessage: publicProcedure
        .input(z.object({
            conversationId: z.string(),
            senderId: z.string(),
            content: z.string()
        }))
        .mutation(async ({ input }) => {
            return await MessagingService.sendMessage(input.conversationId, input.senderId, input.content);
        }),

    getConversations: publicProcedure
        .input(z.object({
            userId: z.string()
        }))
        .query(async ({ input }) => {
            return await MessagingService.getConversations(input.userId);
        }),

    getMessages: publicProcedure
        .input(z.object({
            conversationId: z.string()
        }))
        .query(async ({ input }) => {
            return await MessagingService.getMessages(input.conversationId);
        }),
});

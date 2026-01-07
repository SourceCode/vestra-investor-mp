import { messagingRouter } from '../messaging.router';
import { MessagingService } from '../../../services/messaging/messaging.service';

jest.mock('../../../services/messaging/messaging.service');

describe('MessagingRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createConversation', () => {
        it('should call service.createConversation', async () => {
            const input = {
                dealId: 'deal-123',
                participantIds: ['user-1', 'user-2'],
                title: 'New Chat'
            };
            const mockResult = { id: 'conv-123', ...input };
            (MessagingService.createConversation as jest.Mock).mockResolvedValue(mockResult);

            const caller = messagingRouter.createCaller({});
            const result = await caller.createConversation(input);

            expect(MessagingService.createConversation).toHaveBeenCalledWith(input.dealId, input.participantIds, input.title);
            expect(result).toEqual(mockResult);
        });
    });

    describe('sendMessage', () => {
        it('should call service.sendMessage', async () => {
            const input = {
                conversationId: 'conv-123',
                senderId: 'user-1',
                content: 'Hello'
            };
            const mockMessage = { id: 'msg-1', ...input, createdAt: new Date() };
            (MessagingService.sendMessage as jest.Mock).mockResolvedValue(mockMessage);

            const caller = messagingRouter.createCaller({});
            const result = await caller.sendMessage(input);

            expect(MessagingService.sendMessage).toHaveBeenCalledWith(input.conversationId, input.senderId, input.content);
            expect(result).toEqual(mockMessage);
        });
    });

    describe('getConversations', () => {
        it('should call service.getConversations', async () => {
            const userId = 'user-1';
            const mockConversations = [{ id: 'conv-1', title: 'Chat 1' }];
            (MessagingService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

            const caller = messagingRouter.createCaller({});
            const result = await caller.getConversations({ userId });

            expect(MessagingService.getConversations).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockConversations);
        });
    });

    describe('getMessages', () => {
        it('should call service.getMessages', async () => {
            const conversationId = 'conv-123';
            const mockMessages = [{ id: 'msg-1', content: 'Hi' }];
            (MessagingService.getMessages as jest.Mock).mockResolvedValue(mockMessages);

            const caller = messagingRouter.createCaller({});
            const result = await caller.getMessages({ conversationId });

            expect(MessagingService.getMessages).toHaveBeenCalledWith(conversationId);
            expect(result).toEqual(mockMessages);
        });
    });
});

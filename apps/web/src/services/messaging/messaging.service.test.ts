import { AppDataSource } from '../../db/data-source';
import { MessagingService } from './messaging.service';
import { Conversation } from '../../db/entities/Conversation.entity';
import { ConversationParticipant } from '../../db/entities/ConversationParticipant.entity';
import { Message } from '../../db/entities/Message.entity';
import { User } from '../../db/entities/User.entity';
import { Deal } from '../../db/entities/Deal.entity';
import { randomUUID } from 'crypto';

describe('MessagingService', () => {
    let conversationRepo: any;
    let participantRepo: any;
    let messageRepo: any;
    let userRepo: any;
    let dealRepo: any;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        await AppDataSource.synchronize(true);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        // Clear tables
        await AppDataSource.query('DELETE FROM messages');
        await AppDataSource.query('DELETE FROM conversation_participants');
        await AppDataSource.query('DELETE FROM conversations');
        await AppDataSource.query('DELETE FROM deals');
        await AppDataSource.query('DELETE FROM users');

        // Setup repositories
        conversationRepo = AppDataSource.getRepository(Conversation);
        participantRepo = AppDataSource.getRepository(ConversationParticipant);
        messageRepo = AppDataSource.getRepository(Message);
        userRepo = AppDataSource.getRepository(User);
        dealRepo = AppDataSource.getRepository(Deal);
    });

    it('should create a conversation and return it', async () => {
        const u1Id = randomUUID();
        const u2Id = randomUUID();

        // Create users
        const u1 = userRepo.create({ id: u1Id, email: 'u1@test.com', firstName: 'U', lastName: 'one' });
        const u2 = userRepo.create({ id: u2Id, email: 'u2@test.com', firstName: 'U', lastName: 'two' });
        await userRepo.save([u1, u2]);

        const conversation = await MessagingService.createConversation(null, [u1Id, u2Id], 'Test Convo');

        expect(conversation).toBeDefined();
        expect(conversation.title).toBe('Test Convo');
        expect(conversation.id).toBeDefined();

        const participants = await participantRepo.find({ where: { conversationId: conversation.id } });
        expect(participants).toHaveLength(2);
        const userIds = participants.map((p: any) => p.userId);
        expect(userIds).toContain(u1Id);
        expect(userIds).toContain(u2Id);
    });

    it('should send a message', async () => {
        const u1Id = randomUUID();
        // Create users and conversation
        const u1 = userRepo.create({ id: u1Id, email: 'u1m@test.com' });
        await userRepo.save(u1);
        const conv = await MessagingService.createConversation(null, [u1Id], 'Msg Test');

        const message = await MessagingService.sendMessage(conv.id, u1Id, 'Hello World');

        expect(message).toBeDefined();
        expect(message.content).toBe('Hello World');
        expect(message.senderId).toBe(u1Id);
        expect(message.conversationId).toBe(conv.id);

        const stored = await messageRepo.findOne({ where: { id: message.id } });
        expect(stored).toBeDefined();
        expect(stored.content).toBe('Hello World');
    });

    it('should retrieve conversations for a user', async () => {
        const uGetId = randomUUID();
        // Create users
        const user = userRepo.create({ id: uGetId, email: 'get@test.com' });
        await userRepo.save(user);

        // Create 2 conversations
        await MessagingService.createConversation(null, [uGetId], 'C1');
        await MessagingService.createConversation(null, [uGetId], 'C2');

        const convs = await MessagingService.getConversations(uGetId);
        expect(convs).toHaveLength(2);
    });

    it('should retrieve messages for a conversation', async () => {
        const uMsgsId = randomUUID();
        const user = userRepo.create({ id: uMsgsId, email: 'msg@test.com' });
        await userRepo.save(user);
        const conv = await MessagingService.createConversation(null, [uMsgsId], 'Msgs');

        await MessagingService.sendMessage(conv.id, uMsgsId, 'M1');
        await MessagingService.sendMessage(conv.id, uMsgsId, 'M2');

        const messages = await MessagingService.getMessages(conv.id);
        expect(messages).toHaveLength(2);
        expect(messages[0].content).toBe('M1');
        expect(messages[1].content).toBe('M2');
    });
});

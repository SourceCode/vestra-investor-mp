import { AppDataSource } from '../../db/data-source';
import { Conversation } from '../../db/entities/Conversation.entity';
import { ConversationParticipant } from '../../db/entities/ConversationParticipant.entity';
import { Message } from '../../db/entities/Message.entity';
import { User } from '../../db/entities/User.entity';
import { EntityManager, In } from 'typeorm';

export class MessagingService {
    static async createConversation(dealId: string | null, participantIds: string[], title?: string): Promise<Conversation> {
        const conversationRepo = AppDataSource.getRepository(Conversation);
        const participantRepo = AppDataSource.getRepository(ConversationParticipant);

        // Transaction to create conversation and participants
        return await AppDataSource.manager.transaction(async (entityManager: EntityManager) => {
            const conversation = entityManager.create(Conversation, {
                dealId,
                title,
            });
            const savedConversation = await entityManager.save(conversation);

            const participants = participantIds.map(userId =>
                entityManager.create(ConversationParticipant, {
                    conversationId: savedConversation.id,
                    userId,
                })
            );
            await entityManager.save(participants);

            return savedConversation;
        });
    }

    static async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
        const messageRepo = AppDataSource.getRepository(Message);

        const message = messageRepo.create({
            conversationId,
            senderId,
            content,
        });

        return await messageRepo.save(message);
    }

    static async getConversations(userId: string): Promise<Conversation[]> {
        const conversationRepo = AppDataSource.getRepository(Conversation);

        // Find conversations where user is a participant
        return await conversationRepo.find({
            where: {
                participants: {
                    userId,
                }
            },
            relations: ['participants', 'participants.user', 'deal', 'messages'],
            order: {
                updatedAt: 'DESC'
            }
        });
    }

    static async getMessages(conversationId: string): Promise<Message[]> {
        const messageRepo = AppDataSource.getRepository(Message);

        return await messageRepo.find({
            where: { conversationId },
            relations: ['sender'],
            order: {
                createdAt: 'ASC'
            }
        });
    }

    static async markAsRead(conversationId: string, userId: string): Promise<void> {
        const participantRepo = AppDataSource.getRepository(ConversationParticipant);
        await participantRepo.update(
            { conversationId, userId },
            { lastReadAt: new Date() }
        );
    }
}

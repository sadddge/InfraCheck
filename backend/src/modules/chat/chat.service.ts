import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppException } from 'src/common/exceptions/app.exception';
import { databaseError, messageCreationFailed, messageNotFound, messageUpdateFailed } from 'src/common/helpers/exception.helper';
import { Message } from 'src/database/entities/message.entity';
import { Equal, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';

/**
 * Service handling chat business logic and database operations
 * Manages message creation, retrieval, and pinning functionality
 */
@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    ) { }

    /**
     * Retrieves messages with cursor-based pagination and sender information
     * Results are sorted chronologically (oldest first) after database query
     */
    async findAll(limit = 20, before?: Date): Promise<MessageDto[]> {
        try {
            const qb = this.messageRepository.createQueryBuilder('message')
                .leftJoin('message.sender', 'sender')
                .addSelect(['sender.name', 'sender.lastName'])
                .orderBy('message.createdAt', 'DESC')
                .limit(limit);

            if (before) {
                qb.where('message.createdAt < :before', { before });
            }

            const messages = await qb.getMany();
            messages.reverse();

            this.logger.log(`Retrieved ${messages.length} messages with limit ${limit}`);

            return messages.map(message => this.toMessageDto(message));
        } catch (error) {
            this.logger.error(`Failed to retrieve messages: ${error.message}`, error.stack);
            databaseError({ serviceName: 'ChatService' });
        }
    }

    /**
     * Creates a new message and associates it with the sender
     * Fetches complete message data including sender information after creation
     */
    async createMessage(senderId: number, dto: CreateMessageDto): Promise<MessageDto> {
        try {
            const message = this.messageRepository.create({
                content: dto.content,
                sender: { id: senderId }
            });

            this.logger.log(`Creating message from user ${senderId}: ${dto.content.substring(0, 50)}...`);

            const savedMessage = await this.messageRepository.save(message);

            const messageWithSender = await this.messageRepository.findOne({
                where: { id: savedMessage.id },
                relations: ['sender'],
            });

            if (!messageWithSender) {
                this.logger.error(`Message not found after saving with ID: ${savedMessage.id}`);
                messageCreationFailed({
                    messageId: savedMessage.id.toString(),
                    attemptedAction: 'create'
                });
            }

            this.logger.log(`Message created successfully with ID: ${savedMessage.id}`);

            return this.toMessageDto(messageWithSender);
        } catch (error) {
            if (error instanceof AppException) {
                throw error;
            }

            this.logger.error(`Failed to create message: ${error.message}`, error.stack);
            messageCreationFailed({
                userId: senderId.toString(),
                attemptedAction: 'create',
                messageContent: dto.content.substring(0, 50)
            });
        }
    }

    /**
     * Updates message pin status (admin feature)
     * @throws AppException when message doesn't exist or update fails
     */
    async pinMessage(messageId: number, pinned: boolean): Promise<MessageDto> {
        try {
            const message = await this.messageRepository.findOne({
                where: { id: Equal(messageId) },
                relations: ['sender']
            });

            if (!message) {
                this.logger.warn(`Attempted to pin/unpin non-existent message with ID: ${messageId}`);
                messageNotFound({
                    messageId: messageId.toString(),
                    attemptedAction: 'pin'
                });
            }

            const previousPinStatus = message.pinned;
            message.pinned = pinned;

            await this.messageRepository.save(message);

            this.logger.log(
                `Message ${messageId} pin status changed from ${previousPinStatus} to ${pinned}`
            );

            return this.toMessageDto(message);
        } catch (error) {
            if (error instanceof AppException) {
                throw error;
            }

            this.logger.error(`Failed to update message pin status: ${error.message}`, error.stack);
            messageUpdateFailed({
                messageId: messageId.toString(),
                attemptedAction: 'pin'
            });
        }
    }

    private toMessageDto(message: Message): MessageDto {
        return {
            id: message.id,
            content: message.content,
            authorName: message.sender.name,
            authorLastName: message.sender.lastName,
            pinned: message.pinned,
            createdAt: message.createdAt,
        };
    }
}

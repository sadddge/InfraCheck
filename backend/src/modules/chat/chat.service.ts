import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/database/entities/message.entity';
import { Equal, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    constructor(
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    ) { }

    async findAll(limit = 20, before?: Date): Promise<MessageDto[]> {
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
        this.logger.log(`Fetched ${messages.length} messages with limit ${limit} and before date ${before ? before.toISOString() : 'none'}`);
        this.logger.log(`Messages: ${JSON.stringify(messages)}`);
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            authorName: message.sender.name,
            authorLastName: message.sender.lastName,
            pinned: message.pinned,
            createdAt: message.createdAt,
        }));
    }

    async createMessage(senderId: number, dto: CreateMessageDto): Promise<MessageDto> {
        const message = this.messageRepository.create({
            content: dto.content,
            sender: { id: senderId }
        });
        this.logger.log(`Creating message from user ${senderId}: ${dto.content}`);
        const savedMessage = await this.messageRepository.save(message);
        const messageWithSender = await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender'],
        });
        if (!messageWithSender) {
            throw new Error('Message not found after saving');
        }
        this.logger.log(`Message created with ID ${savedMessage.id}`);
        this.logger.log(`Message fetch: ${JSON.stringify(messageWithSender)}`);
        return {
            id: messageWithSender.id,
            content: messageWithSender.content,
            authorName: messageWithSender.sender.name,
            authorLastName: messageWithSender.sender.lastName,
            pinned: messageWithSender.pinned,
            createdAt: messageWithSender.createdAt,
        };
    }

    async pinMessage(messageId: number, pinned: boolean): Promise<MessageDto> {
        const message = await this.messageRepository.findOne({ where: { id: Equal(messageId) }, relations: ['sender'] });
        if (!message) {
            throw new Error('Message not found');
        }
        message.pinned = pinned;
        await this.messageRepository.save(message);
        return {
            id: message.id,
            content: message.content,
            authorName: message.sender.name,
            authorLastName: message.sender.lastName,
            createdAt: message.createdAt,
            pinned: message.pinned,
        };
    }
}

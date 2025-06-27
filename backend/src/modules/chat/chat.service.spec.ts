import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    createMockMessage,
    createMockUser,
    expectChatErrorAsync,
    expectServerErrorAsync
} from 'src/common/test-helpers';
import { Message } from 'src/database/entities/message.entity';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

describe('ChatService', () => {
    let service: ChatService;
    let messageRepository: jest.Mocked<Repository<Message>>;

    const mockUser = createMockUser({
        id: 1,
        name: 'Test User',
        lastName: 'Test Last',
        phoneNumber: '+1234567890',
    });

    const mockMessage = createMockMessage({
        id: 1,
        content: 'Test message content',
        sender: mockUser,
        pinned: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
    });

    const mockCreateMessageDto: CreateMessageDto = {
        content: 'New test message',
    };

    beforeEach(async () => {
        const mockMessageRepository = {
            createQueryBuilder: jest.fn().mockReturnValue({
                leftJoin: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getMany: jest.fn(),
            }),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockMessageRepository,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        messageRepository = module.get(getRepositoryToken(Message));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all messages with pagination', async () => {
            // Arrange
            const messages = [mockMessage, { ...mockMessage, id: 2, content: 'Second message' }];
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockResolvedValue([...messages].reverse());

            // Act
            const result = await service.findAll(20);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[0].content).toBe('Test message content');
            expect(result[0].authorName).toBe('Test User');
            expect(result[0].authorLastName).toBe('Test Last');
            expect(result[1].id).toBe(2);
            expect(result[1].content).toBe('Second message');
        });

        it('should return messages with date filter when before parameter is provided', async () => {
            // Arrange
            const beforeDate = new Date('2024-01-02T10:00:00Z');
            const messages = [mockMessage];
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockResolvedValue(messages);

            // Act
            await service.findAll(20, beforeDate);

            // Assert
            expect(queryBuilder.where).toHaveBeenCalledWith('message.createdAt < :before', { before: beforeDate });
            expect(queryBuilder.getMany).toHaveBeenCalled();
        });

        it('should handle database errors and throw databaseError', async () => {
            // Arrange
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

            // Act & Assert
            await expect(service.findAll()).rejects.toThrow(expectServerErrorAsync.databaseError());
        });

        it('should return empty array when no messages found', async () => {
            // Arrange
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await service.findAll(20);

            // Assert
            expect(result).toEqual([]);
        });

        it('should apply default limit of 20 messages', async () => {
            // Arrange
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);

            // Act
            await service.findAll();

            // Assert
            expect(queryBuilder.limit).toHaveBeenCalledWith(20);
        });

        it('should apply custom limit when provided', async () => {
            // Arrange
            const customLimit = 50;
            const queryBuilder = messageRepository.createQueryBuilder();
            (queryBuilder.getMany as jest.Mock).mockResolvedValue([]);

            // Act
            await service.findAll(customLimit);

            // Assert
            expect(queryBuilder.limit).toHaveBeenCalledWith(customLimit);
        });
    });

    describe('createMessage', () => {
        it('should create a message successfully', async () => {
            // Arrange
            const senderId = 1;
            const createdMessage = { ...mockMessage, id: 1 };
            const savedMessage = { ...createdMessage, sender: mockUser };

            messageRepository.create.mockReturnValue(createdMessage);
            messageRepository.save.mockResolvedValue(createdMessage);
            messageRepository.findOne.mockResolvedValue(savedMessage);

            // Act
            const result = await service.createMessage(senderId, mockCreateMessageDto);

            // Assert
            expect(messageRepository.create).toHaveBeenCalledWith({
                content: mockCreateMessageDto.content,
                sender: { id: senderId },
            });
            expect(messageRepository.save).toHaveBeenCalledWith(createdMessage);
            expect(messageRepository.findOne).toHaveBeenCalledWith({
                where: { id: createdMessage.id },
                relations: ['sender'],
            });
            expect(result).toEqual({
                id: savedMessage.id,
                content: savedMessage.content,
                authorName: savedMessage.sender.name,
                authorLastName: savedMessage.sender.lastName,
                pinned: savedMessage.pinned,
                createdAt: savedMessage.createdAt,
            });
        });

        it('should throw messageCreationFailed when message is not found after saving', async () => {
            // Arrange
            const senderId = 1;
            const createdMessage = { ...mockMessage, id: 1 };

            messageRepository.create.mockReturnValue(createdMessage);
            messageRepository.save.mockResolvedValue(createdMessage);
            messageRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.createMessage(senderId, mockCreateMessageDto))
                .rejects.toThrow(expectChatErrorAsync.messageCreationFailed());
        });

        it('should handle database errors during message creation', async () => {
            // Arrange
            const senderId = 1;
            messageRepository.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            // Act & Assert
            await expect(service.createMessage(senderId, mockCreateMessageDto))
                .rejects.toThrow(expectChatErrorAsync.messageCreationFailed());
        });

        it('should handle database errors during message save', async () => {
            // Arrange
            const senderId = 1;
            const createdMessage = { ...mockMessage, id: 1 };

            messageRepository.create.mockReturnValue(createdMessage);
            messageRepository.save.mockRejectedValue(new Error('Save failed'));

            // Act & Assert
            await expect(service.createMessage(senderId, mockCreateMessageDto))
                .rejects.toThrow(expectChatErrorAsync.messageCreationFailed());
        });

        it('should re-throw AppException errors without modification', async () => {
            // Arrange
            const senderId = 1;
            const createdMessage = { ...mockMessage, id: 1 };

            messageRepository.create.mockReturnValue(createdMessage);
            messageRepository.save.mockResolvedValue(createdMessage);
            messageRepository.findOne.mockResolvedValue(null); // This will trigger messageCreationFailed

            // Act & Assert
            await expect(service.createMessage(senderId, mockCreateMessageDto))
                .rejects.toThrow(expectChatErrorAsync.messageCreationFailed());
        });
    });

    describe('pinMessage', () => {
        it('should pin a message successfully', async () => {
            // Arrange
            const messageId = 1;
            const pinned = true;
            const messageToUpdate = { ...mockMessage, pinned: false };
            const updatedMessage = { ...messageToUpdate, pinned: true };

            messageRepository.findOne.mockResolvedValue(messageToUpdate);
            messageRepository.save.mockResolvedValue(updatedMessage);

            // Act
            const result = await service.pinMessage(messageId, pinned);

            // Assert
            expect(messageRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.objectContaining({ _value: messageId }) },
                relations: ['sender'],
            });
            expect(messageRepository.save).toHaveBeenCalledWith({
                ...messageToUpdate,
                pinned: true,
            });
            expect(result).toEqual({
                id: updatedMessage.id,
                content: updatedMessage.content,
                authorName: updatedMessage.sender.name,
                authorLastName: updatedMessage.sender.lastName,
                createdAt: updatedMessage.createdAt,
                pinned: updatedMessage.pinned,
            });
        });

        it('should unpin a message successfully', async () => {
            // Arrange
            const messageId = 1;
            const pinned = false;
            const messageToUpdate = { ...mockMessage, pinned: true };
            const updatedMessage = { ...messageToUpdate, pinned: false };

            messageRepository.findOne.mockResolvedValue(messageToUpdate);
            messageRepository.save.mockResolvedValue(updatedMessage);

            // Act
            const result = await service.pinMessage(messageId, pinned);

            // Assert
            expect(messageRepository.save).toHaveBeenCalledWith({
                ...messageToUpdate,
                pinned: false,
            });
            expect(result.pinned).toBe(false);
        });

        it('should throw messageNotFound when message does not exist', async () => {
            // Arrange
            const messageId = 999;
            const pinned = true;

            messageRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.pinMessage(messageId, pinned))
                .rejects.toThrow(expectChatErrorAsync.messageNotFound());
        });

        it('should handle database errors during message update', async () => {
            // Arrange
            const messageId = 1;
            const pinned = true;
            const messageToUpdate = { ...mockMessage, pinned: false };

            messageRepository.findOne.mockResolvedValue(messageToUpdate);
            messageRepository.save.mockRejectedValue(new Error('Update failed'));

            // Act & Assert
            await expect(service.pinMessage(messageId, pinned))
                .rejects.toThrow(expectChatErrorAsync.messageUpdateFailed());
        });

        it('should handle database errors during message retrieval', async () => {
            // Arrange
            const messageId = 1;
            const pinned = true;

            messageRepository.findOne.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(service.pinMessage(messageId, pinned))
                .rejects.toThrow(expectChatErrorAsync.messageUpdateFailed());
        });

        it('should re-throw AppException errors without modification', async () => {
            // Arrange
            const messageId = 999;
            const pinned = true;

            messageRepository.findOne.mockResolvedValue(null); // This will trigger messageNotFound

            // Act & Assert
            await expect(service.pinMessage(messageId, pinned))
                .rejects.toThrow(expectChatErrorAsync.messageNotFound());
        });
    });
});

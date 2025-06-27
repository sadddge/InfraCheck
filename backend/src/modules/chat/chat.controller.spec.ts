import { Test, TestingModule } from '@nestjs/testing';

import { 
    createMockMessage, 
    createMockUser
} from 'src/common/test-helpers';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';

describe('ChatController', () => {
    let controller: ChatController;
    let chatService: jest.Mocked<ChatService>;

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

    const mockMessageDto: MessageDto = {
        id: mockMessage.id,
        content: mockMessage.content,
        authorName: mockUser.name,
        authorLastName: mockUser.lastName,
        pinned: mockMessage.pinned,
        createdAt: mockMessage.createdAt,
    };

    const mockChatService = {
        findAll: jest.fn(),
        createMessage: jest.fn(),
        pinMessage: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [
                {
                    provide: ChatService,
                    useValue: mockChatService,
                },
            ],
        }).compile();

        controller = module.get<ChatController>(ChatController);
        chatService = module.get(ChatService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getMessages', () => {
        it('should return messages with default limit when no parameters provided', async () => {
            // Arrange
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages();

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should return messages with custom limit when limit parameter provided', async () => {
            // Arrange
            const customLimit = '50';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(customLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(50, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should return messages with date filter when before parameter provided', async () => {
            // Arrange
            const beforeParam = '2024-01-02T10:00:00.000Z';
            const expectedDate = new Date(beforeParam);
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(undefined, beforeParam);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, expectedDate);
            expect(result).toEqual(expectedMessages);
        });

        it('should return messages with both limit and before parameters', async () => {
            // Arrange
            const limitParam = '30';
            const beforeParam = '2024-01-02T10:00:00.000Z';
            const expectedDate = new Date(beforeParam);
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(limitParam, beforeParam);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(30, expectedDate);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle invalid limit parameter and use default', async () => {
            // Arrange
            const invalidLimit = 'not-a-number';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(invalidLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle invalid before parameter gracefully', async () => {
            // Arrange
            const invalidBefore = 'invalid-date';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(undefined, invalidBefore);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should return empty array when no messages found', async () => {
            // Arrange
            chatService.findAll.mockResolvedValue([]);

            // Act
            const result = await controller.getMessages();

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual([]);
        });

        it('should return multiple messages in correct order', async () => {
            // Arrange
            const message2 = { ...mockMessageDto, id: 2, content: 'Second message' };
            const expectedMessages = [mockMessageDto, message2];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages();

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual(expectedMessages);
            expect(result).toHaveLength(2);
        });

        it('should propagate service errors to caller', async () => {
            // Arrange
            const error = new Error('Database error');
            chatService.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.getMessages())
                .rejects.toThrow('Database error');
        });

        it('should handle zero limit parameter', async () => {
            // Arrange
            const zeroLimit = '0';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(zeroLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(0, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle negative limit parameter', async () => {
            // Arrange
            const negativeLimit = '-5';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(negativeLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(-5, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle large limit parameter', async () => {
            // Arrange
            const largeLimit = '1000';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(largeLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(1000, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle empty string parameters', async () => {
            // Arrange
            const emptyLimit = '';
            const emptyBefore = '';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(emptyLimit, emptyBefore);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle decimal limit parameter by converting to integer', async () => {
            // Arrange
            const decimalLimit = '25.7';
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(decimalLimit);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(25, undefined);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle valid ISO date string for before parameter', async () => {
            // Arrange
            const isoDate = '2024-06-25T15:30:45.123Z';
            const expectedDate = new Date(isoDate);
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(undefined, isoDate);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, expectedDate);
            expect(result).toEqual(expectedMessages);
        });

        it('should handle date string without timezone for before parameter', async () => {
            // Arrange
            const dateString = '2024-06-25T15:30:45';
            const expectedDate = new Date(dateString);
            const expectedMessages = [mockMessageDto];
            chatService.findAll.mockResolvedValue(expectedMessages);

            // Act
            const result = await controller.getMessages(undefined, dateString);

            // Assert
            expect(chatService.findAll).toHaveBeenCalledWith(20, expectedDate);
            expect(result).toEqual(expectedMessages);
        });
    });
});

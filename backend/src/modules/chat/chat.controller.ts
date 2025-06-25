import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';

/**
 * REST API controller for chat message operations
 * Provides HTTP endpoints for retrieving chat history with pagination
 */
@ApiTags('Chat')
@Controller({
    path: 'chat',
    version: '1',
})
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    /**
     * Retrieves chat message history with cursor-based pagination
     * Messages are returned in chronological order (oldest first)
     */
    @Get()
    @ApiOperation({ summary: 'Get chat message history' })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of messages to return',
        example: '20'
    })
    @ApiQuery({
        name: 'before',
        required: false,
        description: 'Get messages created before this timestamp (ISO string)',
        example: '2025-06-25T10:00:00.000Z'
    })
    @ApiResponse({
        status: 200,
        description: 'Chat messages retrieved successfully',
        type: [MessageDto]
    })
    async getMessages(
        @Query('limit') limit: string,
        @Query('before') before: string
    ): Promise<MessageDto[]> {
        const limitNumber = Number.parseInt(limit, 10) || 20;
        const beforeDate = before ? new Date(before) : undefined;
        return this.chatService.findAll(limitNumber, beforeDate);
    }
}

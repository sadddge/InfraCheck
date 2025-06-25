import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller({
    path: 'chat',
    version: '1',
})
export class ChatController {
    // This controller can be extended with methods to handle HTTP requests related to chat functionality.
    // Currently, it serves as a placeholder for future expansion.
    constructor(private readonly chatService: ChatService) { }

    @Get()
    async getMessages(@Query('limit') limit: string, @Query('before') before: string) {
        const limitNumber = Number.parseInt(limit, 10) || 20; // Default to 20 if not provided
        const beforeDate = before ? new Date(before) : undefined; // Convert to Date if provided
        return this.chatService.findAll(limitNumber, beforeDate);
    }
}

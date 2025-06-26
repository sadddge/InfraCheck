import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for chat messages with populated sender information
 * Used in both REST API responses and WebSocket events
 */
export class MessageDto {
    @ApiProperty({ description: 'Unique message identifier', example: 1 })
    id: number;

    @ApiProperty({ description: 'Message text content', example: 'Hello, how is everyone?' })
    content: string;

    @ApiProperty({ description: 'Sender first name', example: 'John' })
    authorName: string;

    @ApiProperty({ description: 'Sender last name', example: 'Doe' })
    authorLastName: string;

    @ApiProperty({
        description: 'Whether message is pinned (admin feature)',
        example: false,
        required: false
    })
    pinned?: boolean;

    @ApiProperty({
        description: 'Message creation timestamp',
        example: '2025-06-25T10:30:00.000Z'
    })
    createdAt: Date;
}
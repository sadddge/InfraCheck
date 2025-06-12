import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object representing a comment with complete information.
 * Used for API responses and includes creator and report details.
 *
 * @class CommentDto
 * @description Comment response DTO providing:
 * - Comment identification and content
 * - Creator information (user who posted the comment)
 * - Associated report basic information
 * - Timestamp of comment creation
 *
 * @example
 * ```typescript
 * const comment: CommentDto = {
 *   id: 1,
 *   creator: { id: 123, firstName: 'John', lastName: 'Doe' },
 *   report: { id: 456, title: 'Infrastructure Issue' },
 *   content: 'This needs immediate attention!',
 *   createdAt: new Date('2023-01-15T10:30:00Z')
 * };
 * ```
 */
export class CommentDto {
    @ApiProperty({
        description: 'Unique identifier of the comment',
        example: 1,
        type: Number,
    })
    id: number;

    @ApiProperty({
        description: 'Information about the user who created this comment',
        type: 'object',
        properties: {
            id: {
                type: 'number',
                description: 'Unique identifier of the creator',
                example: 123,
            },
            firstName: {
                type: 'string',
                description: 'First name of the creator',
                example: 'John',
            },
            lastName: {
                type: 'string',
                description: 'Last name of the creator',
                example: 'Doe',
            },
        },
    })
    creator: {
        id: number;
        firstName: string;
        lastName: string;
    };

    @ApiProperty({
        description: 'Basic information about the report this comment belongs to',
        type: 'object',
        properties: {
            id: {
                type: 'number',
                description: 'Unique identifier of the report',
                example: 456,
            },
            title: {
                type: 'string',
                description: 'Title of the report',
                example: 'Broken streetlight on Main Street',
            },
        },
    })
    report: {
        id: number;
        title: string;
    };

    @ApiProperty({
        description: 'The actual content/text of the comment',
        example: 'This issue needs immediate attention. I noticed it this morning.',
        type: String,
        maxLength: 1000,
    })
    content: string;

    @ApiProperty({
        description: 'Timestamp when the comment was created',
        example: '2023-01-15T10:30:00.000Z',
        type: Date,
    })
    createdAt: Date;
}

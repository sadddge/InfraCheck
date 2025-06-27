import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new comment.
 * Contains validation rules and API documentation for comment creation requests.
 *
 * @class CreateCommentDto
 * @description Comment creation DTO providing:
 * - Content validation and constraints
 * - API documentation for Swagger
 * - Input sanitization and type safety
 *
 * @example
 * ```typescript
 * const createComment: CreateCommentDto = {
 *   content: 'This infrastructure issue requires immediate attention!'
 * };
 * ```
 */
export class CreateCommentDto {
    @ApiProperty({
        description: 'The content/text of the comment to be created',
        example:
            'This infrastructure issue requires immediate attention. I noticed it this morning during my commute.',
        type: String,
        minLength: 1,
        maxLength: 1000,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Comment content cannot be empty' })
    @MaxLength(1000, { message: 'Comment content cannot exceed 1000 characters' })
    content: string;
}

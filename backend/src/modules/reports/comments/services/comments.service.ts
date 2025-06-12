import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Equal, Repository } from 'typeorm';
import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ICommentsService } from '../interfaces/comments-service.interface';

/**
 * Comment management service providing CRUD operations and comment-related business logic.
 * Handles comment creation, retrieval, and deletion with proper data validation and mapping.
 *
 * Core comment service providing:
 * - Comment retrieval by report with user and report relations
 * - Comment creation with user and report association
 * - Comment deletion with access control support
 * - Entity-to-DTO mapping for API responses
 *
 * @example
 * ```typescript
 * const commentsService = new CommentsService(commentRepository);
 * const comments = await commentsService.findAllByReportId(123);
 * const newComment = await commentsService.createComment(123, 456, { content: 'Great report!' });
 * ```
 */
@Injectable()
export class CommentsService implements ICommentsService {
    /**
     * Creates a new CommentsService instance.
     *
     * @param commentRepository TypeORM repository for Comment entity operations
     */
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) {}

    /**
     * Retrieves all comments for a specific report ordered by creation date (newest first).
     * Includes populated creator and report information for complete context.
     * Returns an empty array if no comments exist for the report.
     *
     * @param reportId Unique identifier of the report to retrieve comments for
     * @returns Array of comment DTOs with creator and report information
     *
     * @example
     * ```typescript
     * const comments = await commentsService.findAllByReportId(123);
     * console.log(`Found ${comments.length} comments`);
     * comments.forEach(comment => {
     *   console.log(`${comment.creator.firstName}: ${comment.content}`);
     * });
     * ```
     */
    async findAllByReportId(reportId: number): Promise<CommentDto[]> {
        const comments = await this.commentRepository.find({
            where: { report: { id: Equal(reportId) } },
            relations: ['creator', 'report'],
            order: { createdAt: 'DESC' },
        });

        return comments.map(comment => this.mapToDto(comment));
    }

    /**
     * Creates a new comment on a specific report by a user.
     * Associates the comment with both the report and the user who created it.
     * Returns the created comment with populated creator and report information.
     *
     * @param reportId Unique identifier of the report to comment on
     * @param userId Unique identifier of the user creating the comment
     * @param dto Comment creation data containing content
     * @returns Created comment DTO with complete information
     *
     * @example
     * ```typescript
     * const newComment = await commentsService.createComment(
     *   123, // reportId
     *   456, // userId
     *   { content: 'This infrastructure issue needs attention!' }
     * );
     * console.log(`Created comment: ${newComment.content}`);
     * ```
     */
    async createComment(
        reportId: number,
        userId: number,
        dto: CreateCommentDto,
    ): Promise<CommentDto> {
        const comment = this.commentRepository.create({
            content: dto.content,
            report: { id: reportId },
            creator: { id: userId },
        });

        const savedComment = await this.commentRepository.save(comment);
        return this.mapToDto(savedComment);
    }

    /**
     * Permanently removes a comment from the system.
     * Performs hard deletion of the comment record from the database.
     * This operation is irreversible and should be used with proper access control.
     *
     * @param commentId Unique identifier of the comment to delete
     * @returns Promise that resolves when deletion is complete
     *
     * @example
     * ```typescript
     * await commentsService.delete(789);
     * console.log('Comment deleted successfully');
     * ```
     */
    async delete(commentId: number): Promise<void> {
        await this.commentRepository.delete({ id: commentId });
    }

    /**
     * Maps a Comment entity to a CommentDto for API responses.
     * Transforms database entity into a structured DTO with creator and report information.
     * Ensures consistent data structure across all comment-related endpoints.
     *
     * @param comment Comment entity from database with populated relations
     * @returns CommentDto with structured creator and report information
     *
     * @example
     * ```typescript
     * // Used internally by public methods
     * const dto = this.mapToDto(commentEntity);
     * // Returns: { id, creator: { id, firstName, lastName }, report: { id, title }, content, createdAt }
     * ```
     */
    private mapToDto(comment: Comment): CommentDto {
        return {
            id: comment.id,
            creator: {
                id: comment.creator.id,
                firstName: comment.creator.name,
                lastName: comment.creator.lastName,
            },
            report: {
                id: comment.report.id,
                title: comment.report.title,
            },
            content: comment.content,
            createdAt: comment.createdAt,
        };
    }
}

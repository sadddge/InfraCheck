import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

/**
 * Service token for dependency injection of comments service.
 * Used with NestJS @Inject decorator to provide ICommentsService implementation.
 */
export const COMMENTS_SERVICE = 'COMMENTS_SERVICE';

/**
 * Interface defining the contract for comment service implementations.
 * Provides comprehensive comment management functionality for report discussions.
 *
 * Comment service interface providing:
 * - Comment retrieval by report ID
 * - Comment creation with user association
 * - Comment deletion with access control
 * - Comment-to-DTO mapping and data transformation
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CommentsService implements ICommentsService {
 *   async findAllByReportId(reportId: number): Promise<CommentDto[]> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface ICommentsService {
    /**
     * Retrieves all comments associated with a specific report.
     * Returns comments ordered by creation date (most recent first) with populated
     * creator and report information for complete context.
     *
     * @param reportId Unique identifier of the report to retrieve comments for
     * @returns Array of comment DTOs with creator and report information
     * @throws {AppException} When report with given ID does not exist (REP001)
     *
     * @example
     * ```typescript
     * const comments = await commentsService.findAllByReportId(123);
     * console.log(`Found ${comments.length} comments for report`);
     * comments.forEach(comment => {
     *   console.log(`${comment.creator.firstName}: ${comment.content}`);
     * });
     * ```
     */
    findAllByReportId(reportId: number): Promise<CommentDto[]>;

    /**
     * Creates a new comment on a specific report by a user.
     * Associates the comment with both the report and the user who created it.
     * Returns the created comment with populated relations.
     *
     * @param reportId Unique identifier of the report to comment on
     * @param userId Unique identifier of the user creating the comment
     * @param dto Comment creation data containing content and metadata
     * @returns Created comment DTO with creator and report information
     * @throws {AppException} When report or user with given IDs do not exist (REP001, USR001)
     * @throws {AppException} When comment content is invalid (VAL001-VAL003)
     *
     * @example
     * ```typescript
     * const newComment = await commentsService.createComment(
     *   123, // reportId
     *   456, // userId
     *   { content: 'This needs immediate attention!' }
     * );
     * console.log(`Comment created: ${newComment.content}`);
     * ```
     */
    createComment(reportId: number, userId: number, dto: CreateCommentDto): Promise<CommentDto>;

    /**
     * Permanently removes a comment from the system.
     * Performs hard deletion of the comment record. Access control should be
     * enforced at the controller level to ensure only authorized users can delete.
     *
     * @param commentId Unique identifier of the comment to delete
     * @returns Promise that resolves when deletion is complete
     * @throws {AppException} When comment with given ID does not exist (REP001)
     *
     * @example
     * ```typescript
     * await commentsService.delete(789);
     * console.log('Comment deleted successfully');
     * ```
     */
    delete(commentId: number): Promise<void>;
}

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserAccessGuard } from 'src/common/guards/user-access.guard';
import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { COMMENTS_SERVICE, ICommentsService } from '../interfaces/comments-service.interface';

/**
 * Comment management controller providing RESTful endpoints for report comment operations.
 * Handles comment retrieval, creation, and deletion with proper authentication and authorization.
 *
 * Exposes comment management endpoints including:
 * - Comment retrieval by report ID
 * - Comment creation on reports
 * - Comment deletion with access control
 * - Integration with report-specific routing
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/reports/:reportId/comments
 * GET /api/v1/reports/123/comments           // Get all comments for report 123
 * POST /api/v1/reports/123/comments          // Create new comment on report 123
 * DELETE /api/v1/reports/123/comments/456    // Delete comment 456
 * ```
 */
@ApiTags('Comments')
@ApiBearerAuth()
@Controller({
    path: 'reports/:reportId/comments',
    version: '1',
})
export class CommentsController {
    /**
     * Creates a new CommentsController instance.
     *
     * @param commentsService Comment service for handling business logic
     */
    constructor(
        @Inject(COMMENTS_SERVICE)
        private readonly commentsService: ICommentsService,
    ) {}

    /**
     * Retrieves all comments for a specific report.
     * Returns comments ordered by creation date (most recent first) with complete
     * creator and report information. Public endpoint accessible to all authenticated users.
     *
     * @param reportId The unique identifier of the report to retrieve comments for
     * @returns Array of comment DTOs with creator and report information
     *
     * @example
     * ```typescript
     * // Get all comments for report 123
     * GET /api/v1/reports/123/comments
     * Authorization: Bearer <token>
     * ```
     */
    @Get()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Retrieve all comments for a report',
        description:
            'This endpoint retrieves all comments associated with a specific report, ordered by creation date (newest first).',
    })
    @ApiParam({
        name: 'reportId',
        description: 'The unique identifier of the report to retrieve comments for.',
        type: Number,
        required: true,
        example: 123,
    })
    @ApiOkResponse({
        description: 'Comments retrieved successfully.',
        type: CommentDto,
        isArray: true,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'Report not found. The report with the specified ID does not exist.',
    })
    async findAllByReportId(@Param('reportId') reportId: number): Promise<CommentDto[]> {
        return await this.commentsService.findAllByReportId(reportId);
    }

    /**
     * Creates a new comment on a specific report.
     * Associates the comment with the authenticated user and the specified report.
     * Requires authentication and valid comment content.
     *
     * @param reportId The unique identifier of the report to comment on
     * @param dto Comment creation data containing the content
     * @param req Request object containing authenticated user information
     * @returns Created comment DTO with complete information
     *
     * @example
     * ```typescript
     * // Create a new comment on report 123
     * POST /api/v1/reports/123/comments
     * Authorization: Bearer <token>
     * Content-Type: application/json
     *
     * {
     *   "content": "This infrastructure issue needs immediate attention!"
     * }
     * ```
     */
    @Post()
    @HttpCode(201)
    @ApiOperation({
        summary: 'Create a new comment on a report',
        description:
            'This endpoint allows authenticated users to create a new comment on a specific report.',
    })
    @ApiParam({
        name: 'reportId',
        description: 'The unique identifier of the report to comment on.',
        type: Number,
        required: true,
        example: 123,
    })
    @ApiCreatedResponse({
        description: 'Comment created successfully.',
        type: CommentDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiNotFoundResponse({
        description: 'Report not found. The report with the specified ID does not exist.',
    })
    async createComment(
        @Param('reportId') reportId: number,
        @Body() dto: CreateCommentDto,
        @Req() req,
    ): Promise<CommentDto> {
        return await this.commentsService.createComment(reportId, req.user.id, dto);
    }

    /**
     * Permanently removes a comment from the system.
     * Only accessible by the comment creator or users with admin privileges.
     * Uses UserAccessGuard to enforce access control rules.
     *
     * @param commentId The unique identifier of the comment to delete
     * @returns Promise that resolves when deletion is complete
     *
     * @example
     * ```typescript
     * // Delete comment 456
     * DELETE /api/v1/reports/123/comments/456
     * Authorization: Bearer <token>
     * ```
     */
    @Delete(':id')
    @HttpCode(204)
    @UseGuards(UserAccessGuard)
    @ApiOperation({
        summary: 'Delete a comment by ID',
        description:
            'This endpoint allows users to delete a comment. Only the comment creator or admins can delete comments.',
    })
    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the comment to delete.',
        type: Number,
        required: true,
        example: 456,
    })
    @ApiOkResponse({
        description: 'Comment deleted successfully.',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. You must be logged in to access this resource.',
    })
    @ApiForbiddenResponse({
        description: 'Forbidden. You do not have permission to delete this comment.',
    })
    @ApiNotFoundResponse({
        description: 'Comment not found. The comment with the specified ID does not exist.',
    })
    async delete(@Param('id') commentId: number): Promise<void> {
        return await this.commentsService.delete(commentId);
    }
}

import {
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FollowActionResponseDto, FollowStatusResponseDto, ReportFollowerDto } from '../dto';
import { FOLLOWS_SERVICE, IFollowsService } from '../interfaces/follows-service.interface';

/**
 * Follow management controller providing RESTful endpoints for user-report follow operations.
 * Handles follow/unfollow actions, status checking, and follower management for infrastructure reports.
 *
 * Exposes follow management endpoints including:
 * - Follow/unfollow actions for authenticated users
 * - Follow status checking for UI state management
 * - Follower listing for community engagement features
 * - Optimized follower ID retrieval for notification systems
 *
 * All endpoints require authentication and operate on the authenticated user's context.
 * Report-specific operations validate report existence and user permissions.
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/reports/:reportId
 * POST /api/v1/reports/123/follow              // Follow report 123
 * DELETE /api/v1/reports/123/unfollow          // Unfollow report 123
 * GET /api/v1/reports/123/follow-status        // Check follow status
 * GET /api/v1/reports/123/followers            // Get follower names
 * GET /api/v1/reports/123/followers-ids        // Get follower IDs
 * ```
 */
@ApiTags('Report Follows')
@Controller({
    path: 'reports/:reportId',
    version: '1',
})
export class FollowsController {
    /**
     * Creates a new FollowsController instance.
     *
     * @param followsService Follow service for handling business logic
     */
    constructor(
        @Inject(FOLLOWS_SERVICE)
        private readonly followsService: IFollowsService,
    ) {}

    /**
     * Creates a follow relationship between the authenticated user and a report.
     * Allows users to subscribe to report updates and notifications.
     *
     * @param reportId Unique identifier of the report to follow
     * @param req Express request object containing authenticated user information
     * @returns Follow action result with success message
     *
     * @example
     * ```typescript
     * // Follow a report
     * POST /api/v1/reports/123/follow
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "message": "Report followed successfully"     * }
     * ```
     */
    @Post('follow')
    @ApiOperation({ summary: 'Follow a report' })
    @ApiParam({ name: 'reportId', description: 'ID of the report to follow', type: 'number' })
    @ApiResponse({
        status: 201,
        description: 'Report followed successfully',
        type: FollowActionResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'User or report not found' })
    @ApiResponse({ status: 409, description: 'User is already following this report' })
    async followReport(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Req() req,
    ): Promise<FollowActionResponseDto> {
        const userId = req.user.id;
        return await this.followsService.followReport(userId, reportId);
    }

    /**
     * Removes a follow relationship between the authenticated user and a report.
     * Unsubscribes user from report notifications and updates.
     *
     * @param reportId Unique identifier of the report to unfollow
     * @param req Express request object containing authenticated user information
     * @returns Unfollow action result with success message
     *
     * @example
     * ```typescript
     * // Unfollow a report
     * DELETE /api/v1/reports/123/unfollow
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "message": "Report unfollowed successfully"
     * }
     * ```
     */
    @Delete('unfollow')
    @ApiOperation({ summary: 'Unfollow a report' })
    @ApiParam({ name: 'reportId', description: 'ID of the report to unfollow', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Report unfollowed successfully',
        type: FollowActionResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'User or report not found' })
    @ApiResponse({ status: 409, description: 'User is not following this report' })
    async unfollowReport(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Req() req,
    ): Promise<FollowActionResponseDto> {
        const userId = req.user.id;
        return await this.followsService.unfollowReport(userId, reportId);
    }

    /**
     * Retrieves all users following a specific report with their names.
     * Returns follower information for community engagement and display purposes.
     *
     * @param reportId Unique identifier of the report
     * @returns List of follower names for the report
     *
     * @example
     * ```typescript
     * // Get report followers
     * GET /api/v1/reports/123/followers
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "followers": ["John Doe", "Jane Smith", "Carlos González"]
     * }
     * ```
     */
    @Get('followers')
    @ApiOperation({ summary: 'Get report followers names' })
    @ApiParam({ name: 'reportId', description: 'ID of the report', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'List of follower names',
        type: ReportFollowerDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async getReportFollowers(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Query() { page, limit }: PaginationDto,
    ): Promise<Pagination<ReportFollowerDto>> {
        return await this.followsService.getReportFollowers(reportId, { page, limit });
    }

    /**
     * Checks the follow relationship status between the authenticated user and a report.
     * Returns whether the user is currently following the specified report.
     * Used for UI state management and conditional rendering.
     *
     * @param reportId Unique identifier of the report to check
     * @param req Express request object containing authenticated user information
     * @returns Follow status with boolean indicator
     *
     * @example
     * ```typescript
     * // Check follow status
     * GET /api/v1/reports/123/follow-status
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "isFollowing": true
     * }
     * ```
     */
    @Get('follow-status')
    @ApiOperation({ summary: 'Check if user is following the report' })
    @ApiParam({ name: 'reportId', description: 'ID of the report', type: 'number' })
    @ApiResponse({ status: 200, description: 'Follow status', type: FollowStatusResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    async getFollowStatus(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Req() req,
    ): Promise<FollowStatusResponseDto> {
        const userId = req.user.id;
        return await this.followsService.isFollowingReport(userId, reportId);
    }
}

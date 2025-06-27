import { Controller, Get, Inject, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserFollowedReportsDto } from '../../reports/follows/dto';
import {
    FOLLOWS_SERVICE,
    IFollowsService,
} from '../../reports/follows/interfaces/follows-service.interface';

/**
 * User follows controller providing endpoints for managing user's followed reports.
 * Handles retrieval of reports that users are following for dashboard and notification purposes.
 *
 * Exposes user follow management endpoints including:
 * - Current user's followed reports retrieval
 * - Specific user's followed reports retrieval (public profiles)
 * - Follow statistics and engagement metrics
 *
 * All endpoints require authentication and include proper access control
 * for user privacy and data protection.
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/users
 * GET /api/v1/users/me/followed-reports        // Get current user's follows
 * GET /api/v1/users/123/followed-reports       // Get specific user's follows
 * ```
 */
@ApiTags('User Follows')
@ApiBearerAuth()
@Controller({
    path: 'users',
    version: '1',
})
export class UserFollowsController {
    /**
     * Creates a new UserFollowsController instance.
     *
     * @param followsService Follow service for handling business logic
     */
    constructor(
        @Inject(FOLLOWS_SERVICE)
        private readonly followsService: IFollowsService,
    ) {}

    /**
     * Retrieves all reports followed by the authenticated user.
     * Returns user's personal follow list for dashboard and notification management.
     * Used for user profile and personalized content display.
     *
     * @param req Express request object containing authenticated user information
     * @returns User's followed reports with IDs and total count
     *
     * @example
     * ```typescript
     * // Get current user's followed reports
     * GET /api/v1/users/me/followed-reports
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "reports": [123, 456, 789],
     *   "total": 3
     * }
     * ```
     */
    @Get('me/followed-reports')
    @ApiOperation({
        summary: 'Get reports followed by the current user',
        description: 'Retrieves all reports that the authenticated user is currently following',
    })
    @ApiResponse({
        status: 200,
        description: 'List of reports followed by the current user',
        type: UserFollowedReportsDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Authentication required',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getCurrentUserFollowedReports(
        @Req() req,
        @Query() { page, limit }: PaginationDto,
    ): Promise<Pagination<UserFollowedReportsDto>> {
        const userId = req.user.id;
        return await this.followsService.getUserFollowedReports(userId, { page, limit });
    }

    /**
     * Retrieves all reports followed by a specific user.
     * Returns public follow information for user profiles and community features.
     * Allows viewing other users' followed reports for social engagement.
     *
     * @param userId Unique identifier of the user to query
     * @returns Specified user's followed reports with IDs and total count
     *
     * @example
     * ```typescript
     * // Get specific user's followed reports
     * GET /api/v1/users/123/followed-reports
     * Authorization: Bearer <token>
     *
     * // Response
     * {
     *   "reports": [456, 789, 101112],
     *   "total": 3
     * }
     * ```
     */
    @Get(':userId/followed-reports')
    @ApiOperation({
        summary: 'Get reports followed by a specific user',
        description: 'Retrieves all reports that a specific user is currently following',
    })
    @ApiParam({
        name: 'userId',
        description: 'Unique identifier of the user',
        type: Number,
        example: 123,
    })
    @ApiResponse({
        status: 200,
        description: 'List of reports followed by the specified user',
        type: UserFollowedReportsDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid user ID parameter',
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Authentication required',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getUserFollowedReports(
        @Param('userId', ParseIntPipe) userId: number,
        @Query() { page, limit }: PaginationDto,
    ): Promise<Pagination<UserFollowedReportsDto>> {
        return await this.followsService.getUserFollowedReports(userId, { page, limit });
    }
}

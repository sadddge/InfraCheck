import { Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    FollowActionResponseDto,
    FollowStatusResponseDto,
    ReportFollowersIdsResponseDto,
    ReportFollowersResponseDto,
} from '../dto';
import { FOLLOWS_SERVICE, IFollowsService } from '../interfaces/follows-service.interface';

/**
 * Controller for managing report follow actions.
 *
 * Provides endpoints to follow/unfollow reports, retrieve followers, and check follow status.
 *
 * @module FollowsController
 * @tag Report Follows
 *
 * Endpoints:
 * - POST /reports/:reportId/follow: Follow a report.
 * - DELETE /reports/:reportId/unfollow: Unfollow a report.
 * - GET /reports/:reportId/followers: Get names of report followers.
 * - GET /reports/:reportId/followers-ids: Get IDs of report followers.
 * - GET /reports/:reportId/follow-status: Check if the current user is following the report.
 *
 * @param {number} reportId - ID of the report to perform actions on.
 * @param {Request} req - Express request object, containing authenticated user info.
 *
 * @injects IFollowsService - Service for handling follow logic.
 */
@ApiTags('Report Follows')
@Controller({
    path: 'reports/:reportId',
    version: '1',
})
export class FollowsController {
    constructor(
        @Inject(FOLLOWS_SERVICE)
        private readonly followsService: IFollowsService,
    ) {}

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

    @Get('followers')
    @ApiOperation({ summary: 'Get report followers names' })
    @ApiParam({ name: 'reportId', description: 'ID of the report', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'List of follower names',
        type: ReportFollowersResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async getReportFollowers(
        @Param('reportId', ParseIntPipe) reportId: number,
    ): Promise<ReportFollowersResponseDto> {
        return await this.followsService.getReportFollowers(reportId);
    }

    @Get('followers-ids')
    @ApiOperation({ summary: 'Get report followers IDs' })
    @ApiParam({ name: 'reportId', description: 'ID of the report', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'List of follower IDs',
        type: ReportFollowersIdsResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'Report not found' })
    async getReportFollowersIds(
        @Param('reportId', ParseIntPipe) reportId: number,
    ): Promise<ReportFollowersIdsResponseDto> {
        return await this.followsService.getFollowersIds(reportId);
    }

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

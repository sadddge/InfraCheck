import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    ParseIntPipe,
    Post,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { VoteStatsDto } from '../dto/vote-stats.dto';
import { VoteDto } from '../dto/vote.dto';
import { IVotesService, VOTES_SERVICE } from '../interfaces/votes-service.interface';

/**
 * Controller for managing votes on infrastructure reports.
 * Provides endpoints for voting, removing votes, and retrieving vote statistics.
 *
 * All voting endpoints require authentication and follow the pattern:
 * POST /reports/:reportId/votes - Cast or update a vote
 * DELETE /reports/:reportId/votes - Remove user's vote
 * GET /reports/:reportId/votes/stats - Get vote statistics
 * GET /reports/:reportId/votes/user - Get current user's vote
 */
@ApiTags('Votes')
@ApiBearerAuth()
@Controller({
    path: 'reports/:reportId/votes',
    version: '1',
})
export class VotesController {
    constructor(
        @Inject(VOTES_SERVICE)
        private readonly votesService: IVotesService,
    ) { }

    /**
     * Cast or update a vote on a report.
     * If user has already voted with the same type, throws duplicate vote error.
     * If user has voted with different type, updates the vote.
     * If user hasn't voted, creates a new vote.
     */
    @Post()
    @ApiOperation({
        summary: 'Cast or update a vote on a report',
        description:
            'Allows users to upvote or downvote a report. Throws error if user tries to cast the same vote type twice.',
    })
    @ApiParam({
        name: 'reportId',
        description: 'ID of the report to vote on',
        type: Number,
    })
    @ApiResponse({
        status: 201,
        description: 'Vote cast successfully',
        type: VoteDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Duplicate vote - user has already cast this vote type',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found',
    })
    async vote(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Body() createVoteDto: CreateVoteDto,
        @Req() req,
    ): Promise<VoteDto> {
        const userId = Number(req.user.id);
        return await this.votesService.vote(userId, reportId, createVoteDto);
    }

    /**
     * Remove user's vote from a report.
     */
    @Delete()
    @HttpCode(204)
    @ApiOperation({
        summary: 'Remove vote from a report',
        description: "Removes the current user's vote from the specified report.",
    })
    @ApiParam({
        name: 'reportId',
        description: 'ID of the report to remove vote from',
        type: Number,
    })
    @ApiResponse({
        status: 204,
        description: 'Vote removed successfully',
    })
    async removeVote(@Param('reportId', ParseIntPipe) reportId: number, @Req() req): Promise<void> {
        const userId = Number(req.user.id);
        await this.votesService.removeVote(userId, reportId);
    }

    /**
     * Get vote statistics for a report.
     */
    @Get('stats')
    @ApiOperation({
        summary: 'Get vote statistics for a report',
        description: 'Retrieves upvote count, downvote count, and total score for a report.',
    })
    @ApiParam({
        name: 'reportId',
        description: 'ID of the report to get statistics for',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'Vote statistics retrieved successfully',
        type: VoteStatsDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found',
    })
    async getVoteStats(@Param('reportId', ParseIntPipe) reportId: number): Promise<VoteStatsDto> {
        return await this.votesService.getVoteStats(reportId);
    }

    /**
     * Get current user's vote for a report.
     */
    @Get('me')
    @ApiOperation({
        summary: "Get current user's vote for a report",
        description: "Retrieves the current user's vote for the specified report.",
    })
    @ApiParam({
        name: 'reportId',
        description: 'ID of the report to check user vote for',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: 'User vote retrieved successfully',
        type: VoteDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found or user has not voted',
    })
    async getUserVote(
        @Param('reportId', ParseIntPipe) reportId: number,
        @Req() req,
    ): Promise<VoteDto> {
        const userId = Number(req.user.id);
        return await this.votesService.getUserVote(userId, reportId);
    }
}

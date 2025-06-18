import { Controller, Get, Inject, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFollowedReportsResponseDto } from '../../reports/follows/dto';
import {
    FOLLOWS_SERVICE,
    IFollowsService,
} from '../../reports/follows/interfaces/follows-service.interface';

@ApiTags('User Follows')
@Controller({
    path: 'users',
    version: '1',
})
export class UserFollowsController {
    constructor(
        @Inject(FOLLOWS_SERVICE)
        private readonly followsService: IFollowsService,
    ) {}

    @Get('me/followed-reports')
    @ApiOperation({ summary: 'Get reports followed by the current user' })
    @ApiResponse({
        status: 200,
        description: 'List of reports followed by the user',
        type: UserFollowedReportsResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getCurrentUserFollowedReports(@Req() req): Promise<UserFollowedReportsResponseDto> {
        const userId = req.user.id;
        return await this.followsService.getUserFollowedReports(userId);
    }

    @Get(':userId/followed-reports')
    @ApiOperation({ summary: 'Get reports followed by a specific user' })
    @ApiParam({ name: 'userId', description: 'ID of the user', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'List of reports followed by the user',
        type: UserFollowedReportsResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserFollowedReports(
        @Param('userId', ParseIntPipe) userId: number,
    ): Promise<UserFollowedReportsResponseDto> {
        return await this.followsService.getUserFollowedReports(userId);
    }
}

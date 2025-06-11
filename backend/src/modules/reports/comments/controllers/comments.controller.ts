import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserAccessGuard } from 'src/common/guards/user-access.guard';
import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { COMMENTS_SERVICE, ICommentsService } from '../interfaces/comments-service.interface';

@Controller({
    path: 'reports/:reportId/comments',
    version: '1',
})
export class CommentsController {
    constructor(
        @Inject(COMMENTS_SERVICE)
        private readonly commentsService: ICommentsService,
    ) {}

    @Get()
    async findAllByReportId(@Param('reportId') reportId: number): Promise<CommentDto[]> {
        return await this.commentsService.findAllByReportId(reportId);
    }

    @Post()
    async createComment(
        @Param('reportId') reportId: number,
        @Body() dto: CreateCommentDto,
        @Req() req,
    ): Promise<CommentDto> {
        return await this.commentsService.createComment(reportId, req.user.id, dto);
    }

    @Delete(':id')
    @UseGuards(UserAccessGuard)
    async delete(@Param('id') commentId: number): Promise<void> {
        return await this.commentsService.delete(commentId);
    }
}

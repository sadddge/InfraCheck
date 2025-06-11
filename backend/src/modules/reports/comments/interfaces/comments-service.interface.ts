import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

export const COMMENTS_SERVICE = 'COMMENTS_SERVICE';

export interface ICommentsService {
    findAllByReportId(reportId: number): Promise<CommentDto[]>;
    createComment(reportId: number, userId: number, dto: CreateCommentDto): Promise<CommentDto>;
    delete(commentId: number): Promise<void>;
}

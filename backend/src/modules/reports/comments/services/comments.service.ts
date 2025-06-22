import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
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

    /** @inheritDoc */
    async findAllByReportId(
        reportId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<CommentDto>> {
        const paginated = await paginate<Comment>(this.commentRepository, options, {
            where: { report: { id: Equal(reportId) } },
            relations: ['creator', 'report'],
            order: { createdAt: 'DESC' },
        });
        const items = paginated.items.map(comment => this.mapToDto(comment));
        return new Pagination<CommentDto>(items, paginated.meta, paginated.links);
    }

    /** @inheritDoc */
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

    /** @inheritDoc */
    async delete(commentId: number): Promise<void> {
        await this.commentRepository.delete({ id: commentId });
    }

    /** @inheritDoc */
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

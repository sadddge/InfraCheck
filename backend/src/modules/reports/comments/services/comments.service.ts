import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { Equal, Repository } from 'typeorm';
import { CommentDto } from '../dto/comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { ICommentsService } from '../interfaces/comments-service.interface';

@Injectable()
export class CommentsService implements ICommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) {}

    async findAllByReportId(reportId: number): Promise<CommentDto[]> {
        const comments = await this.commentRepository.find({
            where: { report: { id: Equal(reportId) } },
            relations: ['creator', 'report'],
            order: { createdAt: 'DESC' },
        });

        return comments.map(comment => this.mapToDto(comment));
    }

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

    async delete(commentId: number): Promise<void> {
        await this.commentRepository.delete({ id: commentId });
    }

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

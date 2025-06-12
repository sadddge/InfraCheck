import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { CommentsController } from './controllers/comments.controller';
import { COMMENTS_SERVICE } from './interfaces/comments-service.interface';
import { CommentsService } from './services/comments.service';

/**
 * Comment management module providing complete comment functionality for report discussions.
 * Handles comment CRUD operations, user associations, and report-specific comment management.
 *
 * @class CommentsModule
 * @description Comment management module that provides:
 * - Comment retrieval and listing by report
 * - Comment creation with user and report associations
 * - Comment deletion with access control
 * - RESTful API endpoints for comment operations
 * - Integration with report and user management systems
 *
 * @example
 * ```typescript
 * // Module is automatically imported in ReportsModule
 * // Provides comment management endpoints at /api/v1/reports/:reportId/comments/*
 * // Exports COMMENTS_SERVICE for dependency injection
 *
 * // Available endpoints:
 * // GET /api/v1/reports/:reportId/comments (get all comments for a report)
 * // POST /api/v1/reports/:reportId/comments (create new comment)
 * // DELETE /api/v1/reports/:reportId/comments/:id (delete comment)
 * ```
 *
 * @since 1.0.0
 */
@Module({
    imports: [TypeOrmModule.forFeature([Comment])],
    controllers: [CommentsController],
    providers: [
        {
            provide: COMMENTS_SERVICE,
            useClass: CommentsService,
        },
    ],
    exports: [COMMENTS_SERVICE],
})
export class CommentsModule {}

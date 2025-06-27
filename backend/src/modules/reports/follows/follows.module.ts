import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { FollowsController } from './controllers/follows.controller';
import { FOLLOWS_SERVICE } from './interfaces/follows-service.interface';
import { FollowsService } from './services/follows.service';

/**
 * Follow management module providing user-report relationship functionality.
 * Handles follow/unfollow operations, status checking, and follower management for infrastructure reports.
 *
 * @class FollowsModule
 * @description Follow management module that provides:
 * - Follow/unfollow operations between users and reports
 * - Follow status checking and relationship queries
 * - Follower listing for community engagement
 * - Optimized queries for notification systems
 * - RESTful API endpoints for follow operations
 * - Integration with user and report management systems
 *
 * @example
 * ```typescript
 * // Module is automatically imported in ReportsModule
 * // Provides follow management endpoints at /api/v1/reports/:reportId/*
 * // Exports FOLLOWS_SERVICE for dependency injection
 *
 * // Available endpoints:
 * // POST /api/v1/reports/:reportId/follow
 * // DELETE /api/v1/reports/:reportId/unfollow
 * // GET /api/v1/reports/:reportId/follow-status
 * // GET /api/v1/reports/:reportId/followers
 * // GET /api/v1/reports/:reportId/followers-ids
 * ```
 *
 * @since 1.0.0
 */
@Module({
    imports: [TypeOrmModule.forFeature([User, Report])],
    controllers: [FollowsController],
    providers: [
        {
            provide: FOLLOWS_SERVICE,
            useClass: FollowsService,
        },
    ],
    exports: [FOLLOWS_SERVICE],
})
export class FollowsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { FollowsModule } from '../reports/follows/follows.module';
import { UserFollowsController } from './controllers/user-follows.controller';
import { UsersController } from './controllers/users.controller';
import { USER_SERVICE } from './interfaces/user-service.interface';
import { UsersService } from './services/users.service';

/**
 * User management module providing complete user operations and profile management.
 * Handles user CRUD operations, profile updates, and administrative user management.
 *
 * @class UsersModule
 * @description User management module that provides:
 * - User profile management endpoints
 * - Administrative user operations
 * - User status management
 * - Role-based access control
 * - User data retrieval and filtering
 * - Account management functionality
 *
 * @example
 * ```typescript
 * // Module is automatically imported in AppModule
 * // Provides user management endpoints at /api/v1/users/*
 * // Exports USER_SERVICE for dependency injection
 *
 * // Available endpoints:
 * // GET /api/v1/users (admin only)
 * // GET /api/v1/users/:id
 * // PATCH /api/v1/users/:id
 * // PATCH /api/v1/users/:id/status (admin only)
 * // DELETE /api/v1/users/:id (admin only)
 * ```
 *
 * @since 1.0.0
 */
@Module({
    imports: [TypeOrmModule.forFeature([User]), FollowsModule],
    exports: [TypeOrmModule, USER_SERVICE],
    controllers: [UsersController, UserFollowsController],
    providers: [
        {
            provide: USER_SERVICE,
            useClass: UsersService,
        },
    ],
})
export class UsersModule {}

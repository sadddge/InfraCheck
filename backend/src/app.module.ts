import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ChatModule } from './modules/chat/chat.module';
import { ReportModule } from './modules/reports/reports.module';
import { UsersModule } from './modules/users/users.module';
import { VotesModule } from './modules/votes/votes.module';

/**
 * Root application module that configures and imports all feature modules.
 * Sets up global configuration, database connection, authentication, and rate limiting.
 *
 * @class AppModule
 * @description Main module that bootstraps the InfraCheck application with:
 * - Global configuration management
 * - Rate limiting (10 requests per minute)
 * - Database connectivity
 * - Authentication and authorization
 * - User management functionality
 *
 * @example
 * ```typescript
 * // This module is automatically loaded by NestJS in main.ts
 * const app = await NestFactory.create(AppModule);
 * ```
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000, // 1 minute
                    limit: 100,
                },
            ],
        }),
        CacheModule.register({
            isGlobal: true,
            ttl: 60000, // 1 minute
            max: 100,
        }),
        DatabaseModule,
        UsersModule,
        AuthModule,
        ReportModule,
        VotesModule,
        ChatModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class AppModule { }

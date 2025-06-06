import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ReportModule } from './modules/reports/reports.module';
import { UsersModule } from './modules/users/users.module';

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
                    ttl: 60000,
                    limit: 10,
                },
            ],
        }),
        DatabaseModule,
        UsersModule,
        AuthModule,
        ReportModule,
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
    ],
})
export class AppModule {}

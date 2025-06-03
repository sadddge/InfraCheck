import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './database.config';

/**
 * Database configuration module providing TypeORM setup for the application.
 * Configures database connection, entity management, and migration settings.
 *
 * @class DatabaseModule
 * @description Database module that provides:
 * - TypeORM configuration and setup
 * - Database connection management
 * - Entity registration and relationships
 * - Migration and synchronization settings
 * - Environment-based configuration loading
 *
 * @example
 * ```typescript
 * // Module is imported in AppModule to provide database connectivity
 * // Uses database.config.ts for configuration settings
 * // Supports PostgreSQL with connection pooling
 *
 * // Required environment variables:
 * // DATABASE_HOST - Database server hostname
 * // DATABASE_PORT - Database server port
 * // DATABASE_USERNAME - Database username
 * // DATABASE_PASSWORD - Database password
 * // DATABASE_NAME - Database name
 * // DATABASE_SSL - SSL connection setting
 * ```
 *
 * @throws {Error} When database configuration is missing or invalid
 *
 * @since 1.0.0
 */
@Module({
    imports: [
        ConfigModule.forFeature(databaseConfig),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                const options = config.get<TypeOrmModuleOptions>('database');
                if (!options) {
                    throw new Error('Database configuration is missing');
                }
                return options;
            },
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}

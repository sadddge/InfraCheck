import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database configuration factory for TypeORM PostgreSQL connection.
 * Provides environment-specific settings for database connectivity and behavior.
 *
 * @function databaseConfig
 * @returns {TypeOrmModuleOptions} TypeORM configuration object
 * @description Database configuration including:
 * - PostgreSQL connection parameters from environment variables
 * - Entity auto-loading and discovery
 * - Development vs production settings
 * - Logging and synchronization behavior
 *
 * @example
 * ```typescript
 * // Environment variables required:
 * // DB_HOST=localhost
 * // DB_PORT=5432
 * // DB_USER=postgres
 * // DB_PASSWORD=password
 * // DB_NAME=infracheck
 * // NODE_ENV=development
 *
 * const config = databaseConfig();
 * ```
 */
export default registerAs(
    'database',
    (): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        entities: [`${__dirname}/../**/*.entity.{ts,js}`],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
    }),
);

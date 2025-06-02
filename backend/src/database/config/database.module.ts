import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from './database.config';

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

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forFeature(databaseConfig),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                const options = config.get<TypeOrmModuleOptions>('database');
                if (!options) {
                    throw new Error("Database configuration is missing");
                }
                return options;
            },
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
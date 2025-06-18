import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { FollowsController } from './controllers/follows.controller';
import { FOLLOWS_SERVICE } from './interfaces/follows-service.interface';
import { FollowsService } from './services/follows.service';

/**
 * The FollowsModule is a NestJS module responsible for managing the follows feature.
 *
 * @module FollowsModule
 *
 * @description
 * - Imports the TypeOrmModule with the User and Report entities for database interaction.
 * - Registers the FollowsController to handle HTTP requests related to follows.
 * - Provides the FollowsService using the FOLLOWS_SERVICE token for dependency injection.
 * - Exports the FOLLOWS_SERVICE token for use in other modules.
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

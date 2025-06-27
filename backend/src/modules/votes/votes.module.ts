import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Vote } from 'src/database/entities/vote.entity';
import { VotesController } from './controllers/votes.controller';
import { VOTES_SERVICE } from './interfaces/votes-service.interface';
import { VotesService } from './services/votes.service';

/**
 * Module for managing votes on infrastructure reports.
 * Provides functionality for users to cast upvotes and downvotes,
 * retrieve vote statistics, and manage their voting preferences.
 *
 * Features:
 * - Cast votes (upvote/downvote) on reports
 * - Update existing votes to different type
 * - Remove votes from reports
 * - Get vote statistics (counts and scores)
 * - Retrieve user's current vote on a report
 *
 * Note: Duplicate votes (same type) are prevented and will throw an error.
 */
@Module({
    imports: [TypeOrmModule.forFeature([Vote, Report, User])],
    controllers: [VotesController],
    providers: [
        {
            provide: VOTES_SERVICE,
            useClass: VotesService,
        },
    ],
    exports: [VOTES_SERVICE],
})
export class VotesModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VoteType } from 'src/common/enums/vote-type.enums';
import {
    duplicateVote,
    reportNotFound,
    userNotFound,
    voteNotFound,
} from 'src/common/helpers/exception.helper';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Vote } from 'src/database/entities/vote.entity';
import { Equal, Repository } from 'typeorm';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { VoteStatsDto } from '../dto/vote-stats.dto';
import { VoteDto } from '../dto/vote.dto';
import { IVotesService } from '../interfaces/votes-service.interface';

/**
 * Service handling vote operations for infrastructure reports.
 * Manages user votes, vote statistics, and vote state transitions.
 */
@Injectable()
export class VotesService implements IVotesService {
    constructor(
        @InjectRepository(Vote)
        private readonly voteRepository: Repository<Vote>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * Creates or updates a vote for a specific report by a user.
     * Throws error if user tries to cast the same vote type twice.
     * Updates vote if user has voted with a different type.
     */
    async vote(userId: number, reportId: number, createVoteDto: CreateVoteDto): Promise<VoteDto> {
        const { report, user } = await this.validateReportAndUser(reportId, userId);

        const existingVote = await this.voteRepository.findOne({
            where: {
                user: { id: Equal(userId) },
                report: { id: Equal(reportId) },
            },
            relations: ['user', 'report'],
        });

        if (existingVote) {
            if (existingVote.type === createVoteDto.type) {
                duplicateVote({
                    userId: String(userId),
                    reportId: String(reportId),
                    voteType: createVoteDto.type,
                });
            }

            existingVote.type = createVoteDto.type;
            const updatedVote = await this.voteRepository.save(existingVote);
            return this.mapToDto(updatedVote);
        }

        // Create new vote
        const newVote = this.voteRepository.create({
            user,
            report,
            type: createVoteDto.type,
        });

        const savedVote = await this.voteRepository.save(newVote);
        return this.mapToDto(savedVote);
    }

    /**
     * Removes a user's vote from a specific report.
     */
    async removeVote(userId: number, reportId: number): Promise<boolean> {
        const existingVote = await this.voteRepository.findOne({
            where: {
                user: { id: userId },
                report: { id: reportId },
            },
        });

        if (!existingVote) {
            return false;
        }

        await this.voteRepository.remove(existingVote);
        return true;
    }

    /**
     * Retrieves vote statistics for a specific report.
     */
    async getVoteStats(reportId: number): Promise<VoteStatsDto> {
        // Verify that the report exists
        const report = await this.reportRepository.findOne({ where: { id: reportId } });
        if (!report) {
            throw new NotFoundException(`Report with ID ${reportId} not found`);
        }

        const upvotes = await this.voteRepository.count({
            where: {
                report: { id: reportId },
                type: VoteType.UPVOTE,
            },
        });
        const downvotes = await this.voteRepository.count({
            where: {
                report: { id: reportId },
                type: VoteType.DOWNVOTE,
            },
        });
        const totalVotes = upvotes + downvotes;

        return {
            upvotes,
            downvotes,
            score: upvotes - downvotes,
            totalVotes,
        };
    }

    /**
     * Retrieves a user's current vote for a specific report.
     */
    async getUserVote(userId: number, reportId: number): Promise<VoteDto> {
        await this.validateReportAndUser(reportId, userId);

        const existingVote = await this.voteRepository.findOne({
            where: {
                user: { id: Equal(userId) },
                report: { id: Equal(reportId) },
            },
            relations: ['user', 'report'],
        });

        if (!existingVote) {
            voteNotFound({
                userId: String(userId),
                reportId: String(reportId),
            });
        }

        return this.mapToDto(existingVote);
    }

    private mapToDto(vote: Vote): VoteDto {
        return {
            id: vote.id,
            type: vote.type,
            userId: vote.user.id,
            reportId: vote.report.id,
            createdAt: vote.createdAt,
        };
    }

    private async validateReport(reportId: number): Promise<Report> {
        const report = await this.reportRepository.findOne({ where: { id: Equal(reportId) } });
        if (!report) {
            reportNotFound({ reportId: String(reportId) });
        }
        return report;
    }

    private async validateUser(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: Equal(userId) } });
        if (!user) {
            userNotFound({ userId: String(userId) });
        }
        return user;
    }

    private async validateReportAndUser(
        reportId: number,
        userId: number,
    ): Promise<{ report: Report; user: User }> {
        const report = await this.validateReport(reportId);
        const user = await this.validateUser(userId);
        return { report, user };
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import {
    invalidRequest,
    reportAlreadyFollowed,
    reportNotFollowed,
    reportNotFound,
    userNotFound,
} from 'src/common/helpers/exception.helper';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import { Equal, Repository } from 'typeorm';
import {
    FollowActionResponseDto,
    FollowStatusResponseDto,
    ReportFollowersIdsResponseDto,
    ReportFollowersResponseDto,
    UserFollowedReportsResponseDto,
} from '../dto';
import { IFollowsService } from '../interfaces/follows-service.interface';

/**
 * Follow management service providing user-report relationship operations.
 * Handles follow/unfollow actions, status checking, and follower management for infrastructure reports.
 *
 * Core functionality:
 * - Follow/unfollow operations with validation and conflict prevention
 * - Follow status queries and relationship checking
 * - Follower listing with detailed user information
 * - User's followed reports management
 * - Bulk operations for notification systems
 *
 * Features:
 * - Duplicate follow prevention with conflict handling
 * - Entity existence validation for users and reports
 * - Optimized queries for bulk operations
 * - Comprehensive error handling and logging
 *
 * @example
 * ```typescript
 * const followsService = new FollowsService(userRepository, reportRepository);
 * const result = await followsService.followReport(123, 456);
 * const followers = await followsService.getReportFollowers(456);
 * ```
 */
@Injectable()
export class FollowsService implements IFollowsService {
    /**
     * Creates a new FollowsService instance.
     *
     * @param userRepository TypeORM repository for User entity operations
     * @param reportRepository TypeORM repository for Report entity operations
     */
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) {}

    /** @inheritDoc */
    async followReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        await this.validateUserAndReport(userId, reportId);
        const isAlreadyFollowing = await this.isFollowingReport(userId, reportId);
        if (isAlreadyFollowing.isFollowing) {
            reportAlreadyFollowed();
        }

        await this.reportRepository
            .createQueryBuilder()
            .relation(Report, 'followers')
            .of(reportId)
            .add(userId);

        return { message: 'Report followed successfully' };
    }

    /** @inheritDoc */
    async unfollowReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        await this.validateUserAndReport(userId, reportId);
        const isFollowing = await this.isFollowingReport(userId, reportId);
        if (!isFollowing.isFollowing) {
            reportNotFollowed();
        }

        await this.reportRepository
            .createQueryBuilder()
            .relation(Report, 'followers')
            .of(reportId)
            .remove(userId);

        return { message: 'Report unfollowed successfully' };
    }

    /** @inheritDoc */
    async isFollowingReport(userId: number, reportId: number): Promise<FollowStatusResponseDto> {
        if (!userId || !reportId) {
            invalidRequest();
        }

        const count = await this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
            .where('report.id = :reportId', { reportId })
            .getCount();

        return { isFollowing: count > 0 };
    }

    /** @inheritDoc */
    async getReportFollowers(reportId: number): Promise<ReportFollowersResponseDto> {
        await this.validateReport(reportId);

        const report = await this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.followers', 'follower')
            .where('report.id = :reportId', { reportId })
            .getOne();

        return {
            followers: report?.followers.map(follower => follower.name) ?? [],
        };
    }

    /** @inheritDoc */
    async getUserFollowedReports(
        userId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<UserFollowedReportsResponseDto>> {
        await this.validateUser(userId);

        const qb = this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
            .select(['report.id']);

        const paginated = await paginate<Report>(qb, options);

        const items = paginated.items.map(report => ({
            reportId: report.id,
        }));

        return new Pagination<UserFollowedReportsResponseDto>(
            items,
            paginated.meta,
            paginated.links,
        );
    }

    /** @inheritDoc */
    async getFollowersIds(reportId: number): Promise<ReportFollowersIdsResponseDto> {
        await this.validateReport(reportId);

        const report = await this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.followers', 'follower')
            .where('report.id = :reportId', { reportId })
            .getOne();
        return {
            userIds: report?.followers.map(follower => follower.id) ?? [],
        };
    }

    /**
     * Validates the existence of a user by their ID.
     *
     * @param userId - The unique identifier of the user to validate.
     * @returns A promise that resolves to the found {@link User} entity.
     * @throws {AppException} GEN002 - If the userId is not provided.
     * @throws {AppException} USR001 - If no user is found with the given ID.
     */
    private async validateUser(userId: number): Promise<User> {
        if (!userId) {
            invalidRequest({
                info: 'User ID is required for validation.',
            });
        }

        const user = await this.userRepository.findOne({ where: { id: Equal(userId) } });
        if (!user) {
            userNotFound({
                userId: userId.toString(),
            });
        }

        return user;
    }

    /**
     * Validates the existence of a report by its ID.
     *
     * @param reportId - The unique identifier of the report to validate.
     * @returns A promise that resolves to the found {@link Report} entity.
     * @throws {AppException} GEN002 - If the report ID is not provided.
     * @throws {AppException} REP001 - If no report is found with the given ID.
     */
    private async validateReport(reportId: number): Promise<Report> {
        if (!reportId) {
            invalidRequest({
                info: 'Report ID is required for validation.',
            });
        }

        const report = await this.reportRepository.findOne({ where: { id: Equal(reportId) } });
        if (!report) {
            reportNotFound({
                reportId: reportId.toString(),
            });
        }

        return report;
    } /**
     * Validates the existence of a user and a report by their respective IDs.
     *
     * @param userId The unique identifier of the user to validate
     * @param reportId The unique identifier of the report to validate
     * @returns A promise that resolves to an object containing the validated user and report
     * @throws {AppException} GEN002 - If the userId or reportId is not provided
     * @throws {AppException} USR001 - If no user is found with the given ID
     * @throws {AppException} REP001 - If no report is found with the given ID
     */
    private async validateUserAndReport(
        userId: number,
        reportId: number,
    ): Promise<{ user: User; report: Report }> {
        const [user, report] = await Promise.all([
            this.validateUser(userId),
            this.validateReport(reportId),
        ]);

        return { user, report };
    }
}

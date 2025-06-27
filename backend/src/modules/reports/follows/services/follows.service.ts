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
    ReportFollowerDto,
    UserFollowedReportsDto,
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
    async getReportFollowers(
        reportId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<ReportFollowerDto>> {
        await this.validateReport(reportId);
        const qb = this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.reportsFollowed', 'report', 'report.id = :reportId', { reportId })
            .select(['user.id', 'user.name']);
        const paginated = await paginate<User>(qb, options);
        const items = paginated.items.map(user => ({
            userId: user.id,
            username: user.name,
        }));
        return new Pagination<ReportFollowerDto>(items, paginated.meta, paginated.links);
    }

    /** @inheritDoc */
    async getReportFollowerIds(reportId: number): Promise<number[]> {
        await this.validateReport(reportId);

        const followers = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.reportsFollowed', 'report', 'report.id = :reportId', { reportId })
            .select(['user.id'])
            .getMany();

        return followers.map(user => user.id);
    }

    /** @inheritDoc */
    async getUserFollowedReports(
        userId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<UserFollowedReportsDto>> {
        await this.validateUser(userId);

        const qb = this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
            .select(['report.id', 'report.title']);

        const paginated = await paginate<Report>(qb, options);

        const items = paginated.items.map(report => ({
            reportId: report.id,
            reportTitle: report.title,
        }));

        return new Pagination<UserFollowedReportsDto>(items, paginated.meta, paginated.links);
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

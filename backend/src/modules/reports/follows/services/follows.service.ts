import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    /**
     * Creates a follow relationship between a user and a report.
     * Validates entity existence, prevents duplicate follows, and manages the many-to-many relationship.
     *
     * @param userId Unique identifier of the user creating the follow
     * @param reportId Unique identifier of the report to follow
     * @returns Follow action result with success status and metadata
     * @throws {AppException} USR001 - When user does not exist
     * @throws {AppException} REP001 - When report does not exist
     * @throws {AppException} REP004 - When user is already following the report
     *
     * @example
     * ```typescript
     * try {
     *   const result = await followsService.followReport(123, 456);
     *   console.log(`Follow created: ${result.message}`);
     * } catch (error) {
     *   if (error.code === 'REP004') {
     *     console.log('User already follows this report');
     *   }
     * }
     * ```
     */
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

    /**
     * Removes a follow relationship between a user and a report.
     * Validates entity existence, checks current follow status, and manages the relationship removal.
     * Gracefully handles cases where follow relationship doesn't exist.
     *
     * @param userId Unique identifier of the user removing the follow
     * @param reportId Unique identifier of the report to unfollow
     * @returns Unfollow action result with success status
     * @throws {AppException} USR001 - When user does not exist
     * @throws {AppException} REP001 - When report does not exist
     * @throws {AppException} REP005 - When user is not following the report
     *
     * @example
     * ```typescript
     * try {
     *   const result = await followsService.unfollowReport(123, 456);
     *   console.log(`Unfollow successful: ${result.message}`);
     * } catch (error) {
     *   if (error.code === 'REP005') {
     *     console.log('User was not following this report');
     *   }
     * }
     * ```
     */
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

    /**
     * Checks the follow relationship status between a user and a report.
     * Returns whether the user is currently following the specified report.
     * Used for UI state management and permission checking.
     *
     * @param userId Unique identifier of the user to check
     * @param reportId Unique identifier of the report to check
     * @returns Follow status with boolean indicator and relationship metadata
     * @throws {AppException} GEN002 - When user ID or report ID is missing or invalid
     *
     * @example
     * ```typescript
     * const status = await followsService.isFollowingReport(123, 456);
     * if (status.isFollowing) {
     *   console.log('User is following this report');
     *   // Show unfollow button in UI
     * } else {
     *   console.log('User is not following this report');
     *   // Show follow button in UI
     * }
     * ```
     */
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

    /**
     * Retrieves all users following a specific report with detailed information.
     * Returns follower list with user profiles for display and notification purposes.
     * Includes complete user information for UI display.
     *
     * @param reportId Unique identifier of the report
     * @returns Complete follower information including user names
     * @throws {AppException} REP001 - When report does not exist
     *
     * @example
     * ```typescript
     * const followers = await followsService.getReportFollowers(456);
     * console.log(`Report has ${followers.followers.length} followers`);
     * followers.followers.forEach(name => console.log(`Follower: ${name}`));
     *
     * // Use for notifications
     * if (followers.followers.length > 0) {
     *   notificationService.notifyFollowers(reportId, 'Report updated');
     * }
     * ```
     */
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

    /**
     * Retrieves all reports followed by a specific user with report identifiers.
     * Returns user's followed reports for dashboard and notification management.
     * Optimized to return only report IDs and total count for efficient processing.
     *
     * @param userId Unique identifier of the user
     * @returns User's followed reports with IDs and total count
     * @throws {AppException} USR001 - When user does not exist
     *
     * @example
     * ```typescript
     * const followedReports = await followsService.getUserFollowedReports(123);
     * console.log(`User follows ${followedReports.total} reports`);
     *
     * // Use for dashboard display
     * const reportDetails = await Promise.all(
     *   followedReports.reports.map(id => reportsService.findById(id))
     * );
     *
     * // Use for notifications
     * followedReports.reports.forEach(reportId => {
     *   subscribeToReportUpdates(userId, reportId);
     * });
     * ```
     */
    async getUserFollowedReports(userId: number): Promise<UserFollowedReportsResponseDto> {
        await this.validateUser(userId);

        const [reports, total] = await this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
            .select(['report.id'])
            .getManyAndCount();

        return {
            reports: reports.map(report => report.id),
            total,
        };
    }

    /**
     * Retrieves only the user IDs of all followers for a specific report.
     * Optimized query for bulk operations and notification systems.
     * Used for efficient notification dispatching and analytics.
     *
     * @param reportId Unique identifier of the report
     * @returns Array of follower user IDs for efficient processing
     * @throws {AppException} REP001 - When report does not exist
     *
     * @example
     * ```typescript
     * const followerIds = await followsService.getFollowersIds(456);
     * console.log(`Sending notifications to ${followerIds.userIds.length} users`);
     *
     * // Bulk notification sending
     * await notificationService.sendBulkNotifications(
     *   followerIds.userIds,
     *   'Report status updated',
     *   { reportId: 456, newStatus: 'IN_PROGRESS' }
     * );
     *
     * // Analytics tracking
     * analyticsService.trackReportEngagement(456, followerIds.userIds.length);
     * ```
     */
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
    }

    /**
     * Validates the existence of a user and a report by their respective IDs.
     *
     * @param userId - The unique identifier of the user to validate.
     * @param reportId - The unique identifier of the report to validate.
     * @returns A promise that resolves to an object containing the validated user and report.
     * @throws Will throw an error if either the user or the report does not exist or fails validation.
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

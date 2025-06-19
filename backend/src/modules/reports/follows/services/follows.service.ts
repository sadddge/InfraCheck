import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    /** Logger instance for tracking follow operations and debugging */
    private readonly logger = new Logger(FollowsService.name);

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
     * @throws {NotFoundException} When user or report does not exist
     * @throws {ConflictException} When user is already following the report
     * @throws {BadRequestException} When operation fails due to invalid data
     *
     * @example
     * ```typescript
     * try {
     *   const result = await followsService.followReport(123, 456);
     *   console.log(`Follow created: ${result.message}`);
     * } catch (error) {
     *   if (error instanceof ConflictException) {
     *     console.log('User already follows this report');
     *   }     * }
     * ```
     */
    async followReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        try {
            await this.validateUserAndReport(userId, reportId);

            // Verificar si ya está siguiendo el reporte
            const isAlreadyFollowing = await this.isFollowingReport(userId, reportId);
            if (isAlreadyFollowing.isFollowing) {
                throw new ConflictException('User is already following this report');
            }

            // Seguir el reporte
            await this.reportRepository
                .createQueryBuilder()
                .relation(Report, 'followers')
                .of(reportId)
                .add(userId);

            return { message: 'Report followed successfully' };
        } catch (error) {
            this.handleError(error, 'Failed to follow report');
        }
    } /**
     * Removes a follow relationship between a user and a report.
     * Validates entity existence, checks current follow status, and manages the relationship removal.
     * Gracefully handles cases where follow relationship doesn't exist.
     *
     * @param userId Unique identifier of the user removing the follow
     * @param reportId Unique identifier of the report to unfollow
     * @returns Unfollow action result with success status
     * @throws {NotFoundException} When user or report does not exist
     * @throws {ConflictException} When user is not following the report
     * @throws {BadRequestException} When operation fails due to invalid data
     *
     * @example
     * ```typescript
     * try {
     *   const result = await followsService.unfollowReport(123, 456);
     *   console.log(`Unfollow successful: ${result.message}`);
     * } catch (error) {
     *   if (error instanceof ConflictException) {
     *     console.log('User was not following this report');
     *   }
     * }
     * ```
     */
    async unfollowReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
        try {
            await this.validateUserAndReport(userId, reportId);

            // Verificar si está siguiendo el reporte
            const isFollowing = await this.isFollowingReport(userId, reportId);
            if (!isFollowing.isFollowing) {
                throw new ConflictException('User is not following this report');
            }

            // Dejar de seguir el reporte
            await this.reportRepository
                .createQueryBuilder()
                .relation(Report, 'followers')
                .of(reportId)
                .remove(userId);

            return { message: 'Report unfollowed successfully' };
        } catch (error) {
            this.handleError(error, 'Failed to unfollow report');
        }
    } /**
     * Checks the follow relationship status between a user and a report.
     * Returns whether the user is currently following the specified report.
     * Used for UI state management and permission checking.
     *
     * @param userId Unique identifier of the user to check
     * @param reportId Unique identifier of the report to check
     * @returns Follow status with boolean indicator and relationship metadata
     * @throws {BadRequestException} When user ID or report ID is missing or invalid
     * @throws {InternalServerErrorException} When database query fails
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
        try {
            // Solo validar que los parámetros no sean nulos/undefined
            if (!userId || !reportId) {
                throw new BadRequestException('User ID and Report ID are required');
            }

            const count = await this.reportRepository
                .createQueryBuilder('report')
                .innerJoin('report.followers', 'follower', 'follower.id = :userId', { userId })
                .where('report.id = :reportId', { reportId })
                .getCount();

            return { isFollowing: count > 0 };
        } catch (error) {
            this.handleError(error, 'Failed to check follow status');
        }
    } /**
     * Retrieves all users following a specific report with detailed information.
     * Returns follower list with user profiles for display and notification purposes.
     * Includes complete user information for UI display.
     *
     * @param reportId Unique identifier of the report
     * @returns Complete follower information including user names
     * @throws {NotFoundException} When report does not exist
     * @throws {InternalServerErrorException} When database query fails
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
        try {
            await this.validateReport(reportId);

            const report = await this.reportRepository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.followers', 'follower')
                .where('report.id = :reportId', { reportId })
                .getOne();

            return {
                followers: report?.followers.map(follower => follower.name) ?? [],
            };
        } catch (error) {
            this.handleError(error, 'Failed to get report followers');
        }
    } /**
     * Retrieves all reports followed by a specific user with report identifiers.
     * Returns user's followed reports for dashboard and notification management.
     * Optimized to return only report IDs and total count for efficient processing.
     *
     * @param userId Unique identifier of the user
     * @returns User's followed reports with IDs and total count
     * @throws {NotFoundException} When user does not exist
     * @throws {InternalServerErrorException} When database query fails
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
        try {
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
        } catch (error) {
            this.handleError(error, 'Failed to get user followed reports');
        }
    } /**
     * Retrieves only the user IDs of all followers for a specific report.
     * Optimized query for bulk operations and notification systems.
     * Used for efficient notification dispatching and analytics.
     *
     * @param reportId Unique identifier of the report
     * @returns Array of follower user IDs for efficient processing
     * @throws {NotFoundException} When report does not exist
     * @throws {InternalServerErrorException} When database query fails
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
        try {
            await this.validateReport(reportId);

            const report = await this.reportRepository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.followers', 'follower')
                .where('report.id = :reportId', { reportId })
                .getOne();
            return {
                userIds: report?.followers.map(follower => follower.id) ?? [],
            };
        } catch (error) {
            this.handleError(error, 'Failed to get followers IDs');
        }
    }

    /**
     * Validates the existence of a user by their ID.
     *
     * @param userId - The unique identifier of the user to validate.
     * @returns A promise that resolves to the found {@link User} entity.
     * @throws {BadRequestException} If the userId is not provided.
     * @throws {NotFoundException} If no user is found with the given ID.
     */
    private async validateUser(userId: number): Promise<User> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        const user = await this.userRepository.findOne({ where: { id: Equal(userId) } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    /**
     * Validates the existence of a report by its ID.
     *
     * @param reportId - The unique identifier of the report to validate.
     * @returns A promise that resolves to the found {@link Report} entity.
     * @throws {BadRequestException} If the report ID is not provided.
     * @throws {NotFoundException} If no report is found with the given ID.
     */
    private async validateReport(reportId: number): Promise<Report> {
        if (!reportId) {
            throw new BadRequestException('Report ID is required');
        }

        const report = await this.reportRepository.findOne({ where: { id: Equal(reportId) } });
        if (!report) {
            throw new NotFoundException(`Report with ID ${reportId} not found`);
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

    /**
     * Handles errors by rethrowing specific known exceptions or throwing a generic BadRequestException.
     *
     * @param error - The error object to handle.
     * @param defaultMessage - The default error message to use if the error is not a known exception.
     * @throws NotFoundException | ConflictException | BadRequestException - Rethrows if the error is one of these types.
     * @throws BadRequestException - Throws with the provided default message if the error is not a known exception.
     */
    private handleError(error: unknown, defaultMessage: string): never {
        if (
            error instanceof NotFoundException ||
            error instanceof ConflictException ||
            error instanceof BadRequestException
        ) {
            this.logger.error(`Handled error: ${error.message}`, error.stack);
            throw error;
        }
        this.logger.error(
            `Unhandled error: ${defaultMessage}`,
            error instanceof Error ? error.stack : undefined,
        );
        throw new BadRequestException(defaultMessage);
    }
}

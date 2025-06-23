import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import {
    FollowActionResponseDto,
    FollowStatusResponseDto,
    ReportFollowerDto,
    UserFollowedReportsResponseDto,
} from '../dto';

/**
 * Service token for dependency injection of follows service.
 * Used with NestJS @Inject decorator to provide IFollowsService implementation.
 */
export const FOLLOWS_SERVICE = 'FOLLOWS_SERVICE';

/**
 * Interface defining the contract for follow service implementations.
 * Provides comprehensive follow management functionality for user-report relationships.
 *
 * Follow service interface providing:
 * - Follow/unfollow actions between users and reports
 * - Follow status checking and relationship queries
 * - Follower listing and notification management
 * - Bulk operations for follow relationship management
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class FollowsService implements IFollowsService {
 *   async followReport(userId: number, reportId: number): Promise<FollowActionResponseDto> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IFollowsService {
    /**
     * Creates a follow relationship between a user and a report.
     * Allows users to subscribe to report updates and notifications.
     * Prevents duplicate follows and validates both user and report existence.
     *
     * @param userId The unique identifier of the user creating the follow
     * @param reportId The unique identifier of the report to follow
     * @returns Follow action result with success status and relationship info
     * @throws {AppException} USR001 - When user does not exist
     * @throws {AppException} REP001 - When report does not exist
     * @throws {AppException} REP004 - When user is already following the report
     *
     * @example
     * ```typescript
     * const result = await followsService.followReport(123, 456);
     * console.log(`Follow successful: ${result.success}`);
     * ```
     */
    followReport(userId: number, reportId: number): Promise<FollowActionResponseDto>;

    /**
     * Removes a follow relationship between a user and a report.
     * Unsubscribes user from report notifications and updates.
     * Gracefully handles cases where follow relationship doesn't exist.
     *
     * @param userId The unique identifier of the user removing the follow
     * @param reportId The unique identifier of the report to unfollow
     * @returns Unfollow action result with success status
     * @throws {AppException} USR001 - When user does not exist
     * @throws {AppException} REP001 - When report does not exist
     * @throws {AppException} REP005 - When user is not following the report
     *
     * @example
     * ```typescript
     * const result = await followsService.unfollowReport(123, 456);
     * console.log(`Unfollow successful: ${result.success}`);
     * ```
     */
    unfollowReport(userId: number, reportId: number): Promise<FollowActionResponseDto>;

    /**
     * Checks the follow relationship status between a user and a report.
     * Returns whether the user is currently following the specified report.
     * Used for UI state management and permission checking.
     *
     * @param userId The unique identifier of the user to check
     * @param reportId The unique identifier of the report to check
     * @returns Follow status with boolean indicator and relationship metadata
     * @throws {AppException} GEN002 - When user ID or report ID is missing or invalid
     *
     * @example
     * ```typescript
     * const status = await followsService.isFollowingReport(123, 456);
     * if (status.isFollowing) {
     *   console.log('User is following this report');
     * }
     * ```
     */
    isFollowingReport(userId: number, reportId: number): Promise<FollowStatusResponseDto>;

    /**
     * Retrieves all users following a specific report with detailed information.
     * Returns follower list with user profiles for display and notification purposes.
     * Includes pagination support for reports with many followers.
     *
     * @param reportId The unique identifier of the report
     * @param options Pagination configuration including page number and limit
     * @returns Paginated follower information including user profiles and follow dates
     * @throws {AppException} REP001 - When report does not exist
     *
     * @example
     * ```typescript
     * const paginationOptions = { page: 1, limit: 10 };
     * const followers = await followsService.getReportFollowers(456, paginationOptions);
     * console.log(`Report has ${followers.meta.totalItems} followers`);
     * followers.items.forEach(user => console.log(user.name));
     * ```
     */
    getReportFollowers(
        reportId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<ReportFollowerDto>>;

    /**
     * Retrieves all reports followed by a specific user with report details.
     * Returns user's followed reports for dashboard and notification management.
     * Includes report status and recent activity information.
     *
     * @param userId The unique identifier of the user
     * @returns Complete followed reports information with report details and follow dates
     * @throws {AppException} USR001 - When user does not exist
     *
     * @example
     * ```typescript
     * const followedReports = await followsService.getUserFollowedReports(123);
     * console.log(`User follows ${followedReports.count} reports`);
     * followedReports.reports.forEach(report => console.log(report.title));
     * ```
     */
    getUserFollowedReports(
        userId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<UserFollowedReportsResponseDto>>;
}

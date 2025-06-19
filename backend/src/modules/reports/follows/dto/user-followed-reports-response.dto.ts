import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user's followed reports responses.
 * Contains array of report IDs and total count for dashboard and notifications.
 *
 * @class UserFollowedReportsResponseDto
 * @description User followed reports response DTO providing:
 * - Array of report IDs that user follows
 * - Total count for pagination and display
 * - Dashboard data for user engagement
 * - Notification subscription management
 *
 * @example
 * ```typescript
 * const followedReports: UserFollowedReportsResponseDto = {
 *   reports: [123, 456, 789, 101112],
 *   total: 4
 * };
 *
 * // Usage in dashboard
 * console.log(`User follows ${followedReports.total} reports`);
 *
 * // Get detailed report information
 * const reportDetails = await Promise.all(
 *   followedReports.reports.map(id => reportsService.findById(id))
 * );
 *
 * // Set up notifications
 * followedReports.reports.forEach(reportId => {
 *   notificationService.subscribeToReportUpdates(userId, reportId);
 * });
 * ```
 */
export class UserFollowedReportsResponseDto {
    @ApiProperty({
        description: 'Array of report IDs that the user is currently following',
        example: [123, 456, 789, 101112],
        type: [Number],
        isArray: true,
    })
    reports: number[];

    @ApiProperty({
        description: 'Total number of reports the user is following',
        example: 4,
        type: Number,
        minimum: 0,
    })
    total: number;
}

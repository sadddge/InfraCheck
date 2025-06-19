import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for report follower IDs responses.
 * Contains array of follower user IDs for bulk operations and notifications.
 *
 * @class ReportFollowersIdsResponseDto
 * @description Report follower IDs response DTO providing:
 * - Array of user IDs for efficient processing
 * - Bulk notification system support
 * - Optimized data structure for backend operations
 *
 * @example
 * ```typescript
 * const followerIds: ReportFollowersIdsResponseDto = {
 *   userIds: [123, 456, 789, 101112]
 * };
 *
 * // Usage for bulk notifications
 * await notificationService.sendBulkNotifications(
 *   followerIds.userIds,
 *   'Report status updated',
 *   { reportId: 456, newStatus: 'IN_PROGRESS' }
 * );
 *
 * // Usage for analytics
 * analyticsService.trackEngagement(reportId, followerIds.userIds.length);
 * ```
 */
export class ReportFollowersIdsResponseDto {
    @ApiProperty({
        description: 'Array of follower user IDs for bulk operations',
        example: [123, 456, 789, 101112],
        type: [Number],
        isArray: true,
    })
    userIds: number[];
}

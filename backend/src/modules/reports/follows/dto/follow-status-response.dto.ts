import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for follow status check responses.
 * Contains boolean indicator of follow relationship status.
 *
 * @class FollowStatusResponseDto
 * @description Follow status response DTO providing:
 * - Boolean follow status indicator
 * - UI state management support
 * - Conditional rendering information
 *
 * @example
 * ```typescript
 * const status: FollowStatusResponseDto = {
 *   isFollowing: true
 * };
 *
 * // Usage in UI
 * if (status.isFollowing) {
 *   showUnfollowButton();
 * } else {
 *   showFollowButton();
 * }
 * ```
 */
export class FollowStatusResponseDto {
    @ApiProperty({
        description: 'Indicates whether the user is currently following the report',
        example: true,
        type: Boolean,
    })
    isFollowing: boolean;
}

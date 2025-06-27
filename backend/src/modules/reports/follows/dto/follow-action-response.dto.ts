import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for follow/unfollow action responses.
 * Contains success message and operation status for user feedback.
 *
 * @class FollowActionResponseDto
 * @description Follow action response DTO providing:
 * - Success message for user feedback
 * - Operation confirmation for UI updates
 * - Consistent response format for follow operations
 *
 * @example
 * ```typescript
 * const response: FollowActionResponseDto = {
 *   message: 'Report followed successfully'
 * };
 *
 * // Usage in controller
 * return await this.followsService.followReport(userId, reportId);
 * // Returns: { message: 'Report followed successfully' }
 * ```
 */
export class FollowActionResponseDto {
    @ApiProperty({
        description: 'Message indicating the result of the follow/unfollow action',
        example: 'Report followed successfully',
        type: String,
    })
    message: string;
}

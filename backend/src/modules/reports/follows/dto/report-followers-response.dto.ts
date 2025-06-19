import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for report followers list responses.
 * Contains array of follower names for display purposes.
 *
 * @class ReportFollowersResponseDto
 * @description Report followers response DTO providing:
 * - List of follower names for UI display
 * - Community engagement information
 * - Social proof for report credibility
 *
 * @example
 * ```typescript
 * const followers: ReportFollowersResponseDto = {
 *   followers: ['Juan Pérez', 'María González', 'Carlos Rodríguez']
 * };
 *
 * // Usage in UI
 * console.log(`This report has ${followers.followers.length} followers`);
 * followers.followers.forEach(name => console.log(`Follower: ${name}`));
 * ```
 */
export class ReportFollowersResponseDto {
    @ApiProperty({
        description: 'Array of follower names for the report',
        example: ['Juan Pérez', 'María González', 'Carlos Rodríguez'],
        type: [String],
        isArray: true,
    })
    followers: string[];
}

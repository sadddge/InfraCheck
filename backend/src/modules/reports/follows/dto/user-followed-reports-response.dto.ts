import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user followed reports response.
 * Contains the report identifier for reports that a user is following.
 */
export class UserFollowedReportsResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the report followed by the user',
        example: 1,
        type: Number,
    })
    reportId: number;
}

import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object representing a follower in a report.
 * Contains basic information about a user who follows another user.
 */
export class ReportFollowerDto {
    @ApiProperty({
        description: 'User ID of the follower',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: 'Username of the follower',
        example: 'Juan Pérez',
    })
    username: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class UserFollowedReportsResponseDto {
    @ApiProperty({
        description: 'List of report IDs that the user is following',
        example: [5, 12, 18, 25],
        type: [Number],
    })
    reports: number[];

    @ApiProperty({
        description: 'Total number of reports the user is following',
        example: 4,
    })
    total: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class ReportFollowersIdsResponseDto {
    @ApiProperty({
        description: 'List of follower user IDs',
        example: [1, 15, 23, 42],
        type: [Number],
    })
    followers: number[];
}

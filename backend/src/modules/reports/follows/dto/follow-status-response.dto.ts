import { ApiProperty } from '@nestjs/swagger';

export class FollowStatusResponseDto {
    @ApiProperty({
        description: 'Indicates whether the user is following the report',
        example: true,
    })
    isFollowing: boolean;
}

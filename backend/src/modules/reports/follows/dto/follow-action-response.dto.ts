import { ApiProperty } from '@nestjs/swagger';

export class FollowActionResponseDto {
    @ApiProperty({
        description: 'Message indicating the result of the follow/unfollow action',
        example: 'Report followed successfully',
    })
    message: string;
}

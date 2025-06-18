import { ApiProperty } from '@nestjs/swagger';

export class ReportFollowersResponseDto {
    @ApiProperty({
        description: 'List of follower names',
        example: ['Juan Pérez', 'María González', 'Carlos Rodríguez'],
        type: [String],
    })
    followers: string[];
}

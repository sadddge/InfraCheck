import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enums';

export class UpdateUserStatusDto {
    @ApiProperty({
        description: 'New status for the user',
        example: UserStatus.ACTIVE,
        enum: UserStatus,
        required: true,
    })
    @IsEnum(UserStatus)
    status: UserStatus;
}

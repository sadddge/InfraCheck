import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from 'src/common/enums/user-status.enums';

export class UserQueryDto {
    @ApiPropertyOptional({
        enum: UserStatus,
        description: 'Filter users by status (e.g., ACTIVE, PENDING_APPROVAL)',
        example: UserStatus.PENDING_APPROVAL,
    })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';

export class UserDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: 1,
        type: Number,
    })
    id: number;
    @ApiProperty({
        description: 'User phone number in E.164 format',
        example: '+56912345678',
        type: String,
    })
    phoneNumber: string;
    @ApiProperty({
        description: 'User name',
        example: 'Juan',
        type: String,
    })
    name: string;
    @ApiProperty({
        description: 'User last name',
        example: 'Pérez',
        type: String,
    })
    lastName: string;
    @ApiProperty({
        description: 'User role',
        example: 'NEIGHBOR',
        enum: Role,
    })
    role: string;
    @ApiProperty({
        description: 'User status',
        example: 'ACTIVE',
        enum: UserStatus,
    })
    status: string;
    @ApiProperty({
        description: 'Date when the user was created',
        example: '2023-10-01T12:00:00Z',
        type: String,
        format: 'date-time',
    })
    createdAt: Date;
    @ApiProperty({
        description: 'Date when the user password was last updated',
        example: '2023-10-01T12:00:00Z',
        type: String,
        format: 'date-time',
    })
    passwordUpdatedAt: Date | null;
}

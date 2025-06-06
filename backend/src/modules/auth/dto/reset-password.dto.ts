import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'The token for resetting the password',
        example: '1234567890abcdef',
        minLength: 6,
        maxLength: 64,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    token: string;
    @ApiProperty({
        description: 'The new password to set',
        example: 'newSecurePassword123',
        minLength: 6,
        required: true,
    })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}

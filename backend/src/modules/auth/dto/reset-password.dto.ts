import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}

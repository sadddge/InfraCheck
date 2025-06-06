import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyRecoverPasswordDto {
    @ApiProperty({
        description: 'User phone number in E.164 format',
        example: '+56912345678',
        required: true,
        type: String,
        pattern: '^\\+569\\d{8}$', // Matches Chilean phone numbers starting with +569
        minLength: 12,
        maxLength: 13,
    })
    @IsPhoneNumber('CL')
    phoneNumber: string;
    @ApiProperty({
        description: 'Verification code sent to the user',
        example: '123456',
        required: true,
        type: String,
        pattern: '^[0-9]{6}$', // Matches exactly 6 digits
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6, { message: 'Code must be exactly 6 characters long.' })
    code: string;
}

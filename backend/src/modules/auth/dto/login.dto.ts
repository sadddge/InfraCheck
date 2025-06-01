import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class LoginDto {
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
        description: 'User password',
        example: 'securePassword123',
        required: true,
        type: String,
    })
    @IsNotEmpty()
    password: string;
}

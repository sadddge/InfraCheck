import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class RegisterDto {
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
    @Length(6, 20)
    password: string;
    @ApiProperty({
        description: 'User name',
        example: 'Juan',
        required: true,
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    @Length(2, 50)
    name: string;
    @ApiProperty({
        description: 'User last name',
        example: 'Pérez',
        required: true,
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    @Length(2, 50)
    lastName: string;
}

import { ApiProperty } from "@nestjs/swagger";

export class RegisterResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: 1,
        type: Number,
    })
    id: number;
    @ApiProperty({
        description: 'User phone number in E.164 format',
        example: '+56912345678',
        type: String,
        pattern: '^\\+569\\d{8}$', // Matches Chilean phone numbers starting with +569
    })
    phoneNumber: string;
    @ApiProperty({
        description: 'User name',
        example: 'Juan',
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    name: string;
    @ApiProperty({
        description: 'User last name',
        example: 'Pérez',
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    lastName: string;
    @ApiProperty({
        description: 'User role',
        example: 'user',
        type: String,
        enum: ['NEIGHBOR', 'ADMIN'],
    })
    role: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber } from "class-validator";

export class RecoverPasswordDto {
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
}
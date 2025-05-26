import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'User name to update',
        example: 'Juan',
        required: false,
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    @Length(2, 50)
    name?: string;
    @ApiProperty({
        description: 'User last name to update',
        example: 'Pérez',
        required: false,
        type: String,
        minLength: 2,
        maxLength: 50,
    })
    @Length(2, 50)
    lastName?: string;
}

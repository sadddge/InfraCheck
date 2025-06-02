import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyRecoverPasswordDto {
    @IsPhoneNumber('CL')
    phoneNumber: string;
    @IsString()
    @Length(6, 6, { message: 'Code must be exactly 6 characters long.' })
    code: string;
}

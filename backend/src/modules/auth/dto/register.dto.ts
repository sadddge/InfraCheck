import { IsPhoneNumber, Length } from 'class-validator';

export class RegisterDto {
    @IsPhoneNumber('CL')
    phoneNumber: string;
    @Length(6, 20)
    password: string;
    @Length(2, 50)
    name: string;
    @Length(2, 50)
    lastName: string;
}

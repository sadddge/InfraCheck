import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class LoginDto {
    @IsPhoneNumber("CL")
    phoneNumber: string;
    @IsNotEmpty()
    password: string;
}
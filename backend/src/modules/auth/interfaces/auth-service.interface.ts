import { User } from 'src/database/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegisterResponseDto } from '../dto/register-reponse.dto';
import { RegisterDto } from '../dto/register.dto';

export const AUTH_SERVICE = 'AUTH_SERVICE';

export interface IAuthService {
    login(dto: LoginDto): Promise<LoginResponseDto>;
    refreshToken(refreshToken: string): Promise<LoginResponseDto>;
    register(dto: RegisterDto): Promise<RegisterResponseDto>;
    getUserIfRefreshTokenMatches(resfreshToken: string, userId: number): Promise<User | null>;
    verifyRegisterCode(phoneNumber: string, code: string): Promise<void>;
    sendResetPasswordCode(phoneNumber: string): Promise<void>;
    verifyResetPasswordCode(phoneNumber: string, code: string): Promise<void>;
    resetPassword(phoneNumber: string, newPassword: string): Promise<void>;
}

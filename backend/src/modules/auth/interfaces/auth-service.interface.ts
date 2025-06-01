import type { User } from 'src/database/entities/user.entity';
import type { LoginDto } from '../dto/login.dto';
import type { LoginResponseDto } from '../dto/login-response.dto';
import type { RegisterResponseDto } from '../dto/register-reponse.dto';
import type { RegisterDto } from '../dto/register.dto';

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

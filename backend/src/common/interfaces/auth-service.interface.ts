import type { User } from 'src/database/entities/user.entity';
import type { LoginResponseDto } from '../../modules/auth/dto/login-response.dto';
import type { LoginDto } from '../../modules/auth/dto/login.dto';
import type { RegisterResponseDto } from '../../modules/auth/dto/register-response.dto';
import type { RegisterDto } from '../../modules/auth/dto/register.dto';

export const AUTH_SERVICE = 'AUTH_SERVICE';

export interface IAuthService {
    login(dto: LoginDto): Promise<LoginResponseDto>;
    refreshToken(refreshToken: string): Promise<LoginResponseDto>;
    register(dto: RegisterDto): Promise<RegisterResponseDto>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null>;
    verifyRegisterCode(phoneNumber: string, code: string): Promise<void>;
    sendResetPasswordCode(phoneNumber: string): Promise<void>;
    generateResetPasswordToken(phoneNumber: string, code: string): Promise<unknown>;
    resetPassword(id: number, newPassword: string): Promise<string>;
}

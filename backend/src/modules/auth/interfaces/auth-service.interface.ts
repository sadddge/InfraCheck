import { User } from "src/database/entities/user.entity";
import { LoginDto } from "../dto/login-dto";
import { LoginResponseDto } from "../dto/login-response.dto";

export const AUTH_SERVICE = 'AUTH_SERVICE';

export interface IAuthService {
    login(dto: LoginDto): Promise<LoginResponseDto>;
    refreshToken(refreshToken: string): Promise<LoginResponseDto>;
    logout(userId: number): Promise<void>;
    getUserIfRefreshTokenMatches(resfreshToken: string, userId: number): Promise<User | null>;
}
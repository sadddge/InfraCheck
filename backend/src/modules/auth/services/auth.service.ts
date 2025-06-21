import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/common/enums/user-status.enums';
import {
    accountNotActive,
    invalidCredentials,
    invalidRefreshToken,
} from 'src/common/helpers/exception.helper';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import type { User } from 'src/database/entities/user.entity';
import { Equal, type Repository } from 'typeorm';
import { type IUserService, USER_SERVICE } from '../../users/interfaces/user-service.interface';
import type { LoginResponseDto } from '../dto/login-response.dto';
import type { LoginDto } from '../dto/login.dto';
import type { IAuthService } from '../interfaces/auth-service.interface';
import { TokenFactoryService } from './token-factory.service';

/**
 * Authentication service handling user registration, login, password recovery, and token management.
 * Implements JWT-based authentication with refresh tokens and SMS verification integration.
 *
 * Core authentication service providing:
 * - User registration with SMS verification
 * - Login with JWT token generation
 * - Password recovery via SMS
 * - Refresh token management
 * - Password reset functionality
 *
 * @example
 * const authService = new AuthService(userService, jwtService, refreshTokenRepo, verificationServices);
 * const loginResult = await authService.login({ phoneNumber: '+1234567890', password: 'password' });
 */
@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly tokenFactory: TokenFactoryService,
    ) {}

    /** @inheritDoc */
    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.validateUserCredentials(dto);
        const tokens = await this.tokenFactory.generateTokenPair(user);
        await this.storeRefreshToken(tokens.refreshToken, user);

        return {
            ...tokens,
            user: this.mapUserToResponse(user),
        };
    }

    /** @inheritDoc */
    async refreshToken(refreshToken: string, userId: number): Promise<LoginResponseDto> {
        // Validate refresh token and get user
        const user = await this.getUserIfRefreshTokenMatches(refreshToken, userId);
        if (!user) {
            invalidRefreshToken();
        }

        // Find the token entity to invalidate it
        const tokenEntity = await this.refreshTokenRepository.findOne({
            where: { token: Equal(refreshToken), user: { id: Equal(userId) } },
        });

        if (tokenEntity) {
            // Invalidate old token
            await this.refreshTokenRepository.delete({ id: tokenEntity.id });
        }

        // Generate new tokens
        const tokens = await this.tokenFactory.generateTokenPair(user);
        await this.storeRefreshToken(tokens.refreshToken, user);

        return {
            ...tokens,
            user: this.mapUserToResponse(user),
        };
    }

    /** @inheritDoc */
    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null> {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: Equal(refreshToken), user: { id: Equal(userId) } },
            relations: ['user'],
        });

        return token && token.expiresAt > new Date() ? token.user : null;
    }

    private async validateUserCredentials(dto: LoginDto): Promise<User> {
        let user: User;
        try {
            user = await this.usersService.findByPhoneNumberWithPassword(dto.phoneNumber);
        } catch (error) {
            if (error.code === 'USR001') {
                invalidCredentials();
            }
            throw error;
        }

        if (!(await bcrypt.compare(dto.password, user.password))) {
            invalidCredentials();
        }

        if (user.status !== UserStatus.ACTIVE) {
            accountNotActive();
        }

        return user;
    }

    private async storeRefreshToken(refreshToken: string, user: User): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({
                token: refreshToken,
                user,
                expiresAt,
            }),
        );
    }

    private mapUserToResponse(user: User) {
        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
        };
    }
}

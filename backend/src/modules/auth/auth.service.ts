import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { JwtRefreshPayload } from 'src/common/interfaces/jwt-payload.interface';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import type { User } from 'src/database/entities/user.entity';
import type { Repository } from 'typeorm';
import type { IAuthService } from '../../common/interfaces/auth-service.interface';
import type { IVerificationService } from '../../common/interfaces/verification-service.interface';
import { type IUserService, USER_SERVICE } from '../users/interfaces/user-service.interface';
import type { LoginResponseDto } from './dto/login-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterResponseDto } from './dto/register-response.dto';
import type { RegisterDto } from './dto/register.dto';

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
    /**
     * Creates a new AuthService instance with required dependencies.
     *
     * @param usersService Service for user management operations
     * @param jwtService JWT service for token generation and validation
     * @param refreshTokenRepository Repository for refresh token persistence
     * @param registerVerificationService SMS verification for registration
     * @param recoverPasswordVerificationService SMS verification for password recovery
     */
    constructor(
        @Inject(USER_SERVICE)
        private readonly usersService: IUserService,
        private readonly jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        @Inject(VERIFICATION.REGISTER_TOKEN)
        private readonly registerVerificationService: IVerificationService,
        @Inject(VERIFICATION.RECOVER_PASSWORD_TOKEN)
        private readonly recoverPasswordVerificationService: IVerificationService,
    ) {}

    /**
     * Authenticates a user and generates access and refresh tokens.
     *
     * @param dto Login credentials containing phone number and password
     * @returns Authentication response with tokens and user data
     * @throws {UnauthorizedException} When credentials are invalid
     *
     * @example
     * const result = await authService.login({
     *   phoneNumber: '+1234567890',
     *   password: 'userPassword123'
     * });
     * console.log(result.accessToken); // JWT access token
     */
    async login(dto: LoginDto): Promise<LoginResponseDto> {
        let user: User;
        try {
            user = await this.usersService.findByPhoneNumberWithPassword(dto.phoneNumber);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new UnauthorizedException('Invalid credentials');
            }
            throw error;
        }

        if (!(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.jwtService.signAsync(
            { sub: user.id, phoneNumber: user.phoneNumber, role: user.role },
            { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: user.id },
            { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
        );

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({
                token: refreshToken,
                user,
                expiresAt,
            }),
        );
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    /**
     * Refreshes an expired access token using a valid refresh token.
     * Validates the refresh token, invalidates the old one, and generates new tokens.
     *
     * @param refreshToken JWT refresh token to validate and exchange
     * @returns New authentication response with fresh tokens
     * @throws {UnauthorizedException} When refresh token is invalid or expired
     *
     * @example
     * ```typescript
     * const newTokens = await authService.refreshToken('eyJhbGciOiJIUzI1NiIs...');
     * console.log(newTokens.accessToken); // New access token
     * ```
     */
    async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
        let payload: JwtRefreshPayload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, user: { id: payload.sub } },
            relations: ['user'],
        });
        if (!token || token.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.refreshTokenRepository.delete({ id: token.id });

        const newAccessToken = await this.jwtService.signAsync(
            {
                sub: token.user.id,
                phoneNumber: token.user.phoneNumber,
                role: token.user.role,
            },
            { expiresIn: '15m', secret: process.env.JWT_SECRET },
        );

        const newRefreshToken = await this.jwtService.signAsync(
            { sub: token.user.id },
            { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
        );
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save(
            this.refreshTokenRepository.create({
                token: newRefreshToken,
                user: token.user,
                expiresAt,
            }),
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: token.user.id,
                phoneNumber: token.user.phoneNumber,
                name: token.user.name,
                lastName: token.user.lastName,
                role: token.user.role,
            },
        };
    }

    /**
     * Registers a new user with encrypted password and initiates SMS verification.
     * Creates user account in pending verification status and sends SMS code.
     *
     * @param dto Registration data containing user information and password
     * @returns Registration response with user data (no tokens)
     * @throws {ConflictException} When phone number or email already exists
     * @throws {InternalServerErrorException} When SMS sending fails
     *
     * @example
     * ```typescript
     * const user = await authService.register({
     *   phoneNumber: '+1234567890',
     *   password: 'securePassword123',
     *   name: 'John',
     *   lastName: 'Doe',
     *   email: 'john@example.com'
     * });
     * console.log(user.id); // New user ID
     * ```
     */
    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.registerNeighbor({
            ...dto,
            password: hashedPassword,
        });

        await this.registerVerificationService.sendVerificationCode(user.phoneNumber);

        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
        };
    }

    /**
     * Validates a refresh token and returns the associated user if valid.
     * Used internally for refresh token validation without generating new tokens.
     *
     * @param refreshToken JWT refresh token to validate
     * @param userId User ID to match against the token
     * @returns User entity if token is valid, null otherwise
     *
     * @example
     * ```typescript
     * const user = await authService.getUserIfRefreshTokenMatches(token, userId);
     * if (user) {
     *   console.log('Token is valid for user:', user.name);
     * }
     * ```
     */
    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null> {
        const token = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken, user: { id: userId } },
            relations: ['user'],
        });

        if (!token || token.expiresAt < new Date()) {
            return null;
        }
        return token.user;
    }

    /**
     * Verifies the SMS code sent during registration and updates user status.
     * Moves user from PENDING_VERIFICATION to PENDING_APPROVAL status.
     *
     * @param phoneNumber Phone number that received the verification code
     * @param code 6-digit verification code from SMS
     * @returns Resolves when verification is successful
     * @throws {UnauthorizedException} When code is invalid or user not found
     * @throws {BadRequestException} When verification code has expired
     *
     * @example
     * ```typescript
     * await authService.verifyRegisterCode('+1234567890', '123456');
     * // User status is now PENDING_APPROVAL
     * ```
     */
    async verifyRegisterCode(phoneNumber: string, code: string): Promise<void> {
        await this.registerVerificationService.verifyCode(phoneNumber, code);
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        user.status = UserStatus.PENDING_APPROVAL;
        await this.usersService.update(user.id, user);
    }

    /**
     * Initiates password recovery by sending SMS verification code.
     * Validates user exists and sends recovery code to registered phone number.
     *
     * @param phoneNumber Phone number for password recovery
     * @returns Resolves when SMS is sent successfully
     * @throws {UnauthorizedException} When user with phone number not found
     * @throws {InternalServerErrorException} When SMS sending fails
     *
     * @example
     * ```typescript
     * await authService.sendResetPasswordCode('+1234567890');
     * // SMS with recovery code sent to user
     * ```
     */
    async sendResetPasswordCode(phoneNumber: string): Promise<void> {
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        await this.recoverPasswordVerificationService.sendVerificationCode(phoneNumber);
    }

    /**
     * Verifies password recovery code and generates a reset token.
     * Validates the SMS code and returns a JWT token for password reset.
     *
     * @param phoneNumber Phone number that received the recovery code
     * @param code 6-digit verification code from SMS
     * @returns Object containing reset token and success message
     * @throws {UnauthorizedException} When code is invalid or user not found
     * @throws {BadRequestException} When verification code has expired
     *
     * @example
     * ```typescript
     * const result = await authService.generateResetPasswordToken('+1234567890', '123456');
     * console.log(result.token); // JWT reset token valid for 15 minutes
     * ```
     */
    async generateResetPasswordToken(phoneNumber: string, code: string): Promise<unknown> {
        await this.recoverPasswordVerificationService.verifyCode(phoneNumber, code);
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const payload = {
            sub: user.id,
            scope: 'reset_password' as const,
        };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: process.env.JWT_RESET_SECRET,
        });
        return {
            token,
            message: 'Password reset token generated successfully',
        };
    }

    /**
     * Resets user password using a validated reset token.
     * Updates password with bcrypt encryption and timestamp.
     *
     * @param id User ID from the reset token payload
     * @param newPassword New plain text password to encrypt and save
     * @returns Success message when password is updated
     * @throws {NotFoundException} When user with ID not found
     * @throws {InternalServerErrorException} When password update fails
     *
     * @example
     * ```typescript
     * const message = await authService.resetPassword(123, 'newSecurePassword456');
     * console.log(message); // "Password reset successful"
     * ```
     */
    async resetPassword(id: number, newPassword: string): Promise<string> {
        const user = await this.usersService.findByIdWithPassword(id);
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newHashedPassword;
        user.passwordUpdatedAt = new Date();

        await this.usersService.update(user.id, user);
        return 'Password reset successful';
    }
}

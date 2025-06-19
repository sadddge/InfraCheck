import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/database/entities/user.entity';
import { JwtConfig, jwtConfig } from '../config/jwt.config';

/**
 * Token factory service providing secure JWT token generation for authentication workflows.
 * Handles creation of access tokens, refresh tokens, and specialized tokens for various operations.
 *
 * Token types generated:
 * - Access tokens: Short-lived tokens for API authentication (15 minutes default)
 * - Refresh tokens: Long-lived tokens for session renewal (7 days default)
 * - Reset password tokens: Special tokens for password reset workflow (15 minutes default)
 *
 * Security features:
 * - Different secrets for different token types
 * - Configurable expiration times per token type
 * - Minimal payload to reduce token size
 * - Role-based access control information in access tokens
 *
 * @example
 * ```typescript
 * const tokenFactory = new TokenFactoryService(jwtService, configService);
 *
 * // Generate token pair for login
 * const { accessToken, refreshToken } = await tokenFactory.generateTokenPair(user);
 *
 * // Generate password reset token
 * const resetToken = await tokenFactory.generateResetPasswordToken(user);
 * ```
 */
@Injectable()
export class TokenFactoryService {
    /** JWT configuration settings loaded from environment variables */
    private readonly jwtConfig: JwtConfig;

    /**
     * Creates a new TokenFactoryService instance.
     *
     * @param jwtService NestJS JWT service for token signing and verification
     * @param configService Configuration service for accessing environment variables
     */
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.jwtConfig = jwtConfig(this.configService);
    }

    /**
     * Generates a complete token pair for user authentication.
     * Creates both access and refresh tokens simultaneously for login operations.
     * Access token contains user role for authorization, refresh token contains minimal data.
     *
     * @param user User entity for whom to generate tokens
     * @returns Object containing both access and refresh tokens
     *
     * @example
     * ```typescript
     * const user = await userService.findById(123);
     * const tokens = await tokenFactory.generateTokenPair(user);
     *
     * // Store refresh token in database
     * await saveRefreshToken(user.id, tokens.refreshToken);
     *
     * // Return access token to client
     * res.json({
     *   accessToken: tokens.accessToken,
     *   refreshToken: tokens.refreshToken,
     *   expiresIn: '15m'
     * });
     * ```
     */
    async generateTokenPair(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        return { accessToken, refreshToken };
    }

    /**
     * Generates a specialized token for password reset operations.
     * Creates a short-lived token with limited scope for secure password changes.
     * Token contains user ID and reset scope for validation.
     *
     * @param user User entity for whom to generate reset token
     * @returns JWT reset token valid for password reset operations
     *
     * @example
     * ```typescript
     * // After SMS verification succeeds
     * const user = await userService.findByPhoneNumber(phoneNumber);
     * const resetToken = await tokenFactory.generateResetPasswordToken(user);
     *
     * // Return to client for password reset form
     * res.json({
     *   token: resetToken,
     *   expiresIn: '15m',
     *   message: 'Use this token to reset your password'
     * });
     *
     * // Client includes token in Authorization header for password reset
     * ```
     */
    async generateResetPasswordToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            scope: 'reset_password' as const,
        };
        return this.jwtService.signAsync(payload, {
            expiresIn: this.jwtConfig.resetTokenExpiration,
            secret: this.jwtConfig.resetSecret,
        });
    }

    /**
     * Generates short-lived access token for API authentication.
     * Contains user identity, role, and permissions for authorization.
     * Used for accessing protected endpoints and role-based access control.
     *
     * @param user User entity for whom to generate access token
     * @returns JWT access token with user identity and role information
     *
     * @example
     * ```typescript
     * const accessToken = await tokenFactory.generateAccessToken(user);
     *
     * // Token payload includes:
     * // - sub: user.id (user identifier)
     * // - phoneNumber: user.phoneNumber (for logging)
     * // - role: user.role (for authorization)
     * // - exp: expiration timestamp
     * // - iat: issued at timestamp
     * ```
     */
    private async generateAccessToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            {
                expiresIn: this.jwtConfig.accessTokenExpiration,
                secret: this.jwtConfig.secret,
            },
        );
    }

    /**
     * Generates long-lived refresh token for session renewal.
     * Contains minimal user information for security and token size optimization.
     * Used to generate new access tokens without requiring re-authentication.
     *
     * @param user User entity for whom to generate refresh token
     * @returns JWT refresh token with minimal payload
     *
     * @example
     * ```typescript
     * const refreshToken = await tokenFactory.generateRefreshToken(user);
     *
     * // Token payload includes:
     * // - sub: user.id (user identifier only)
     * // - exp: expiration timestamp (7 days default)
     * // - iat: issued at timestamp
     *
     * // Store in database for revocation management
     * await refreshTokenRepository.save({
     *   userId: user.id,
     *   token: refreshToken,
     *   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
     * });
     * ```
     */
    private async generateRefreshToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
            { sub: user.id },
            {
                expiresIn: this.jwtConfig.refreshTokenExpiration,
                secret: this.jwtConfig.refreshSecret,
            },
        );
    }
}

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_SERVICE, type IAuthService } from '../../../common/interfaces/auth-service.interface';

/**
 * @class JwtRefreshStrategy
 * @description Passport strategy for validating JWT refresh tokens in the authentication flow.
 * Handles the secure refresh token validation process, extracting tokens from request body,
 * verifying against stored refresh tokens, and returning authenticated user information.
 * Essential for maintaining user sessions without frequent re-authentication.
 *
 * @extends {PassportStrategy}
 * @implements {Strategy}
 *
 * @example
 * ```typescript
 * // Used automatically by NestJS when jwt-refresh guard is applied
 * @UseGuards(JwtRefreshGuard)
 * @Post('refresh')
 * async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
 *   // Strategy validates the refresh token and populates req.user
 *   return this.authService.generateNewTokens(req.user);
 * }
 *
 * // The strategy extracts refresh token from request body:
 * // POST /auth/refresh
 * // { "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    /**
     * @constructor
     * @description Initializes the JWT refresh strategy with configuration and dependencies.
     * Sets up token extraction from request body, configures JWT secret for refresh tokens,
     * and enables request callback for additional validation logic.
     *
     * @param {ConfigService} config - Configuration service for accessing environment variables
     * @param {IAuthService} authService - Authentication service for user validation and token management
     *
     * @example
     * ```typescript
     * // Configuration expects these environment variables:
     * // JWT_REFRESH_SECRET=your-refresh-secret-key
     *
     * // Token extracted from request body field 'refreshToken'
     * // POST /auth/refresh
     * // { "refreshToken": "valid-jwt-refresh-token" }
     * ```
     */
    constructor(
        private readonly config: ConfigService,
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    /**
     * @async
     * @method validate
     * @description Validates the refresh token and returns the associated user.
     * Extracts the refresh token from request body, verifies it against stored tokens,
     * and returns user information if validation succeeds. Throws UnauthorizedException
     * for invalid or expired refresh tokens.
     *
     * @param {Request} req - Express request object containing the refresh token
     * @param {Object} payload - Decoded JWT payload containing user information
     * @param {number} payload.sub - User ID from JWT subject claim
     * @returns {Promise<User>} The authenticated user object
     * @throws {UnauthorizedException} When refresh token is invalid, expired, or user not found
     *
     * @example
     * ```typescript
     * // Successful validation flow:
     * // 1. Extract refresh token from req.body.refreshToken
     * // 2. Extract user ID from JWT payload.sub
     * // 3. Verify token matches stored refresh token for user
     * // 4. Return user object for downstream handlers
     *
     * // Error scenarios:
     * // - Refresh token doesn't match stored token
     * // - Token has been revoked
     * // - User account has been deleted
     * // - Token format is invalid
     * ```
     */
    async validate(req: Request, payload: { sub: number; [key: string]: unknown }) {
        const refreshToken: string = req.body.refreshToken;
        const userId: number = payload.sub;
        const user = await this.authService.getUserIfRefreshTokenMatches(refreshToken, userId);
        if (!user) throw new UnauthorizedException();
        return user;
    }
}

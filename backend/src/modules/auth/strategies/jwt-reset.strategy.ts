import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { JwtResetPayload } from '../../../common/interfaces/jwt-payload.interface';

/**
 * @class JwtResetStrategy
 * @description Passport strategy for validating JWT tokens used in password reset flow.
 * Handles secure password reset token validation, ensuring tokens are properly scoped,
 * users are eligible for password reset, and tokens haven't been invalidated by
 * recent password changes. Critical for maintaining security in password recovery.
 *
 * @extends {PassportStrategy}
 * @implements {Strategy}
 *
 * @example
 * ```typescript
 * // Used automatically by NestJS when jwt-reset guard is applied
 * @UseGuards(JwtResetGuard)
 * @Post('reset-password')
 * async resetPassword(@Body() resetDto: ResetPasswordDto) {
 *   // Strategy validates the reset token and populates req.user
 *   return this.authService.resetPassword(req.user.id, resetDto.newPassword);
 * }
 *
 * // The strategy extracts reset token from request body:
 * // POST /auth/reset-password
 * // { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "newPassword": "newpass123" }
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class JwtResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
    /**
     * @constructor
     * @description Initializes the JWT reset strategy with configuration and user service.
     * Sets up token extraction from request body, configures JWT secret for reset tokens,
     * and prepares validation logic for password reset flow.
     *
     * @param {ConfigService} configService - Configuration service for accessing environment variables
     * @param {IUserService} usersService - User service for user validation and status checking
     *
     * @example
     * ```typescript
     * // Configuration expects these environment variables:
     * // JWT_RESET_SECRET=your-reset-secret-key
     *
     * // Token extracted from request body field 'token'
     * // POST /auth/reset-password
     * // { "token": "valid-jwt-reset-token", "newPassword": "newpass123" }
     * ```
     */
    constructor(
        private readonly configService: ConfigService,
        @Inject(USER_SERVICE)
        private readonly usersService: IUserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('token'),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_RESET_SECRET'),
        });
    }

    /**
     * @async
     * @method validate
     * @description Validates the password reset token and returns user information.
     * Performs comprehensive validation including token scope verification, user status
     * checking, and ensuring the token hasn't been invalidated by recent password changes.
     * Essential for secure password reset flow.
     *
     * @param {JwtResetPayload} payload - Decoded JWT payload containing reset information
     * @param {string} payload.scope - Token scope, must be 'reset_password'
     * @param {string} payload.sub - User ID as string
     * @param {number} payload.iat - Token issued at timestamp
     * @returns {Promise<{user: {id: number}}>} User information for password reset
     * @throws {UnauthorizedException} When token is invalid, user ineligible, or token expired
     *
     * @example
     * ```typescript
     * // Successful validation checks:
     * // 1. Token scope is 'reset_password'
     * // 2. User exists and is active or pending approval
     * // 3. Token was issued before any recent password changes
     * // 4. Token hasn't expired (handled by passport-jwt)
     *
     * // Error scenarios:
     * // - Wrong token scope (not for password reset)
     * // - User account deleted or suspended
     * // - Password already changed after token issued
     * // - Token expired or malformed
     * ```
     */
    async validate(payload: JwtResetPayload) {
        if (payload.scope !== 'reset_password') {
            throw new UnauthorizedException('Invalid token scope');
        }
        const id = Number(payload.sub);
        const user = await this.usersService.findById(id);
        if (
            !user ||
            (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_APPROVAL)
        ) {
            throw new UnauthorizedException('User not found or inactive');
        }

        const pwdChangedAt = user.passwordUpdatedAt?.getTime() ?? 0;
        if (pwdChangedAt >= payload.iat * 1000) {
            throw new UnauthorizedException('Password has already been changed');
        }

        return {
            user: {
                id: user.id,
            },
        };
    }
}

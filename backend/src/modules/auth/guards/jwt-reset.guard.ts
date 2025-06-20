import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { invalidResetToken } from 'src/common/helpers/exception.helper';

/**
 * @class JwtResetGuard
 * @description Authentication guard for protecting password reset endpoints.
 * Validates password reset tokens using the JwtResetStrategy and ensures only
 * valid, unexpired reset tokens can be used to change user passwords. Critical
 * for maintaining security in the password recovery flow.
 *
 * @extends {AuthGuard}
 *
 * @example
 * ```typescript
 * // Protecting password reset endpoint
 * @UseGuards(JwtResetGuard)
 * @Post('reset-password')
 * async resetPassword(@Req() req: Request, @Body() resetDto: ResetPasswordDto) {
 *   // req.user is populated by the guard after successful token validation
 *   return this.authService.resetPassword(req.user.user.id, resetDto.newPassword);
 * }
 *
 * // Client usage:
 * // POST /auth/reset-password
 * // {
 * //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * //   "newPassword": "newSecurePassword123"
 * // }
 *
 * // Guard validation flow:
 * // 1. Extract reset token from request body
 * // 2. Verify token signature and expiration
 * // 3. Check token scope is 'reset_password'
 * // 4. Verify user exists and is eligible
 * // 5. Ensure token wasn't invalidated by recent password change
 * // 6. Populate req.user with user information
 * // 7. Allow access to password reset endpoint
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class JwtResetGuard extends AuthGuard('jwt-reset') {
    private readonly logger = new Logger(JwtResetGuard.name);

    /**
     * Handles the authentication result from the JWT reset strategy.
     * Provides enhanced error handling and logging for reset token validation.
     *
     * @param err - Authentication error, if any
     * @param user - Authenticated user object from reset token
     * @returns {unknown} Validated user object
     * @throws {UnauthorizedException} When reset token validation fails
     */
    handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
        if (err || !user) {
            const errorMessage = err instanceof Error ? err.message : 'User not found';
            this.logger.warn(`Reset token validation failed: ${errorMessage}`);
            throw err ?? invalidResetToken();
        }
        return user as TUser;
    }
}

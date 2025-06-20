import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { invalidRefreshToken } from 'src/common/helpers/exception.helper';

/**
 * @class JwtRefreshGuard
 * @description Authentication guard for protecting refresh token endpoints.
 * Validates refresh tokens using the JwtRefreshStrategy and ensures only
 * valid refresh tokens can be used to obtain new access tokens. Essential
 * for maintaining secure token refresh flow in the authentication system.
 *
 * @extends {AuthGuard}
 *
 * @example
 * ```typescript
 * // Protecting refresh token endpoint
 * @UseGuards(JwtRefreshGuard)
 * @Post('refresh')
 * async refreshToken(@Req() req: Request, @Body() refreshTokenDto: RefreshTokenDto) {
 *   // req.user is populated by the guard after successful validation
 *   return this.authService.refreshTokens(req.user);
 * }
 *
 * // Client usage:
 * // POST /auth/refresh
 * // {
 * //   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * // }
 *
 * // Guard validation flow:
 * // 1. Extract refresh token from request body
 * // 2. Verify token signature and expiration
 * // 3. Check if token matches stored refresh token
 * // 4. Populate req.user with authenticated user
 * // 5. Allow access to protected endpoint
 * ```
 *
 * @since 1.0.0
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
    private readonly logger = new Logger(JwtRefreshGuard.name); /**
     * Handles the authentication result from the JWT refresh strategy.
     * Provides enhanced error handling and logging for refresh token validation.
     *
     * @param err - Authentication error, if any
     * @param user - Authenticated user object from refresh token
     * @returns {unknown} Validated user object
     * @throws {UnauthorizedException} When refresh token validation fails
     */
    handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
        if (err || !user) {
            const errorMessage = err instanceof Error ? err.message : 'User not found';
            this.logger.warn(`Refresh token validation failed: ${errorMessage}`);
            throw err ?? invalidRefreshToken();
        }
        return user as TUser;
    }
}

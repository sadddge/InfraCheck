import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}

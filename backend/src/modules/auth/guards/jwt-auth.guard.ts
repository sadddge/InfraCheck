import { type ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

/**
 * JWT authentication guard that validates access tokens and handles public endpoints.
 * Extends Passport's AuthGuard to provide JWT-based authentication with public endpoint support.
 *
 * @class JwtAuthGuard
 * @extends {AuthGuard('jwt')}
 * @description JWT authentication guard providing:
 * - Access token validation using JWT strategy
 * - Support for public endpoints (bypass authentication)
 * - Automatic request enrichment with user data
 * - Comprehensive error handling and logging
 *
 * @example
 * ```typescript
 * @Controller('protected')
 * @UseGuards(JwtAuthGuard)
 * export class ProtectedController {
 *   @Get('data')
 *   getData(@Request() req) {
 *     // req.user contains authenticated user data
 *   }
 *
 *   @Public() // Bypasses JWT authentication
 *   @Get('public')
 *   getPublicData() { ... }
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    /** Logger instance for authentication debugging */
    private readonly logger = new Logger(JwtAuthGuard.name);

    /**
     * Creates a new JwtAuthGuard instance.
     *
     * @param {Reflector} reflector - NestJS reflector for reading metadata
     */
    constructor(private readonly reflector: Reflector) {
        super();
    }

    /**
     * Determines if the request should be authenticated.
     * Checks for @Public() decorator and bypasses authentication if found.
     *
     * @param {ExecutionContext} context - NestJS execution context
     * @returns {boolean | Promise<boolean> | Observable<boolean>} Authentication requirement
     *
     * @example
     * ```typescript
     * // Public endpoint - returns true immediately
     * @Public()
     * @Get('health')
     *
     * // Protected endpoint - validates JWT token
     * @Get('profile')
     * ```
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        this.logger.debug(`isPublic: ${isPublic}`);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    /**
     * Handles the authentication result from the JWT strategy.
     * Processes successful authentication or throws appropriate errors.
     *
     * @template TUser - Type of the authenticated user object
     * @param {unknown} err - Authentication error, if any
     * @param {unknown} user - Authenticated user object from JWT payload
     * @returns {TUser} Validated user object
     * @throws {UnauthorizedException} When authentication fails
     *
     * @example
     * ```typescript
     * // Successful authentication - returns user object
     * const user = handleRequest(null, { id: 1, role: 'ADMIN' });
     *
     * // Failed authentication - throws UnauthorizedException
     * handleRequest(new Error('Invalid token'), null);
     * ```
     */
    handleRequest<TUser = unknown>(err: unknown, user: unknown): TUser {
        if (err || !user) {
            throw err ?? new UnauthorizedException('Unauthorized');
        }
        return user as TUser;
    }
}

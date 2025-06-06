import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

/**
 * JWT authentication strategy for validating access tokens.
 * Implements Passport JWT strategy for token-based authentication.
 *
 * @class JwtStrategy
 * @extends {PassportStrategy(Strategy)}
 * @description JWT strategy providing:
 * - Access token validation from Authorization header
 * - Token expiration checking
 * - User payload extraction and validation
 * - Integration with NestJS authentication system
 *
 * @example
 * ```typescript
 * // Automatically used by JwtAuthGuard
 * // Validates Bearer tokens in format: "Authorization: Bearer <token>"
 *
 * // Token payload structure:
 * // {
 * //   sub: userId,
 * //   phoneNumber: '+56912345678',
 * //   role: 'ADMIN',
 * //   iat: timestamp,
 * //   exp: timestamp
 * // }
 * ```
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * Creates a new JwtStrategy instance with configuration.
     *
     * @param {ConfigService} cfg - Configuration service for accessing JWT secret
     */
    constructor(cfg: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
        });
    }

    /**
     * Validates JWT payload and returns user object for request context.
     * Called automatically after successful token verification.
     *
     * @param {JwtPayload} payload - Decoded JWT payload containing user information
     * @returns {object} User object to be attached to request.user
     *
     * @example
     * ```typescript
     * // Input payload: { sub: 123, phoneNumber: '+56912345678', role: 'ADMIN' }
     * // Output: { id: 123, phoneNumber: '+56912345678', role: 'ADMIN' }
     *
     * // Available in controllers as:
     * // @Request() req: { user: { id, phoneNumber, role } }
     * ```
     */
    validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            phoneNumber: payload.phoneNumber,
            role: payload.role,
        };
    }
}

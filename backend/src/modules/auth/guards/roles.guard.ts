import { type CanActivate, type ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { Role } from 'src/common/enums/roles.enums';

/**
 * Role-based authorization guard that enforces access control based on user roles.
 * Works in conjunction with JWT authentication to provide fine-grained access control.
 *
 * @class RolesGuard
 * @implements {CanActivate}
 * @description Role authorization guard providing:
 * - Role-based access control using @Roles() decorator
 * - Admin privilege escalation (admins can access any endpoint)
 * - Flexible role requirement checking
 * - Comprehensive logging for access decisions
 *
 * @example
 * ```typescript
 * @Controller('admin')
 * export class AdminController {
 *   @Roles(Role.ADMIN)
 *   @Get('users')
 *   async getUsers() {
 *     // Only admins can access this endpoint
 *   }
 *
 *   @Roles(Role.ADMIN, Role.NEIGHBOR)
 *   @Get('reports')
 *   async getReports() {
 *     // Both admins and neighbors can access
 *   }
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
    /** Logger instance for authorization debugging */
    private readonly logger = new Logger(RolesGuard.name);

    /**
     * Creates a new RolesGuard instance.
     *
     * @param {Reflector} reflector - NestJS reflector for reading role metadata
     */
    constructor(private readonly reflector: Reflector) {}

    /**
     * Determines if the current user has sufficient privileges to access the resource.
     * Checks required roles from @Roles() decorator against user's role.
     *
     * @param {ExecutionContext} context - NestJS execution context containing request data
     * @returns {boolean | Promise<boolean> | Observable<boolean>} Authorization decision
     *
     * @example
     * ```typescript
     * // Admin user accessing any endpoint: allowed
     * // User with NEIGHBOR role accessing @Roles(Role.NEIGHBOR): allowed
     * // User with NEIGHBOR role accessing @Roles(Role.ADMIN): denied
     * // Endpoint without @Roles() decorator: allowed for all authenticated users
     * ```
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true; // No role requirements, allow access
        }
        this.logger.debug(`requiredRoles: ${requiredRoles}`);
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (user.role === Role.ADMIN) {
            return true; // Admins have access to everything
        }

        return requiredRoles.some(role => user.role?.includes(role));
    }
}

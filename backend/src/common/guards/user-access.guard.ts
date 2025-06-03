import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Guard that ensures users can only access their own data unless they are administrators.
 * Implements user-specific access control by comparing request user ID with route parameter.
 *
 * @class UserAccessGuard
 * @implements {CanActivate}
 * @description Access control guard that:
 * - Allows administrators to access any user's data
 * - Restricts regular users to their own data only
 * - Validates user authentication and route parameters
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   @Get(':id')
 *   @UseGuards(UserAccessGuard)
 *   async getUser(@Param('id') id: string) {
 *     // Only admin or the user themselves can access this
 *   }
 * }
 * ```
 */
@Injectable()
export class UserAccessGuard implements CanActivate {
    /**
     * Determines if the current user can access the requested resource.
     *
     * @param {ExecutionContext} context - NestJS execution context containing request information
     * @returns {boolean} True if access is allowed, false otherwise
     *
     * @example
     * ```typescript
     * // Admin user accessing any user's data: allowed
     * // User ID 123 accessing /users/123: allowed
     * // User ID 123 accessing /users/456: denied
     * ```
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userId = request.params.id;

        if (!user || !userId) {
            return false; // No user or userId provided
        }

        if (user.role === 'ADMIN') {
            return true; // Admins can access any user's data
        }

        return String(user.id) === String(userId); // Users can only access their own data
    }
}

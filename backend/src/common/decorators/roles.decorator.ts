import { SetMetadata } from '@nestjs/common';
import type { Role } from '../enums/roles.enums';

/**
 * Metadata key used to store role-based access control information.
 * This constant is used by the Roles decorator and authorization guards to
 * identify the required roles for accessing specific endpoints.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that specifies which user roles are required to access
 * a particular route or controller. Enables fine-grained role-based access control
 * throughout the application, ensuring only authorized users can perform specific
 * administrative or privileged operations.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

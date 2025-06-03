/**
 * User role enumeration defining access levels within the InfraCheck system.
 * Determines what operations and resources users can access.
 *
 * @enum {string}
 * @description Available user roles:
 * - ADMIN: Full system access, can manage users and all reports
 * - NEIGHBOR: Limited access, can create reports and manage own content
 *
 * @example
 * ```typescript
 * const user = {
 *   role: Role.ADMIN,     // Administrator with full access
 *   role: Role.NEIGHBOR   // Regular user with limited access
 * };
 *
 * // Usage in role-based access control
 * @Roles(Role.ADMIN)
 * async adminOnlyEndpoint() { ... }
 * ```
 */
export enum Role {
    /** Administrator role with full system access */
    ADMIN = 'ADMIN',
    /** Regular user role with limited access */
    NEIGHBOR = 'NEIGHBOR',
}

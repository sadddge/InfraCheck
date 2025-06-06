/**
 * User account status enumeration for managing user lifecycle and verification.
 * Controls user access and tracks account state throughout the registration and approval process.
 *
 * @enum {string}
 * @description Available user statuses:
 * - PENDING_VERIFICATION: New user awaiting SMS verification
 * - PENDING_APPROVAL: Verified user awaiting admin approval
 * - ACTIVE: Fully verified and approved user with system access
 * - REJECTED: User rejected by admin, access denied
 *
 * @example
 * ```typescript
 * const user = {
 *   status: UserStatus.PENDING_VERIFICATION,  // Just registered
 *   status: UserStatus.ACTIVE,                // Can use system
 *   status: UserStatus.REJECTED               // Access denied
 * };
 *
 * // Usage in user filtering
 * const activeUsers = await userService.findAll(UserStatus.ACTIVE);
 * ```
 */
export enum UserStatus {
    /** User has verified phone and can fully access the system */
    ACTIVE = 'ACTIVE',
    /** User has been rejected by admin and cannot access the system */
    REJECTED = 'REJECTED',
    /** User is verified but awaiting admin approval */
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    /** New user awaiting SMS phone verification */
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

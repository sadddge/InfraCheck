/**
 * @interface JwtRefreshPayload
 * @description Type definition for JWT refresh token payload structure.
 * Defines the expected structure of decoded refresh token data used
 * in authentication flows for obtaining new access tokens.
 *
 * @example
 * ```typescript
 * // Typical refresh token payload
 * const refreshPayload: JwtRefreshPayload = {
 *   sub: 12345,           // User ID
 *   iat: 1672531200,      // Issued at timestamp
 *   exp: 1673136000       // Expiration timestamp
 * };
 *
 * // Used in token validation
 * async validate(payload: JwtRefreshPayload) {
 *   const user = await this.userService.findById(payload.sub);
 *   return user;
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface JwtRefreshPayload {
    /**
     * @type {number}
     * @description Subject claim containing the user ID.
     * Uniquely identifies the user this refresh token belongs to.
     */
    sub: number;

    /**
     * @type {number}
     * @description Issued At timestamp in seconds since Unix epoch.
     * Used to determine token age and validate against password changes.
     */
    iat: number;

    /**
     * @type {number}
     * @description Expiration timestamp in seconds since Unix epoch.
     * Defines when this refresh token becomes invalid.
     */
    exp: number;
}

/**
 * @interface JwtResetPayload
 * @description Type definition for JWT password reset token payload structure.
 * Defines the expected structure of decoded reset token data used
 * in secure password recovery flows.
 *
 * @example
 * ```typescript
 * // Typical reset token payload
 * const resetPayload: JwtResetPayload = {
 *   sub: "12345",                    // User ID as string
 *   scope: "reset_password",         // Token purpose
 *   iat: 1672531200,                 // Issued at timestamp
 *   exp: 1672534800                  // Expiration (1 hour later)
 * };
 *
 * // Used in reset validation
 * async validate(payload: JwtResetPayload) {
 *   if (payload.scope !== 'reset_password') {
 *     accessDenied({ requiredPermission: 'reset_password', attemptedAction: 'validate_token' });
 *   }
 *   // Additional validation...
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface JwtResetPayload {
    /**
     * @type {string}
     * @description Subject claim containing the user ID as string.
     * Identifies the user authorized to reset their password.
     */
    sub: string;

    /**
     * @type {'reset_password'}
     * @description Token scope specifying this is a password reset token.
     * Must be 'reset_password' to prevent token misuse.
     */
    scope: 'reset_password';

    /**
     * @type {number}
     * @description Issued At timestamp in seconds since Unix epoch.
     * Used to validate token wasn't issued before recent password changes.
     */
    iat: number;

    /**
     * @type {number}
     * @description Expiration timestamp in seconds since Unix epoch.
     * Reset tokens typically have short lifespans (15-60 minutes).
     */
    exp: number;
}

/**
 * @interface JwtPayload
 * @description Type definition for standard JWT access token payload structure.
 * Defines the expected structure of decoded access token data used
 * throughout the application for user authentication and authorization.
 *
 * @example
 * ```typescript
 * // Typical access token payload
 * const accessPayload: JwtPayload = {
 *   sub: "12345",                    // User ID
 *   phoneNumber: "+1234567890",      // User phone number
 *   role: "USER"                     // User role for authorization
 * };
 *
 * // Used in authentication strategy
 * async validate(payload: JwtPayload) {
 *   const user = await this.userService.findById(payload.sub);
 *   return {
 *     id: user.id,
 *     phoneNumber: payload.phoneNumber,
 *     role: payload.role
 *   };
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface JwtPayload {
    /**
     * @type {string}
     * @description Subject claim containing the user ID as string.
     * Primary identifier for the authenticated user.
     */
    sub: string;

    /**
     * @type {string}
     * @description User's phone number for identification and communication.
     * Used in verification flows and user identification.
     */
    phoneNumber: string;

    /**
     * @type {string}
     * @description User's role for authorization and access control.
     * Determines what actions the user can perform in the system.
     */
    role: string;
}

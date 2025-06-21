/**
 * Service token for dependency injection of password recovery service.
 * Used with NestJS @Inject decorator to provide IPasswordRecoveryService implementation.
 */
export const PASSWORD_RECOVERY_SERVICE = 'PASSWORD_RECOVERY_SERVICE';

/**
 * Interface defining the contract for password recovery service implementations.
 * Provides secure password reset functionality with SMS verification and JWT tokens.
 *
 * Password recovery service interface providing:
 * - SMS-based password reset initiation
 * - Verification code validation and token generation
 * - Secure password update with bcrypt hashing
 * - Comprehensive security logging and audit trail
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PasswordRecoveryService implements IPasswordRecoveryService {
 *   async sendResetPasswordCode(phoneNumber: string): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IPasswordRecoveryService {
    /**
     * Initiates password recovery process by sending SMS verification code.
     * Validates user existence and sends recovery code to registered phone number.
     * Implements security measures to prevent user enumeration attacks.
     *
     * @param phoneNumber Phone number in E.164 format associated with user account
     * @returns Promise that resolves when operation completes
     * @throws Does not throw to prevent user enumeration (logs internally with VER001, USR001)
     *
     * @example
     * ```typescript
     * // Initiate password recovery
     * await passwordRecoveryService.sendResetPasswordCode('+1234567890');
     *
     * // User receives SMS: "Your password reset code is: 123456"
     * // Code expires in 5 minutes for security
     * ```
     */
    sendResetPasswordCode(phoneNumber: string): Promise<void>;

    /**
     * Verifies SMS recovery code and generates secure JWT reset token.
     * Validates the verification code and creates time-limited token for password change.
     * Token contains user identity and expiration time for secure reset process.
     *
     * @param phoneNumber Phone number that received the recovery code
     * @param code 6-digit SMS verification code received by user
     * @returns Object containing JWT reset token and success message
     * @throws {AppException} When code is invalid, expired, or user not found (AUTH009)
     *     * @example
     * ```typescript
     * // Step 1: User enters phone and receives SMS code
     * // Step 2: Verify code and get reset token
     * const result = await passwordRecoveryService.generateResetPasswordToken(
     *   '+1234567890',
     *   '123456'
     * );
     * console.log(result.token); // JWT reset token valid for 15 minutes
     * console.log(result.message); // "Password reset token generated successfully"
     *
     * // Step 3: Use token in Authorization header for password reset
     * ```
     */
    generateResetPasswordToken(
        phoneNumber: string,
        code: string,
    ): Promise<{ token: string; message: string }>;

    /**
     * Resets user password using validated reset token.
     * Updates password with secure bcrypt hashing and records timestamp.
     * Invalidates previous sessions by updating password change time.
     *
     * @param id User ID extracted from validated reset token payload
     * @param newPassword New plain text password to hash and store securely
     * @returns Success message confirming password reset completion
     * @throws {AppException} When user with specified ID does not exist (USR001)
     * @throws {AppException} When password update operation fails (SRV002)
     *
     * @example
     * ```typescript
     * // Called by controller after JWT token validation
     * const message = await passwordRecoveryService.resetPassword(123, 'newSecurePassword456!');
     * console.log(message); // "Password reset successful"
     *
     * // User can now login with new password
     * // Previous sessions are invalidated
     * // Password change is logged for security audit
     * ```
     */
    resetPassword(id: number, newPassword: string): Promise<string>;
}

export const PASSWORD_RECOVERY_SERVICE = 'PASSWORD_RECOVERY_SERVICE';
export interface IPasswordRecoveryService {
    /**
     * Initiates password recovery process by sending SMS verification code.
     * Validates that user exists and sends recovery code to registered phone number.
     *
     * @param phoneNumber Phone number associated with the user account for password recovery
     * @returns Resolves when SMS recovery code is sent successfully
     * @throws {UnauthorizedException} When user with phone number is not found
     * @throws {InternalServerErrorException} When SMS sending fails
     *
     * @example
     * ```typescript
     * await authService.sendResetPasswordCode('+1234567890');
     * console.log('Password recovery code sent via SMS');
     * ```
     */
    sendResetPasswordCode(phoneNumber: string): Promise<void>;

    /**
     * Verifies password recovery code and generates a JWT reset token.
     * Validates the SMS recovery code and returns a time-limited token for password reset.
     *
     * @param phoneNumber Phone number that received the password recovery code
     * @param code 6-digit verification code from SMS
     * @returns Object containing JWT reset token and success message
     * @throws {UnauthorizedException} When recovery code is invalid or user not found
     * @throws {BadRequestException} When verification code has expired
     *
     * @example
     * ```typescript
     * const result = await authService.generateResetPasswordToken('+1234567890', '123456');
     * console.log(result.token); // JWT reset token valid for 15 minutes
     * console.log(result.message); // Success message
     * ```
     */
    generateResetPasswordToken(
        phoneNumber: string,
        code: string,
    ): Promise<{ token: string; message: string }>;

    /**
     * Resets user password using a validated reset token.
     * Updates password with bcrypt encryption and records password change timestamp.
     *
     * @param id User ID extracted from the validated reset token payload
     * @param newPassword New plain text password to hash and save
     * @returns Success message confirming password reset completion
     * @throws {NotFoundException} When user with specified ID does not exist
     * @throws {InternalServerErrorException} When password update operation fails
     *
     * @example
     * ```typescript
     * const message = await authService.resetPassword(123, 'newSecurePassword456');
     * console.log(message); // "Password reset successful"
     * // User can now login with new password
     * ```
     */
    resetPassword(id: number, newPassword: string): Promise<string>;
}

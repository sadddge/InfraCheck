import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { invalidVerificationCode } from 'src/common/helpers/exception.helper';
import { User } from 'src/database/entities/user.entity';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
import { IPasswordRecoveryService } from '../interfaces/password-recovery-service.interface';
import { TokenFactoryService } from './token-factory.service';

/**
 * Password recovery service providing secure password reset functionality.
 * Handles the complete password reset workflow with SMS verification and JWT tokens.
 *
 * Password recovery workflow:
 * 1. User requests password reset with phone number
 * 2. SMS verification code is sent to user's phone
 * 3. User submits verification code to get reset token
 * 4. User uses reset token to set new password
 *
 * Security features:
 * - SMS-based verification for identity confirmation
 * - Time-limited reset tokens with expiration
 * - Secure password hashing with bcrypt
 * - Comprehensive audit logging for security monitoring
 * - Protection against enumeration attacks
 *
 * @example
 * ```typescript
 * const passwordRecovery = new PasswordRecoveryService(userService, verificationService, tokenFactory);
 *
 * // Step 1: Send verification code
 * await passwordRecovery.sendResetPasswordCode('+1234567890');
 *
 * // Step 2: Verify code and get reset token
 * const { token } = await passwordRecovery.generateResetPasswordToken('+1234567890', '123456');
 *
 * // Step 3: Reset password with token
 * await passwordRecovery.resetPassword(userId, 'newSecurePassword');
 * ```
 */
@Injectable()
export class PasswordRecoveryService implements IPasswordRecoveryService {
    /** Logger instance for tracking password recovery operations and security events */
    private readonly logger = new Logger(PasswordRecoveryService.name);

    /**
     * Creates a new PasswordRecoveryService instance.
     *
     * @param usersService User service for user lookup and password updates
     * @param verificationService SMS verification service for code sending and validation
     * @param tokenFactory Token factory service for generating secure reset tokens
     */
    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @Inject(VERIFICATION.RECOVER_PASSWORD_TOKEN)
        private readonly verificationService: IVerificationService,
        private readonly tokenFactory: TokenFactoryService,
    ) {}

    /**
     * Initiates password reset process by sending SMS verification code.
     * Validates user existence and sends verification code to registered phone number.
     * Implements protection against user enumeration attacks by not revealing user existence.
     *
     * @param phoneNumber User's phone number in E.164 format
     * @returns Promise that resolves when operation completes (success or failure)
     * @throws Does not throw exceptions to prevent user enumeration
     *
     * @example
     * ```typescript
     * // Initiate password reset
     * await passwordRecoveryService.sendResetPasswordCode('+1234567890');
     *
     * // User receives SMS with verification code
     * // Service logs success/failure but doesn't reveal user existence
     * ```
     */ async sendResetPasswordCode(phoneNumber: string): Promise<void> {
        try {
            const user = await this.usersService.findByPhoneNumber(phoneNumber);
            if (user) {
                await this.verificationService.sendVerificationCode(phoneNumber);
                this.logger.log(`Reset password code sent to ${phoneNumber}`);
            } else {
                this.logger.warn(`Password reset attempted for non-existent user: ${phoneNumber}`);
            }
        } catch (error) {
            this.logger.error(
                `Failed to send reset password code to ${phoneNumber}: ${error.message}`,
            );
        }
    }

    /**
     * Verifies SMS code and generates secure reset token for password change.
     * Validates the verification code and creates a time-limited JWT token for password reset.
     * Token contains user identity and expiration time for secure password change.
     *
     * @param phoneNumber User's phone number in E.164 format
     * @param code SMS verification code received by user
     * @returns Object containing reset token and success message
     * @throws {AppException} When verification code is invalid or expired
     *
     * @example
     * ```typescript
     * try {
     *   const result = await passwordRecoveryService.generateResetPasswordToken(
     *     '+1234567890',
     *     '123456'
     *   );
     *   console.log(result.token); // JWT token for password reset
     *   console.log(result.message); // Success message
     * } catch (error) {
     *   // Handle invalid verification code
     *   console.error('Invalid or expired verification code');
     * }
     * ```
     */
    async generateResetPasswordToken(
        phoneNumber: string,
        code: string,
    ): Promise<{ token: string; message: string }> {
        try {
            await this.verificationService.verifyCode(phoneNumber, code);
        } catch {
            this.logger.warn(`Invalid verification code for ${phoneNumber}`);
            invalidVerificationCode();
        }

        try {
            const user = await this.usersService.findByPhoneNumber(phoneNumber);
            this.logger.log(`Generating reset password token for user: ${user?.id}`);
            const token = await this.tokenFactory.generateResetPasswordToken(user as User);
            return {
                token,
                message: 'Password reset token generated successfully',
            };
        } catch (error) {
            this.logger.error(
                `Error generating reset password token for ${phoneNumber}: ${error.message}`,
            );
            invalidVerificationCode();
        }
    }

    /**
     * Resets user password using validated reset token.
     * Updates user's password with secure bcrypt hashing and updates password timestamp.
     * Invalidates previous sessions by updating password change time.
     *
     * @param id User ID extracted from validated reset token
     * @param newPassword New password to set for the user
     * @returns Success message confirming password reset
     * @throws {Error} When user not found or password update fails
     *
     * @example
     * ```typescript
     * try {
     *   const result = await passwordRecoveryService.resetPassword(123, 'newSecurePassword123!');
     *   console.log(result); // "Password reset successful"
     *
     *   // User can now login with new password
     *   // Previous sessions are invalidated
     * } catch (error) {
     *   console.error('Failed to reset password:', error.message);
     * }
     * ```
     */
    async resetPassword(id: number, newPassword: string): Promise<string> {
        try {
            this.logger.log(`Resetting password for user ID: ${id}`);
            const user = await this.usersService.findByIdWithPassword(id);
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = newHashedPassword;
            user.passwordUpdatedAt = new Date();
            await this.usersService.update(user.id, user);
            return 'Password reset successful';
        } catch (error) {
            this.logger.error(`Error resetting password for user ${id}: ${error.message}`);
            throw error;
        }
    }
}

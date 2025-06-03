export const VERIFICATION_SERVICE = 'VERIFICATION_SERVICE';

/**
 * Verification service interface defining SMS verification operations.
 * Provides contract for phone number verification services using SMS codes.
 *
 * @interface IVerificationService
 * @description Service interface for SMS-based verification operations including:
 * - Sending verification codes to phone numbers
 * - Validating verification codes
 * - Integration with SMS providers (e.g., Twilio)
 * - Error handling for verification failures
 *
 * @example
 * ```typescript
 * // Implementation example
 * class TwilioVerificationService implements IVerificationService {
 *   async sendVerificationCode(phoneNumber: string): Promise<void> {
 *     // Send SMS code using Twilio
 *   }
 *
 *   async verifyCode(phoneNumber: string, code: string): Promise<void> {
 *     // Verify code with Twilio
 *   }
 * }
 *
 * // Usage in services
 * constructor(
 *   @Inject(VERIFICATION_SERVICE)
 *   private verificationService: IVerificationService
 * ) {}
 * ```
 *
 * @since 1.0.0
 */
export interface IVerificationService {
    /**
     * Sends a verification code to the specified phone number via SMS.
     *
     * @async
     * @param {string} phoneNumber - Phone number in E.164 format to receive the code
     * @returns {Promise<void>} Resolves when SMS is sent successfully
     * @throws {BadRequestException} When phone number format is invalid
     * @throws {InternalServerErrorException} When SMS delivery fails
     *
     * @example
     * ```typescript
     * await verificationService.sendVerificationCode('+1234567890');
     * ```
     */
    sendVerificationCode(phoneNumber: string): Promise<void>;

    /**
     * Verifies a code against the phone number it was sent to.
     *
     * @async
     * @param {string} phoneNumber - Phone number that received the verification code
     * @param {string} code - 6-digit verification code to validate
     * @returns {Promise<void>} Resolves when verification is successful     * @throws {BadRequestException} When verification code is invalid or expired
     *
     * @example
     * ```typescript
     * await verificationService.verifyCode('+1234567890', '123456');
     * ```
     */
    verifyCode(phoneNumber: string, code: string): Promise<void>;
}

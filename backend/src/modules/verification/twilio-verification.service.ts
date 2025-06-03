import { BadRequestException, Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import type { IVerificationService } from '../../common/interfaces/verification-service.interface';

/**
 * Twilio-based SMS verification service for phone number validation.
 * Implements the IVerificationService interface using Twilio Verify API.
 *
 * @class TwilioVerificationService
 * @implements {IVerificationService}
 * @description SMS verification service providing:
 * - Sending verification codes via SMS
 * - Code validation and verification
 * - Integration with Twilio Verify API
 * - Support for different verification flows (registration, password recovery)
 *
 * @example
 * ```typescript
 * const verificationService = new TwilioVerificationService(configService, 'service-sid');
 * await verificationService.sendVerificationCode('+1234567890');
 * await verificationService.verifyCode('+1234567890', '123456');
 * ```
 */
@Injectable()
export class TwilioVerificationService implements IVerificationService {
    /** Twilio client instance for API communication */
    private readonly twilioClient: Twilio;
    /** Twilio Verify service SID for this verification instance */
    private readonly serviceSid: string;

    /**
     * Creates a new TwilioVerificationService instance.
     *
     * @param {ConfigService} cf - Configuration service for accessing environment variables
     * @param {string} injectedServiceSid - Twilio Verify service SID for this instance
     *
     * @example
     * ```typescript
     * // Usually injected via dependency injection with different service SIDs
     * const registerService = new TwilioVerificationService(config, 'register-service-sid');
     * const passwordService = new TwilioVerificationService(config, 'password-service-sid');
     * ```
     */
    constructor(
        private readonly cf: ConfigService,
        injectedServiceSid: string,
    ) {
        this.twilioClient = new Twilio(
            this.cf.get<string>('TWILIO_ACCOUNT_SID'),
            this.cf.get<string>('TWILIO_AUTH_TOKEN'),
        );
        this.serviceSid = injectedServiceSid;
    }

    /**
     * Sends a verification code to the specified phone number via SMS.
     *
     * @async
     * @param {string} phoneNumber - Phone number in international format (e.g., +1234567890)
     * @returns {Promise<void>} Promise that resolves when SMS is sent successfully
     * @throws {BadRequestException} When SMS sending fails
     *
     * @example
     * ```typescript
     * try {
     *   await verificationService.sendVerificationCode('+1234567890');
     *   console.log('Verification code sent successfully');
     * } catch (error) {
     *   console.error('Failed to send verification code');
     * }
     * ```
     */
    async sendVerificationCode(phoneNumber: string): Promise<void> {
        const response = await this.twilioClient.verify.v2
            .services(this.serviceSid)
            .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });
        if (response.status !== 'pending') {
            throw new BadRequestException('Failed to send verification code');
        }
    }

    /**
     * Verifies a code sent to the specified phone number.
     *
     * @async
     * @param {string} phoneNumber - Phone number that received the verification code
     * @param {string} code - Verification code provided by the user (usually 6 digits)
     * @returns {Promise<void>} Promise that resolves when code is valid
     * @throws {BadRequestException} When verification code is invalid or expired
     *
     * @example
     * ```typescript
     * try {
     *   await verificationService.verifyCode('+1234567890', '123456');
     *   console.log('Phone number verified successfully');
     * } catch (error) {
     *   console.error('Invalid verification code');
     * }
     * ```
     */
    async verifyCode(phoneNumber: string, code: string): Promise<void> {
        const verificationCheck = await this.twilioClient.verify.v2
            .services(this.serviceSid)
            .verificationChecks.create({
                to: phoneNumber,
                code: code,
            });
        if (verificationCheck.status !== 'approved') {
            throw new BadRequestException('Invalid verification code');
        }
    }
}

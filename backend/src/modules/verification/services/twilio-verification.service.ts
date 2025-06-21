import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import {
    invalidVerificationCode,
    verificationCodeSendFailed,
} from 'src/common/helpers/exception.helper';
import { Twilio } from 'twilio';
import type { IVerificationService } from '../interfaces/verification-service.interface';

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

    /** @inheritDoc */
    async sendVerificationCode(phoneNumber: string): Promise<void> {
        const response = await this.twilioClient.verify.v2
            .services(this.serviceSid)
            .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });
        if (response.status !== 'pending') {
            verificationCodeSendFailed({
                info: `Failed to send verification code to ${phoneNumber}. Twilio status: ${response.status}`,
            });
        }
    }

    /** @inheritDoc */
    async verifyCode(phoneNumber: string, code: string): Promise<void> {
        const verificationCheck = await this.twilioClient.verify.v2
            .services(this.serviceSid)
            .verificationChecks.create({
                to: phoneNumber,
                code: code,
            });
        if (verificationCheck.status !== 'approved') {
            invalidVerificationCode();
        }
    }
}

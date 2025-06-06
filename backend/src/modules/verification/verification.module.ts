import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { TwilioVerificationService } from './services/twilio-verification.service';

/**
 * SMS verification module providing Twilio-based verification services.
 * Configures separate verification services for registration and password recovery workflows.
 *
 * @class VerificationModule
 * @description SMS verification module that provides:
 * - User registration phone number verification
 * - Password recovery verification codes
 * - Twilio service integration with multiple SIDs
 * - Code generation and validation
 * - SMS delivery and error handling
 *
 * @example
 * ```typescript
 * // Module provides two verification service instances:
 * // VERIFICATION.REGISTER_TOKEN - for user registration
 * // VERIFICATION.RECOVER_PASSWORD_TOKEN - for password recovery
 *
 * // Usage in services:
 * constructor(
 *   @Inject(VERIFICATION.REGISTER_TOKEN)
 *   private verificationService: TwilioVerificationService
 * ) {}
 *
 * // Requires environment variables:
 * // TWILIO_REGISTER_SID - Service ID for registration
 * // TWILIO_RECOVER_PASSWORD_SID - Service ID for password recovery
 * ```
 *
 * @since 1.0.0
 */
@Module({
    providers: [
        {
            provide: VERIFICATION.REGISTER_TOKEN,
            useFactory: (cf: ConfigService) => {
                return new TwilioVerificationService(
                    cf,
                    cf.getOrThrow<string>(VERIFICATION.REGISTER_SID),
                );
            },
            inject: [ConfigService],
        },
        {
            provide: VERIFICATION.RECOVER_PASSWORD_TOKEN,
            useFactory: (cf: ConfigService) => {
                return new TwilioVerificationService(
                    cf,
                    cf.getOrThrow<string>(VERIFICATION.RECOVER_PASSWORD_SID),
                );
            },
            inject: [ConfigService],
        },
    ],
    exports: [VERIFICATION.REGISTER_TOKEN, VERIFICATION.RECOVER_PASSWORD_TOKEN],
})
export class VerificationModule {}

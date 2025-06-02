import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { TwilioVerificationService } from './twilio-verification.service';

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

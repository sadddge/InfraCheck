import { BadRequestException, Injectable } from '@nestjs/common';
import { IVerificationService } from './interfaces/verification-service.interface';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioVerificationService implements IVerificationService {
    private readonly twilioClient: Twilio;
    private readonly serviceSid: string;

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

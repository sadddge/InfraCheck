import { BadRequestException } from '@nestjs/common';
import { TwilioVerificationService } from './twilio-verification.service';
import type { ConfigService } from '@nestjs/config';

const mockTwilioClient = {
    verify: {
        v2: {
            services: jest.fn().mockReturnThis(),
            verifications: { create: jest.fn() },
            verificationChecks: { create: jest.fn() },
        },
    },
};

jest.mock('twilio', () => ({ Twilio: jest.fn(() => mockTwilioClient) }));

describe('TwilioVerificationService', () => {
    let service: TwilioVerificationService;
    let twilioClient: typeof mockTwilioClient;
    const configService = { get: jest.fn().mockReturnValue('x') } as unknown as ConfigService;

    beforeEach(() => {
        service = new TwilioVerificationService(configService, 'service-sid');
        twilioClient = mockTwilioClient;
        (service as any).twilioClient = twilioClient;
        (service as any).serviceSid = 'service-sid';
    });

    describe('sendVerificationCode', () => {
        it('resolves when Twilio returns pending', async () => {
            twilioClient.verify.v2.verifications.create.mockResolvedValueOnce({ status: 'pending' });
            await expect(service.sendVerificationCode('+123')).resolves.toBeUndefined();
            expect(twilioClient.verify.v2.services).toHaveBeenCalledWith('service-sid');
            expect(twilioClient.verify.v2.verifications.create).toHaveBeenCalledWith({ to: '+123', channel: 'sms' });
        });

        it('throws when status is not pending', async () => {
            twilioClient.verify.v2.verifications.create.mockResolvedValueOnce({ status: 'failed' });
            await expect(service.sendVerificationCode('+123')).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('verifyCode', () => {
        it('resolves when Twilio approves the code', async () => {
            twilioClient.verify.v2.verificationChecks.create.mockResolvedValueOnce({ status: 'approved' });
            await expect(service.verifyCode('+123', '456')).resolves.toBeUndefined();
            expect(twilioClient.verify.v2.services).toHaveBeenCalledWith('service-sid');
            expect(twilioClient.verify.v2.verificationChecks.create).toHaveBeenCalledWith({ to: '+123', code: '456' });
        });

        it('throws when verification fails', async () => {
            twilioClient.verify.v2.verificationChecks.create.mockResolvedValueOnce({ status: 'pending' });
            await expect(service.verifyCode('+123', '456')).rejects.toBeInstanceOf(BadRequestException);
        });
    });
});

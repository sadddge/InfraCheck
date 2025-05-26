export const VERIFICATION_SERVICE = 'VERIFICATION_SERVICE';

export interface IVerificationService {
    sendVerificationCode(phoneNumber: string): Promise<void>;
    verifyCode(phoneNumber: string, code: string): Promise<void>;
}

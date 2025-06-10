import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
import { InvalidPasswordResetCodeException } from '../exceptions/auth.exceptions';
import { IPasswordRecoveryService } from '../interfaces/password-recovery-service.interface';
import { TokenFactoryService } from './token-factory.service';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class PasswordRecoveryService implements IPasswordRecoveryService {
    private readonly logger = new Logger(PasswordRecoveryService.name);

    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @Inject(VERIFICATION.RECOVER_PASSWORD_TOKEN)
        private readonly verificationService: IVerificationService,
        private readonly tokenFactory: TokenFactoryService,
        private readonly configService: ConfigService,
    ) { }

    async sendResetPasswordCode(phoneNumber: string): Promise<void> {
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

    async generateResetPasswordToken(
        phoneNumber: string,
        code: string,
    ): Promise<{ token: string; message: string }> {
        try {
            await this.verificationService.verifyCode(phoneNumber, code);
        } catch {
            this.logger.warn(`Invalid verification code for ${phoneNumber}`);
            throw new InvalidPasswordResetCodeException();
        }

        try {
            const user = await this.usersService.findByPhoneNumber(phoneNumber);
            this.logger.log(`Generating reset password token for user: ${user?.id}`);
            const token = await this.tokenFactory.generateResetPasswordToken(user as User); 
            this.logger.log(`Reset password token generated for ${phoneNumber}`);
            return {
                token,
                message: 'Password reset token generated successfully',
            };
        } catch (error) {
            this.logger.error(
                `Error generating reset password token for ${phoneNumber}: ${error.message}`,
            );
            throw new InvalidPasswordResetCodeException();
        }
    }

    async resetPassword(id: number, newPassword: string): Promise<string> {
        try {
            this.logger.log(`Resetting password for user ID: ${id}`);
            const user = await this.usersService.findByIdWithPassword(id);
            this.logger.log(`User found: ${user?.id}`);
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            this.logger.log(`New password hashed for user ID: ${id}`);
            user.password = newHashedPassword;
            user.passwordUpdatedAt = new Date();
            this.logger.log(`Updating user password in database for user ID: ${id}`);
            await this.usersService.update(user.id, user);
            return 'Password reset successful';
        } catch (error) {
            this.logger.error(`Error resetting password for user ${id}: ${error.message}`);
            throw error;
        }
    }
}

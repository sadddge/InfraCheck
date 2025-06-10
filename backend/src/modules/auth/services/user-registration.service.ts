import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { InvalidVerificationCodeException } from '../exceptions/auth.exceptions';
import { IUserRegistrationService } from '../interfaces/user-registration-service..interface';

@Injectable()
export class UserRegistrationService implements IUserRegistrationService {
    private readonly logger = new Logger(UserRegistrationService.name);
    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @Inject(VERIFICATION.REGISTER_TOKEN)
        private readonly verificationService: IVerificationService,
    ) {}

    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.registerNeighbor({
            ...dto,
            password: hashedPassword,
        });

        await this.verificationService.sendVerificationCode(user.phoneNumber);

        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
        };
    }

    async verifyRegisterCode(phoneNumber: string, code: string): Promise<void> {
        try {
            await this.verificationService.verifyCode(phoneNumber, code);
            const user = await this.usersService.findByPhoneNumber(phoneNumber);
            user.status = UserStatus.PENDING_APPROVAL;
            await this.usersService.update(user.id, user);
        } catch (error) {
            this.logger.error(`Invalid verification code for ${phoneNumber}: ${error.message}`);
            throw new InvalidVerificationCodeException();
        }
    }
}

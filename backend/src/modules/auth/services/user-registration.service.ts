import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { invalidVerificationCode } from 'src/common/helpers/exception.helper';
import { NotificationPreference } from 'src/database/entities/notification-preference.entity';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
import { Repository } from 'typeorm';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { IUserRegistrationService } from '../interfaces/user-registration-service.interface';

/**
 * User registration service providing secure account creation with SMS verification.
 * Handles the complete user registration workflow with phone verification and approval process.
 *
 * Registration workflow:
 * 1. User submits registration form with personal information
 * 2. Password is securely hashed using bcrypt
 * 3. User account is created with PENDING_VERIFICATION status
 * 4. SMS verification code is sent to user's phone
 * 5. User submits verification code to activate account
 * 6. Account status changes to PENDING_APPROVAL for admin review
 *
 * Security features:
 * - Secure password hashing with bcrypt salt rounds
 * - SMS-based phone number verification
 * - Multi-stage approval process for account activation
 * - Comprehensive audit logging for security monitoring
 * - Input validation and sanitization
 *
 * @example
 * ```typescript
 * const registrationService = new UserRegistrationService(userService, verificationService);
 *
 * // Step 1: Register user and send SMS
 * const response = await registrationService.register({
 *   phoneNumber: '+1234567890',
 *   password: 'securePassword123!',
 *   name: 'John',
 *   lastName: 'Doe'
 * });
 *
 * // Step 2: Verify SMS code
 * await registrationService.verifyRegisterCode('+1234567890', '123456');
 * ```
 */
@Injectable()
export class UserRegistrationService implements IUserRegistrationService {
    /** Logger instance for tracking registration operations and security events */
    private readonly logger = new Logger(UserRegistrationService.name);

    /**
     * Creates a new UserRegistrationService instance.
     *
     * @param usersService User service for account creation and management
     * @param verificationService SMS verification service for phone number validation
     */
    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @Inject(VERIFICATION.REGISTER_TOKEN)
        private readonly verificationService: IVerificationService,
        @InjectRepository(NotificationPreference)
        private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
    ) { }

    /** @inheritDoc */
    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.registerNeighbor({
            ...dto,
            password: hashedPassword,
        });

        await this.verificationService.sendVerificationCode(user.phoneNumber);
        const pref = this.notificationPreferenceRepository.create({
            userId: user.id,
            user: user,
            sseEnabled: true,
            pushEnabled: false,
        });

        await this.notificationPreferenceRepository.save(pref);
        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
        };
    }

    /** @inheritDoc */
    async verifyRegisterCode(phoneNumber: string, code: string): Promise<void> {
        try {
            await this.verificationService.verifyCode(phoneNumber, code);
            const user = await this.usersService.findByPhoneNumber(phoneNumber);
            user.status = UserStatus.PENDING_APPROVAL;
            await this.usersService.update(user.id, user);
        } catch (error) {
            this.logger.error(`Invalid verification code for ${phoneNumber}: ${error.message}`);
            invalidVerificationCode();
        }
    }
}

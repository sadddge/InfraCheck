import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { invalidVerificationCode } from 'src/common/helpers/exception.helper';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
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
    ) {}

    /**
     * Registers a new user account with SMS verification initiation.
     * Creates user account with secure password hashing and sends verification code.
     * User starts in PENDING_VERIFICATION status until phone is verified.
     *
     * @param dto Registration data containing user information and credentials
     * @returns Registration response with user information (without password)
     * @throws {ConflictException} When phone number or email already exists
     * @throws {BadRequestException} When registration data is invalid
     *
     * @example
     * ```typescript
     * const registrationData = {
     *   phoneNumber: '+1234567890',
     *   password: 'securePassword123!',
     *   name: 'John',
     *   lastName: 'Doe'
     * };
     *
     * const response = await userRegistrationService.register(registrationData);
     * console.log(response.id); // New user ID
     * console.log(response.phoneNumber); // Registered phone number
     *
     * // User receives SMS: "Your verification code is: 123456"
     * ```
     */
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

    /**
     * Verifies SMS registration code and activates user account.
     * Validates the verification code and updates user status to pending approval.
     * Completes the phone verification step of registration process.
     *
     * @param phoneNumber User's phone number that received verification code
     * @param code 6-digit SMS verification code
     * @returns Promise that resolves when verification is successful
     * @throws {InvalidVerificationCodeException} When code is invalid or expired
     *
     * @example
     * ```typescript
     * try {
     *   await userRegistrationService.verifyRegisterCode('+1234567890', '123456');
     *   console.log('Phone number verified successfully');
     *   console.log('Account status updated to PENDING_APPROVAL');
     *
     *   // User can now wait for admin approval
     * } catch (error) {
     *   console.error('Invalid verification code');
     *   // Prompt user to enter code again or resend
     * }
     * ```
     */
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

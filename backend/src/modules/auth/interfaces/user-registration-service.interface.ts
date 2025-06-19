import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';

/**
 * Service token for dependency injection of user registration service.
 * Used with NestJS @Inject decorator to provide IUserRegistrationService implementation.
 */
export const USER_REGISTRATION_SERVICE = 'USER_REGISTRATION_SERVICE';

/**
 * Interface defining the contract for user registration service implementations.
 * Provides secure account creation with SMS verification and approval workflow.
 *
 * User registration service interface providing:
 * - Secure user account creation with password hashing
 * - SMS-based phone number verification
 * - Multi-stage approval process for account activation
 * - Registration data validation and sanitization
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRegistrationService implements IUserRegistrationService {
 *   async register(dto: RegisterDto): Promise<RegisterResponseDto> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IUserRegistrationService {
    /**
     * Registers a new user account with secure password hashing and SMS verification.
     * Creates user with PENDING_VERIFICATION status and initiates phone verification process.
     * Returns sanitized user data without sensitive information.
     *
     * @param dto Registration data including personal information and credentials
     * @returns Registration response with user data (excludes password and sensitive fields)
     * @throws {ConflictException} When phone number or email already exists
     * @throws {BadRequestException} When registration data validation fails
     * @throws {InternalServerErrorException} When SMS sending or user creation fails
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
     * const newUser = await userRegistrationService.register(registrationData);
     * console.log(newUser.id); // New user ID
     * console.log(newUser.phoneNumber); // Registered phone number
     *
     * // User receives SMS: "Your InfraCheck verification code is: 123456"
     * // Account status: PENDING_VERIFICATION
     * ```
     */ register(dto: RegisterDto): Promise<RegisterResponseDto>;

    /**
     * Verifies SMS registration code and activates user account for approval.
     * Updates user status from PENDING_VERIFICATION to PENDING_APPROVAL after successful verification.
     * Completes the phone verification step of the registration workflow.
     *
     * @param phoneNumber Phone number that received the verification code
     * @param code 6-digit SMS verification code received by user
     * @returns Promise that resolves when verification is successful and status is updated
     * @throws {InvalidVerificationCodeException} When code is invalid, expired, or user not found
     *
     * @example
     * ```typescript
     * // User received SMS: "Your InfraCheck verification code is: 123456"
     * try {
     *   await userRegistrationService.verifyRegisterCode('+1234567890', '123456');
     *   console.log('Phone verification successful');
     *   console.log('Account status: PENDING_VERIFICATION → PENDING_APPROVAL');
     *   console.log('Waiting for admin approval to complete registration');
     * } catch (error) {
     *   console.error('Invalid or expired verification code');
     *   // Allow user to request new code or try again
     * }
     * ```
     */
    verifyRegisterCode(phoneNumber: string, code: string): Promise<void>;
}

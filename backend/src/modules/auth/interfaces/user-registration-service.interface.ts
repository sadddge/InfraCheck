import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';

export const USER_REGISTRATION_SERVICE = 'USER_REGISTRATION_SERVICE';

export interface IUserRegistrationService {
    /**
     * Registers a new user account with encrypted password and initiates SMS verification.
     * Creates user with PENDING_VERIFICATION status and sends verification code via SMS.
     *
     * @param dto Registration data including personal information, phone number, and password
     * @returns Registration response with user data (excludes sensitive information)
     * @throws {ConflictException} When phone number or email already exists in the system
     * @throws {BadRequestException} When registration data validation fails
     * @throws {InternalServerErrorException} When SMS verification code sending fails
     *
     * @example
     * ```typescript
     * const newUser = await authService.register({
     *   phoneNumber: '+1234567890',
     *   password: 'securePassword123',
     *   name: 'John',
     *   lastName: 'Doe',
     *   email: 'john@example.com'
     * });
     * console.log(newUser.id); // New user ID
     * // SMS verification code sent to phone
     * ```
     */
    register(dto: RegisterDto): Promise<RegisterResponseDto>;

    /**
     * Verifies the SMS verification code sent during user registration.
     * Updates user status from PENDING_VERIFICATION to PENDING_APPROVAL upon successful verification.
     *
     * @param phoneNumber Phone number that received the verification code
     * @param code 6-digit verification code sent via SMS
     * @returns Resolves when verification is successful and user status is updated
     * @throws {UnauthorizedException} When verification code is invalid or user not found
     * @throws {BadRequestException} When verification code has expired
     *
     * @example
     * ```typescript
     * await authService.verifyRegisterCode('+1234567890', '123456');
     * console.log('User verification successful, status updated to PENDING_APPROVAL');
     * ```
     */
    verifyRegisterCode(phoneNumber: string, code: string): Promise<void>;
}

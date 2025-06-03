import type { User } from 'src/database/entities/user.entity';
import type { LoginResponseDto } from '../../modules/auth/dto/login-response.dto';
import type { LoginDto } from '../../modules/auth/dto/login.dto';
import type { RegisterResponseDto } from '../../modules/auth/dto/register-response.dto';
import type { RegisterDto } from '../../modules/auth/dto/register.dto';

/**
 * Service token for dependency injection of authentication service.
 * Used with NestJS @Inject decorator to provide IAuthService implementation.
 */
export const AUTH_SERVICE = 'AUTH_SERVICE';

/**
 * Interface defining the contract for authentication service implementations.
 * Provides comprehensive authentication functionality including user registration,
 * login, password recovery, and token management operations.
 *
 * Authentication service interface providing:
 * - User authentication and token generation
 * - User registration with SMS verification
 * - Password recovery and reset functionality
 * - Refresh token management
 * - User verification operations
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthService implements IAuthService {
 *   async login(dto: LoginDto): Promise<LoginResponseDto> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IAuthService {
    /**
     * Authenticates a user with phone number and password credentials.
     * Validates credentials and generates JWT access and refresh tokens upon successful authentication.
     *
     * @param dto Login credentials containing phone number and password
     * @returns Authentication response with access token, refresh token, and user data
     * @throws {UnauthorizedException} When phone number or password is invalid
     * @throws {NotFoundException} When user with phone number does not exist
     *
     * @example
     * ```typescript
     * const loginResult = await authService.login({
     *   phoneNumber: '+1234567890',
     *   password: 'userPassword123'
     * });
     * console.log(loginResult.accessToken); // JWT access token
     * console.log(loginResult.user.name); // User information
     * ```
     */
    login(dto: LoginDto): Promise<LoginResponseDto>;

    /**
     * Refreshes an expired access token using a valid refresh token.
     * Validates the refresh token, invalidates it, and generates new access and refresh tokens.
     *
     * @param refreshToken JWT refresh token to validate and exchange for new tokens
     * @returns New authentication response with fresh access and refresh tokens
     * @throws {UnauthorizedException} When refresh token is invalid, expired, or revoked
     *
     * @example
     * ```typescript
     * const newTokens = await authService.refreshToken('eyJhbGciOiJIUzI1NiIs...');
     * console.log(newTokens.accessToken); // New access token
     * console.log(newTokens.refreshToken); // New refresh token
     * ```
     */
    refreshToken(refreshToken: string): Promise<LoginResponseDto>;

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
     * Validates a refresh token and returns the associated user if the token is valid.
     * Used internally for refresh token validation without generating new tokens.
     *
     * @param refreshToken JWT refresh token to validate
     * @param userId User ID that should match the token's subject claim
     * @returns User entity if token is valid and matches user ID, null if invalid
     *
     * @example
     * ```typescript
     * const user = await authService.getUserIfRefreshTokenMatches(token, 123);
     * if (user) {
     *   console.log('Valid token for user:', user.name);
     * } else {
     *   console.log('Invalid or expired token');
     * }
     * ```
     */
    getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User | null>;

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

    /**
     * Initiates password recovery process by sending SMS verification code.
     * Validates that user exists and sends recovery code to registered phone number.
     *
     * @param phoneNumber Phone number associated with the user account for password recovery
     * @returns Resolves when SMS recovery code is sent successfully
     * @throws {UnauthorizedException} When user with phone number is not found
     * @throws {InternalServerErrorException} When SMS sending fails
     *
     * @example
     * ```typescript
     * await authService.sendResetPasswordCode('+1234567890');
     * console.log('Password recovery code sent via SMS');
     * ```
     */
    sendResetPasswordCode(phoneNumber: string): Promise<void>;

    /**
     * Verifies password recovery code and generates a JWT reset token.
     * Validates the SMS recovery code and returns a time-limited token for password reset.
     *
     * @param phoneNumber Phone number that received the password recovery code
     * @param code 6-digit verification code from SMS
     * @returns Object containing JWT reset token and success message
     * @throws {UnauthorizedException} When recovery code is invalid or user not found
     * @throws {BadRequestException} When verification code has expired
     *
     * @example
     * ```typescript
     * const result = await authService.generateResetPasswordToken('+1234567890', '123456');
     * console.log(result.token); // JWT reset token valid for 15 minutes
     * console.log(result.message); // Success message
     * ```
     */
    generateResetPasswordToken(phoneNumber: string, code: string): Promise<unknown>;

    /**
     * Resets user password using a validated reset token.
     * Updates password with bcrypt encryption and records password change timestamp.
     *
     * @param id User ID extracted from the validated reset token payload
     * @param newPassword New plain text password to hash and save
     * @returns Success message confirming password reset completion
     * @throws {NotFoundException} When user with specified ID does not exist
     * @throws {InternalServerErrorException} When password update operation fails
     *
     * @example
     * ```typescript
     * const message = await authService.resetPassword(123, 'newSecurePassword456');
     * console.log(message); // "Password reset successful"
     * // User can now login with new password
     * ```
     */
    resetPassword(id: number, newPassword: string): Promise<string>;
}

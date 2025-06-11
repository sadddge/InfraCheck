import type { User } from 'src/database/entities/user.entity';
import type { LoginResponseDto } from '../dto/login-response.dto';
import type { LoginDto } from '../dto/login.dto';

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
     * @param userId User ID to validate against the refresh token
     * @returns New authentication response with fresh access and refresh tokens
     * @throws {UnauthorizedException} When refresh token is invalid, expired, or revoked
     *
     * @example
     * ```typescript
     * const newTokens = await authService.refreshToken('eyJhbGciOiJIUzI1NiIs...', 123);
     * console.log(newTokens.accessToken); // New access token
     * console.log(newTokens.refreshToken); // New refresh token
     * ```
     */
    refreshToken(refreshToken: string, userId: number): Promise<LoginResponseDto>;

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
}

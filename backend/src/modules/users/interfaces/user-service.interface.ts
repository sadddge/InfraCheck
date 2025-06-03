import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';

/**
 * Service token for dependency injection of user service.
 * Used with NestJS Inject decorator to provide IUserService implementation.
 */
export const USER_SERVICE = 'USER_SERVICE';

/**
 * Interface defining the contract for user service implementations.
 * Provides comprehensive user management functionality including CRUD operations,
 * status management, and authentication-related user operations.
 *
 * User service interface providing:
 * - User CRUD operations (Create, Read, Update, Delete)
 * - User status management and approval workflows
 * - User registration for different roles
 * - Password-related user operations
 * - User filtering and querying capabilities
 *
 * @example
 * ```typescript
 * export class UsersService implements IUserService {
 *   async findById(id: number): Promise<UserDto> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IUserService {
    /**
     * Retrieves all users from the system with optional status filtering.
     * Supports administrative user listing with status-based filtering.
     *
     * @param status Optional user status filter to limit results
     * @returns Array of user data transfer objects
     *
     * @example
     * ```typescript
     * // Get all users
     * const allUsers = await userService.findAll();
     *
     * // Get only active users
     * const activeUsers = await userService.findAll(UserStatus.ACTIVE);
     * ```
     */
    findAll(status?: UserStatus): Promise<UserDto[]>;

    /**
     * Finds a user by their unique identifier.
     * Returns user information without sensitive data like passwords.
     *
     * @param id Unique user identifier
     * @returns User data transfer object
     * @throws {NotFoundException} When user with specified ID does not exist
     *
     * @example
     * ```typescript
     * const user = await userService.findById(123);
     * console.log(user.name); // Access user data
     * ```
     */
    findById(id: number): Promise<UserDto>;

    /**
     * Finds a user by their phone number.
     * Used for authentication and user lookup operations.
     *
     * @param phoneNumber Phone number in E.164 format
     * @returns User data transfer object
     * @throws {NotFoundException} When user with phone number does not exist
     *
     * @example
     * ```typescript
     * const user = await userService.findByPhoneNumber('+1234567890');
     * console.log(user.status); // Check user status
     * ```
     */
    findByPhoneNumber(phoneNumber: string): Promise<UserDto>;

    /**
     * Updates user profile information.
     * Allows modification of user data like name, lastName, and other profile fields.
     *
     * @param id User identifier to update
     * @param updateUserDto Data transfer object containing updated user information
     * @returns Updated user data transfer object
     * @throws {NotFoundException} When user with specified ID does not exist
     * @throws {ConflictException} When updated data conflicts with existing records
     *
     * @example
     * ```typescript
     * const updatedUser = await userService.update(123, {
     *   name: 'John',
     *   lastName: 'Smith'
     * });
     * ```
     */
    update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto>;

    /**
     * Updates user status for administrative approval workflows.
     * Used by administrators to approve, reject, or modify user access.
     *
     * @param id User identifier to update
     * @param status New user status to apply
     * @returns Updated user data transfer object
     * @throws {NotFoundException} When user with specified ID does not exist
     * @throws {ForbiddenException} When status transition is not allowed
     *
     * @example
     * ```typescript
     * // Approve a pending user
     * const approvedUser = await userService.updateStatus(123, UserStatus.ACTIVE);
     *
     * // Ban a user
     * const bannedUser = await userService.updateStatus(456, UserStatus.BANNED);
     * ```
     */
    updateStatus(id: number, status: UserStatus): Promise<UserDto>;

    /**
     * Registers a new neighbor user in the system.
     * Creates a user account with NEIGHBOR role and PENDING_VERIFICATION status.
     *
     * @param user Registration data including personal information and credentials
     * @returns Created user data transfer object
     * @throws {ConflictException} When phone number or email already exists
     * @throws {BadRequestException} When registration data is invalid
     *
     * @example
     * ```typescript
     * const newUser = await userService.registerNeighbor({
     *   phoneNumber: '+1234567890',
     *   password: 'hashedPassword',
     *   name: 'Jane',
     *   lastName: 'Doe',
     *   email: 'jane@example.com'
     * });
     * ```
     */
    registerNeighbor(user: RegisterDto): Promise<UserDto>;

    /**
     * Creates a new administrator user in the system.
     * Creates a user account with ADMIN role and appropriate permissions.
     *
     * @param user Registration data including administrative credentials
     * @returns Created admin user data transfer object
     * @throws {ConflictException} When phone number or email already exists
     * @throws {ForbiddenException} When current user lacks admin creation permissions
     *
     * @example
     * ```typescript
     * const newAdmin = await userService.createAdmin({
     *   phoneNumber: '+1234567890',
     *   password: 'hashedPassword',
     *   name: 'Admin',
     *   lastName: 'User',
     *   email: 'admin@example.com'
     * });
     * ```
     */
    createAdmin(user: RegisterDto): Promise<UserDto>;

    /**
     * Permanently removes a user from the system.
     * Deletes user account and associated data. This operation is irreversible.
     *
     * @param id User identifier to remove
     * @returns Resolves when user is successfully deleted
     * @throws {NotFoundException} When user with specified ID does not exist
     * @throws {ForbiddenException} When user deletion is not allowed
     *
     * @example
     * ```typescript
     * await userService.remove(123);
     * console.log('User successfully deleted');
     * ```
     */
    remove(id: number): Promise<void>;

    /**
     * Finds a user by ID including password hash for authentication.
     * Used internally for password verification and authentication operations.
     *
     * @param id User identifier to retrieve
     * @returns Complete user entity including password hash
     * @throws {NotFoundException} When user with specified ID does not exist
     *
     * @example
     * ```typescript
     * const userWithPassword = await userService.findByIdWithPassword(123);
     * const isValidPassword = await bcrypt.compare(plainPassword, userWithPassword.password);
     * ```
     */
    findByIdWithPassword(id: number): Promise<User>;

    /**
     * Finds a user by phone number including password hash for authentication.
     * Used for login operations and password-related authentication flows.
     *
     * @param phoneNumber Phone number in E.164 format
     * @returns Complete user entity including password hash
     * @throws {NotFoundException} When user with phone number does not exist
     *
     * @example
     * ```typescript
     * const userWithPassword = await userService.findByPhoneNumberWithPassword('+1234567890');
     * const isValidPassword = await bcrypt.compare(plainPassword, userWithPassword.password);
     * ```
     */
    findByPhoneNumberWithPassword(phoneNumber: string): Promise<User>;
}

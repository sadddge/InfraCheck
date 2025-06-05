import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import type { Repository } from 'typeorm';
import type { RegisterDto } from '../../auth/dto/register.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { UserDto } from '../dto/user.dto';
import { IUserService } from '../interfaces/user-service.interface';

/**
 * User management service providing CRUD operations and user-related business logic.
 * Handles user creation, retrieval, updates, and status management with proper data validation.
 * Core user service providing user creation during registration, user retrieval by ID and phone number,
 * user profile updates, user status management (admin only), password-related operations,
 * and user listing with filtering.
 *
 * @example
 * ```typescript
 * const userService = new UsersService(userRepository);
 * const users = await userService.findAll(UserStatus.ACTIVE);
 * const user = await userService.findById(123);
 * ```
 */
@Injectable()
export class UsersService implements IUserService {
    /**
     * Creates a new UsersService instance.
     *
     * @param userRepository TypeORM repository for User entity operations
     */
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {} /**
     * Retrieves all users with optional status filtering.
     * Returns user data without sensitive information like passwords.
     *
     * @param status Optional status filter for users
     * @returns Array of user DTOs without sensitive data
     *
     * @example
     * ```typescript
     * const activeUsers = await userService.findAll(UserStatus.ACTIVE);
     * const allUsers = await userService.findAll();
     * ```
     */
    async findAll(status?: UserStatus): Promise<UserDto[]> {
        const where = status ? { status: status } : {};
        return this.userRepository.find({
            where,
            select: {
                id: true,
                phoneNumber: true,
                name: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                passwordUpdatedAt: true,
            },
        });
    } /**
     * Finds a user by their unique ID.
     * Returns user data without sensitive information like passwords.
     *
     * @param id User's unique identifier
     * @returns User DTO without sensitive data
     * @throws NotFoundException When user with specified ID doesn't exist
     *
     * @example
     * ```typescript
     * try {
     *   const user = await userService.findById(123);
     *   console.log(user.name, user.phoneNumber);
     * } catch (error) {
     *   // Handle user not found
     * }
     * ```
     */
    async findById(id: number): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: {
                id: id,
            },
            select: {
                id: true,
                phoneNumber: true,
                name: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                passwordUpdatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    /**
     * Finds a user by their phone number.
     * Returns user data without sensitive information like passwords.
     * Phone number must be in E.164 format (+56912345678).
     *
     * @param phoneNumber User's phone number in E.164 format
     * @returns User DTO without sensitive data
     * @throws NotFoundException When user with specified phone number doesn't exist
     *
     * @example
     * ```typescript
     * try {
     *   const user = await userService.findByPhoneNumber('+56912345678');
     *   console.log(`Found user: ${user.name} ${user.lastName}`);
     * } catch (error) {
     *   // Handle user not found
     * }
     * ```
     */
    async findByPhoneNumber(phoneNumber: string): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: {
                phoneNumber: phoneNumber,
            },
            select: {
                id: true,
                phoneNumber: true,
                name: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                passwordUpdatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with phone number ${phoneNumber} not found`);
        }
        return user;
    }

    /**
     * Updates an existing user's profile information.
     * Automatically retrieves and returns the updated user data after modification.
     * Only provided fields in the DTO will be updated (partial update).
     *
     * @param id User's unique identifier
     * @param updateUserDto DTO containing fields to update
     * @returns Updated user DTO without sensitive data
     * @throws NotFoundException When user with specified ID doesn't exist
     *
     * @example
     * ```typescript
     * const updatedUser = await userService.update(123, {
     *   name: 'New Name',
     *   lastName: 'New LastName'
     * });
     * console.log(`Updated user: ${updatedUser.name}`);
     * ```
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
        await this.userRepository.update(id, updateUserDto);
        return this.findById(id);
    }

    /**
     * Updates a user's status (admin operation).
     * Changes user account status such as ACTIVE, SUSPENDED, or PENDING.
     * Requires administrative privileges to perform this operation.
     *
     * @param id User's unique identifier
     * @param status New status to assign to the user
     * @returns Updated user DTO with new status
     * @throws NotFoundException When user with specified ID doesn't exist
     *
     * @example
     * ```typescript
     * // Suspend a user account
     * const suspendedUser = await userService.updateStatus(123, UserStatus.SUSPENDED);
     *
     * // Reactivate a user account
     * const activeUser = await userService.updateStatus(123, UserStatus.ACTIVE);
     * ```
     */
    async updateStatus(id: number, status: UserStatus): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        user.status = status;
        await this.userRepository.save(user);
        return this.findById(id);
    }

    /**
     * Registers a new neighbor user with standard permissions.
     * Creates a new user account with NEIGHBOR role and PENDING status.
     * Validates that phone number is unique before creation.
     *
     * @param user Registration data including phone number, name, and password
     * @returns Newly created user DTO without sensitive data
     * @throws ConflictException When phone number already exists in the system
     *
     * @example
     * ```typescript
     * const newUser = await userService.registerNeighbor({
     *   phoneNumber: '+56912345678',
     *   name: 'Juan',
     *   lastName: 'Pérez',
     *   password: 'hashedPassword'
     * });
     * console.log(`Registered new neighbor: ${newUser.name}`);
     * ```
     */
    async registerNeighbor(user: RegisterDto): Promise<UserDto> {
        const existingUser = await this.userRepository.findOne({
            where: {
                phoneNumber: user.phoneNumber,
            },
        });
        if (existingUser) {
            throw new ConflictException(
                `User with phone number ${user.phoneNumber} already exists`,
            );
        }
        const newUser = this.userRepository.create(user);
        await this.userRepository.save(newUser);
        return this.findById(newUser.id);
    }

    /**
     * Creates a new administrator user with elevated permissions.
     * Creates a new user account with ADMIN role and full system access.
     * Validates that phone number is unique before creation.
     *
     * @param user Registration data including phone number, name, and password
     * @returns Newly created admin user DTO without sensitive data
     * @throws ConflictException When phone number already exists in the system
     *
     * @example
     * ```typescript
     * const newAdmin = await userService.createAdmin({
     *   phoneNumber: '+56987654321',
     *   name: 'Maria',
     *   lastName: 'González',
     *   password: 'hashedPassword'
     * });
     * console.log(`Created new admin: ${newAdmin.name} with role ${newAdmin.role}`);
     * ```
     */
    async createAdmin(user: RegisterDto): Promise<UserDto> {
        const existingUser = await this.userRepository.findOne({
            where: {
                phoneNumber: user.phoneNumber,
            },
        });
        if (existingUser) {
            throw new ConflictException(
                `User with phone number ${user.phoneNumber} already exists`,
            );
        }
        const newUser = this.userRepository.create(user);
        newUser.role = Role.ADMIN;
        await this.userRepository.save(newUser);
        return this.findById(newUser.id);
    }

    /**
     * Permanently removes a user from the system.
     * Performs hard deletion of user record from the database.
     * This operation is irreversible and should be used with caution.
     *
     * @param id User's unique identifier
     * @returns Promise that resolves when deletion is complete
     * @throws NotFoundException When user with specified ID doesn't exist
     *
     * @example
     * ```typescript
     * try {
     *   await userService.remove(123);
     *   console.log('User successfully deleted');
     * } catch (error) {
     *   console.error('Failed to delete user:', error.message);
     * }
     * ```
     */
    async remove(id: number): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    /**
     * Finds a user by ID including password field for authentication purposes.
     * Returns complete user entity including sensitive password data.
     * Should only be used for authentication and password-related operations.
     *
     * @param id User's unique identifier
     * @returns Complete user entity including password
     * @throws NotFoundException When user with specified ID doesn't exist
     *
     * @example
     * ```typescript
     * // Used during password verification
     * const userWithPassword = await userService.findByIdWithPassword(123);
     * const isValid = await bcrypt.compare(plainPassword, userWithPassword.password);
     * ```
     */
    async findByIdWithPassword(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                phoneNumber: true,
                password: true,
                name: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                passwordUpdatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    /**
     * Finds a user by phone number including password field for authentication purposes.
     * Returns complete user entity including sensitive password data.
     * Should only be used for login authentication and password-related operations.
     *
     * @param phoneNumber User's phone number in E.164 format
     * @returns Complete user entity including password
     * @throws NotFoundException When user with specified phone number doesn't exist
     *
     * @example
     * ```typescript
     * // Used during login authentication
     * const userWithPassword = await userService.findByPhoneNumberWithPassword('+56912345678');
     * const isValid = await bcrypt.compare(loginPassword, userWithPassword.password);
     * ```
     */
    async findByPhoneNumberWithPassword(phoneNumber: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { phoneNumber },
            select: {
                id: true,
                phoneNumber: true,
                password: true,
                name: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                passwordUpdatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with phone number ${phoneNumber} not found`);
        }
        return user;
    }
}

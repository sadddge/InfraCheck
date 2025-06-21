import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { userAlreadyExists, userNotFound } from 'src/common/helpers/exception.helper';
import { User } from 'src/database/entities/user.entity';
import { Equal, type Repository } from 'typeorm';
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
    ) {}

    /** @inheritDoc */
    async findAll(status?: UserStatus): Promise<UserDto[]> {
        const where = status ? { status: Equal(status) } : {};
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
    }

    /** @inheritDoc */
    async findById(id: number): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: {
                id: Equal(id),
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
            userNotFound();
        }
        return user;
    }

    /** @inheritDoc */
    async findByPhoneNumber(phoneNumber: string): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: {
                phoneNumber: Equal(phoneNumber),
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
            userNotFound();
        }
        return user;
    }

    /** @inheritDoc */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
        await this.userRepository.update(id, updateUserDto);
        return this.findById(id);
    }

    /** @inheritDoc */
    async updateStatus(id: number, status: UserStatus): Promise<UserDto> {
        const user = await this.userRepository.findOne({
            where: { id: Equal(id) },
        });
        if (!user) {
            userNotFound();
        }
        user.status = status;
        await this.userRepository.save(user);
        return this.findById(id);
    }

    /** @inheritDoc */
    async registerNeighbor(user: RegisterDto): Promise<UserDto> {
        const existingUser = await this.userRepository.findOne({
            where: {
                phoneNumber: Equal(user.phoneNumber),
            },
        });
        if (existingUser) {
            userAlreadyExists();
        }
        const newUser = this.userRepository.create(user);
        await this.userRepository.save(newUser);
        return this.findById(newUser.id);
    }

    /** @inheritDoc */
    async createAdmin(user: RegisterDto): Promise<UserDto> {
        const existingUser = await this.userRepository.findOne({
            where: {
                phoneNumber: Equal(user.phoneNumber),
            },
        });
        if (existingUser) {
            userAlreadyExists();
        }
        const newUser = this.userRepository.create(user);
        newUser.role = Role.ADMIN;
        await this.userRepository.save(newUser);
        return this.findById(newUser.id);
    }

    /** @inheritDoc */
    async remove(id: number): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            userNotFound();
        }
    }

    /** @inheritDoc */
    async findByIdWithPassword(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: Equal(id) },
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
            userNotFound();
        }
        return user;
    }

    /** @inheritDoc */
    async findByPhoneNumberWithPassword(phoneNumber: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { phoneNumber: Equal(phoneNumber) },
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
            userNotFound();
        }
        return user;
    }
}

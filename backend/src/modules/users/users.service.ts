import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import type { Repository } from 'typeorm';
import type { RegisterDto } from '../auth/dto/register.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserDto } from './dto/user.dto';
import { IUserService } from './interfaces/user-service.interface';
@Injectable()
export class UsersService implements IUserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(status?: string): Promise<UserDto[]> {
        const where = status ? { status: status as UserStatus } : {};
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

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
        await this.userRepository.update(id, updateUserDto);
        return this.findById(id);
    }

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

    async remove(id: number): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

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

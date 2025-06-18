import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: jest.Mocked<Repository<User>>;

    // Mock data
    const mockUser: User = {
        id: 1,
        name: 'Test User',
        lastName: 'Test Last',
        phoneNumber: '+1234567890',
        password: 'hashedPassword123',
        role: Role.NEIGHBOR,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        passwordUpdatedAt: new Date('2024-01-01T10:00:00Z'),
        refreshTokens: [],
        reports: [],
        comments: [],
        votes: [],
        reportChanges: [],
        messages: [],
        reportsFollowed: [],
    };

    const mockUserDto = {
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        name: mockUser.name,
        lastName: mockUser.lastName,
        role: mockUser.role,
        status: mockUser.status,
        createdAt: mockUser.createdAt,
        passwordUpdatedAt: mockUser.passwordUpdatedAt,
    };

    const mockRegisterDto: RegisterDto = {
        phoneNumber: '+1111111111',
        name: 'New User',
        lastName: 'New Last',
        password: 'newPassword123',
    };

    const mockUpdateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        lastName: 'Updated Last',
    };

    beforeEach(async () => {
        const mockUserRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users when no status filter is provided', async () => {
            // Arrange
            const users = [mockUserDto, { ...mockUserDto, id: 2, phoneNumber: '+0987654321' }];
            userRepository.find.mockResolvedValue(users as User[]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(userRepository.find).toHaveBeenCalledWith({
                where: {},
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
            expect(result).toEqual(users);
        });

        it('should return filtered users when status is provided', async () => {
            // Arrange
            const activeUsers = [mockUserDto];
            userRepository.find.mockResolvedValue(activeUsers as User[]);

            // Act
            const result = await service.findAll(UserStatus.ACTIVE);

            // Assert
            expect(userRepository.find).toHaveBeenCalledWith({
                where: { status: expect.any(Object) },
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
            expect(result).toEqual(activeUsers);
        });

        it('should return empty array when no users exist', async () => {
            // Arrange
            userRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return user by ID without password', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUserDto as User);

            // Act
            const result = await service.findById(1);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
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
            expect(result).toEqual(mockUserDto);
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
        });
    });

    describe('findByPhoneNumber', () => {
        it('should return user by phone number without password', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUserDto as User);

            // Act
            const result = await service.findByPhoneNumber('+1234567890');

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { phoneNumber: expect.any(Object) },
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
            expect(result).toEqual(mockUserDto);
        });

        it('should throw NotFoundException when user not found by phone', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByPhoneNumber('+9999999999')).rejects.toThrow(
                new NotFoundException('User with phone number +9999999999 not found'),
            );
        });
    });

    describe('update', () => {
        it('should update user and return updated data', async () => {
            // Arrange
            const updatedUserDto = { ...mockUserDto, ...mockUpdateUserDto };
            userRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

            // Mock the findById call that happens after update
            const findByIdSpy = jest.spyOn(service, 'findById').mockResolvedValue(updatedUserDto);

            // Act
            const result = await service.update(1, mockUpdateUserDto);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
            expect(findByIdSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual(updatedUserDto);
        });

        it('should handle update with partial data', async () => {
            // Arrange
            const partialUpdate = { name: 'Only Name Updated' };
            const updatedUserDto = { ...mockUserDto, name: 'Only Name Updated' };

            userRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

            // Act
            const result = await service.update(1, partialUpdate);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(1, partialUpdate);
            expect(result).toEqual(updatedUserDto);
        });
    });

    describe('updateStatus', () => {
        it('should update user status successfully', async () => {
            // Arrange
            const userWithNewStatus = { ...mockUser, status: UserStatus.PENDING_APPROVAL };
            const updatedUserDto = { ...mockUserDto, status: UserStatus.PENDING_APPROVAL };

            userRepository.findOne.mockResolvedValue(mockUser);
            userRepository.save.mockResolvedValue(userWithNewStatus);
            const findByIdSpy = jest.spyOn(service, 'findById').mockResolvedValue(updatedUserDto);

            // Act
            const result = await service.updateStatus(1, UserStatus.PENDING_APPROVAL);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
            });
            expect(userRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                status: UserStatus.PENDING_APPROVAL,
            });
            expect(findByIdSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual(updatedUserDto);
        });

        it('should throw NotFoundException when user not found for status update', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.updateStatus(999, UserStatus.ACTIVE)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );

            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('registerNeighbor', () => {
        it('should create a new neighbor user successfully', async () => {
            // Arrange
            const newUser = {
                ...mockRegisterDto,
                id: 3,
                role: Role.NEIGHBOR,
                status: UserStatus.PENDING_VERIFICATION,
                createdAt: new Date(),
                passwordUpdatedAt: null,
            };
            const newUserDto = {
                id: newUser.id,
                phoneNumber: newUser.phoneNumber,
                name: newUser.name,
                lastName: newUser.lastName,
                role: newUser.role,
                status: newUser.status,
                createdAt: newUser.createdAt,
                passwordUpdatedAt: newUser.passwordUpdatedAt,
            };

            userRepository.findOne.mockResolvedValue(null); // No existing user
            userRepository.create.mockReturnValue(newUser as User);
            userRepository.save.mockResolvedValue(newUser as User);
            const findByIdSpy = jest.spyOn(service, 'findById').mockResolvedValue(newUserDto);

            // Act
            const result = await service.registerNeighbor(mockRegisterDto);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { phoneNumber: expect.any(Object) },
            });
            expect(userRepository.create).toHaveBeenCalledWith(mockRegisterDto);
            expect(userRepository.save).toHaveBeenCalledWith(newUser);
            expect(findByIdSpy).toHaveBeenCalledWith(newUser.id);
            expect(result).toEqual(newUserDto);
        });

        it('should throw ConflictException when phone number already exists', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser); // Existing user

            // Act & Assert
            await expect(service.registerNeighbor(mockRegisterDto)).rejects.toThrow(
                new ConflictException(
                    `User with phone number ${mockRegisterDto.phoneNumber} already exists`,
                ),
            );

            expect(userRepository.create).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('createAdmin', () => {
        it('should create a new admin user successfully', async () => {
            // Arrange
            const newAdmin = {
                ...mockRegisterDto,
                id: 4,
                role: Role.ADMIN,
                status: UserStatus.PENDING_VERIFICATION,
                createdAt: new Date(),
                passwordUpdatedAt: null,
            };
            const newAdminDto = {
                id: newAdmin.id,
                phoneNumber: newAdmin.phoneNumber,
                name: newAdmin.name,
                lastName: newAdmin.lastName,
                role: newAdmin.role,
                status: newAdmin.status,
                createdAt: newAdmin.createdAt,
                passwordUpdatedAt: newAdmin.passwordUpdatedAt,
            };

            userRepository.findOne.mockResolvedValue(null); // No existing user
            userRepository.create.mockReturnValue(newAdmin as User);
            userRepository.save.mockResolvedValue(newAdmin as User);
            const findByIdSpy = jest.spyOn(service, 'findById').mockResolvedValue(newAdminDto);

            // Act
            const result = await service.createAdmin(mockRegisterDto);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { phoneNumber: expect.any(Object) },
            });
            expect(userRepository.create).toHaveBeenCalledWith(mockRegisterDto);
            expect(userRepository.save).toHaveBeenCalledWith({
                ...newAdmin,
                role: Role.ADMIN,
            });
            expect(findByIdSpy).toHaveBeenCalledWith(newAdmin.id);
            expect(result).toEqual(newAdminDto);
        });

        it('should throw ConflictException when phone number already exists for admin creation', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser); // Existing user

            // Act & Assert
            await expect(service.createAdmin(mockRegisterDto)).rejects.toThrow(
                new ConflictException(
                    `User with phone number ${mockRegisterDto.phoneNumber} already exists`,
                ),
            );

            expect(userRepository.create).not.toHaveBeenCalled();
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove user successfully', async () => {
            // Arrange
            const deleteResult: DeleteResult = { affected: 1, raw: {} };
            userRepository.delete.mockResolvedValue(deleteResult);

            // Act
            await service.remove(1);

            // Assert
            expect(userRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when user not found for deletion', async () => {
            // Arrange
            const deleteResult: DeleteResult = { affected: 0, raw: {} };
            userRepository.delete.mockResolvedValue(deleteResult);

            // Act & Assert
            await expect(service.remove(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
        });
    });

    describe('findByIdWithPassword', () => {
        it('should return user with password for authentication', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await service.findByIdWithPassword(1);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
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
            expect(result).toEqual(mockUser);
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException when user not found with password', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByIdWithPassword(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
        });
    });

    describe('findByPhoneNumberWithPassword', () => {
        it('should return user with password for authentication', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await service.findByPhoneNumberWithPassword('+1234567890');

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { phoneNumber: expect.any(Object) },
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
            expect(result).toEqual(mockUser);
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException when user not found by phone with password', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findByPhoneNumberWithPassword('+9999999999')).rejects.toThrow(
                new NotFoundException('User with phone number +9999999999 not found'),
            );
        });
    });

    describe('error handling', () => {
        it('should handle database errors in findAll', async () => {
            // Arrange
            userRepository.find.mockRejectedValue(new Error('Database connection error'));

            // Act & Assert
            await expect(service.findAll()).rejects.toThrow('Database connection error');
        });

        it('should handle database errors in save operation', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null); // No existing user
            userRepository.create.mockReturnValue({} as User);
            userRepository.save.mockRejectedValue(new Error('Save operation failed'));

            // Act & Assert
            await expect(service.registerNeighbor(mockRegisterDto)).rejects.toThrow(
                'Save operation failed',
            );
        });

        it('should handle database errors in update operation', async () => {
            // Arrange
            userRepository.update.mockRejectedValue(new Error('Update operation failed'));

            // Act & Assert
            await expect(service.update(1, mockUpdateUserDto)).rejects.toThrow(
                'Update operation failed',
            );
        });

        it('should handle database errors in delete operation', async () => {
            // Arrange
            userRepository.delete.mockRejectedValue(new Error('Delete operation failed'));

            // Act & Assert
            await expect(service.remove(1)).rejects.toThrow('Delete operation failed');
        });
    });

    describe('edge cases', () => {
        it('should handle empty update DTO', async () => {
            // Arrange
            const emptyUpdate = {};
            userRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

            // Act
            const result = await service.update(1, emptyUpdate);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(1, emptyUpdate);
            expect(result).toEqual(mockUserDto);
        });

        it('should handle status update to same status', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);

            // Act
            const result = await service.updateStatus(1, UserStatus.ACTIVE); // Same status

            // Assert
            expect(userRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                status: UserStatus.ACTIVE,
            });
            expect(result).toEqual(mockUserDto);
        });
    });
});

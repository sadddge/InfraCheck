import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { IUserService, USER_SERVICE } from '../interfaces/user-service.interface';
import { UsersController } from './users.controller';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: jest.Mocked<IUserService>;

    const mockUsersService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        findByPhoneNumber: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        registerNeighbor: jest.fn(),
        createAdmin: jest.fn(),
        remove: jest.fn(),
        findByIdWithPassword: jest.fn(),
        findByPhoneNumberWithPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: USER_SERVICE, useValue: mockUsersService }],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get(USER_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should call usersService.findAll with no status filter and return all users', async () => {
            const query: UserQueryDto = {};
            const mockUsers = [
                {
                    id: 1,
                    phoneNumber: '+56912345678',
                    name: 'John',
                    lastName: 'Doe',
                    status: UserStatus.ACTIVE,
                    role: Role.NEIGHBOR,
                    createdAt: new Date(),
                },
                {
                    id: 2,
                    phoneNumber: '+56987654321',
                    name: 'Jane',
                    lastName: 'Smith',
                    status: UserStatus.PENDING_VERIFICATION,
                    role: Role.NEIGHBOR,
                    createdAt: new Date(),
                },
            ];

            mockUsersService.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll(query);

            expect(usersService.findAll).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(mockUsers);
        });

        it('should call usersService.findAll with status filter when provided', async () => {
            const query: UserQueryDto = { status: UserStatus.ACTIVE };
            const mockActiveUsers = [
                {
                    id: 1,
                    phoneNumber: '+56912345678',
                    name: 'John',
                    lastName: 'Doe',
                    status: UserStatus.ACTIVE,
                    role: Role.NEIGHBOR,
                    createdAt: new Date(),
                },
            ];

            mockUsersService.findAll.mockResolvedValue(mockActiveUsers);

            const result = await controller.findAll(query);

            expect(usersService.findAll).toHaveBeenCalledWith(UserStatus.ACTIVE);
            expect(result).toEqual(mockActiveUsers);
        });

        it('should propagate errors from usersService.findAll', async () => {
            const query: UserQueryDto = {};
            const error = new Error('Database connection failed');
            mockUsersService.findAll.mockRejectedValue(error);

            await expect(controller.findAll(query)).rejects.toThrow('Database connection failed');
            expect(usersService.findAll).toHaveBeenCalledWith(undefined);
        });
    });

    describe('findOne', () => {
        it('should call usersService.findById with correct id and return user', async () => {
            const userId = '123';
            const mockUser = {
                id: 123,
                phoneNumber: '+56912345678',
                name: 'John',
                lastName: 'Doe',
                status: UserStatus.ACTIVE,
                role: Role.NEIGHBOR,
                createdAt: new Date(),
            };

            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await controller.findOne(userId);

            expect(usersService.findById).toHaveBeenCalledWith(123);
            expect(result).toEqual(mockUser);
        });

        it('should propagate errors from usersService.findById', async () => {
            const userId = '999';
            const error = new Error('User not found');
            mockUsersService.findById.mockRejectedValue(error);

            await expect(controller.findOne(userId)).rejects.toThrow('User not found');
            expect(usersService.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('update', () => {
        it('should call usersService.update with correct parameters and return updated user', async () => {
            const userId = '123';
            const updateUserDto: UpdateUserDto = {
                name: 'Updated John',
                lastName: 'Updated Doe',
            };

            const mockUpdatedUser = {
                id: 123,
                phoneNumber: '+56912345678',
                name: 'Updated John',
                lastName: 'Updated Doe',
                status: UserStatus.ACTIVE,
                role: Role.NEIGHBOR,
                createdAt: new Date(),
            };

            mockUsersService.update.mockResolvedValue(mockUpdatedUser);

            const result = await controller.update(userId, updateUserDto);

            expect(usersService.update).toHaveBeenCalledWith(123, updateUserDto);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should propagate errors from usersService.update', async () => {
            const userId = '999';
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Name',
            };
            const error = new Error('User not found');
            mockUsersService.update.mockRejectedValue(error);

            await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
                'User not found',
            );
            expect(usersService.update).toHaveBeenCalledWith(999, updateUserDto);
        });

        it('should handle partial updates correctly', async () => {
            const userId = '123';
            const partialUpdateDto: UpdateUserDto = {
                name: 'Only Name Updated',
            };

            const mockUpdatedUser = {
                id: 123,
                phoneNumber: '+56912345678',
                name: 'Only Name Updated',
                lastName: 'Original LastName',
                status: UserStatus.ACTIVE,
                role: Role.NEIGHBOR,
                createdAt: new Date(),
            };

            mockUsersService.update.mockResolvedValue(mockUpdatedUser);

            const result = await controller.update(userId, partialUpdateDto);

            expect(usersService.update).toHaveBeenCalledWith(123, partialUpdateDto);
            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('updateStatus', () => {
        it('should call usersService.updateStatus with correct parameters and return updated user', async () => {
            const userId = '123';
            const updateUserStatusDto: UpdateUserStatusDto = {
                status: UserStatus.REJECTED,
            };

            const mockUpdatedUser = {
                id: 123,
                phoneNumber: '+56912345678',
                name: 'John',
                lastName: 'Doe',
                status: UserStatus.REJECTED,
                role: Role.NEIGHBOR,
                createdAt: new Date(),
            };

            mockUsersService.updateStatus.mockResolvedValue(mockUpdatedUser);

            const result = await controller.updateStatus(userId, updateUserStatusDto);

            expect(usersService.updateStatus).toHaveBeenCalledWith(123, updateUserStatusDto.status);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should propagate errors from usersService.updateStatus', async () => {
            const userId = '999';
            const updateUserStatusDto: UpdateUserStatusDto = {
                status: UserStatus.REJECTED,
            };
            const error = new Error('User not found');
            mockUsersService.updateStatus.mockRejectedValue(error);

            await expect(controller.updateStatus(userId, updateUserStatusDto)).rejects.toThrow(
                'User not found',
            );
            expect(usersService.updateStatus).toHaveBeenCalledWith(999, updateUserStatusDto.status);
        });

        it('should handle different status transitions', async () => {
            const userId = '123';
            const activateStatusDto: UpdateUserStatusDto = {
                status: UserStatus.ACTIVE,
            };

            const mockActivatedUser = {
                id: 123,
                phoneNumber: '+56912345678',
                name: 'John',
                lastName: 'Doe',
                status: UserStatus.ACTIVE,
                role: Role.NEIGHBOR,
                createdAt: new Date(),
            };

            mockUsersService.updateStatus.mockResolvedValue(mockActivatedUser);

            const result = await controller.updateStatus(userId, activateStatusDto);

            expect(usersService.updateStatus).toHaveBeenCalledWith(123, UserStatus.ACTIVE);
            expect(result).toEqual(mockActivatedUser);
            expect(result.status).toBe(UserStatus.ACTIVE);
        });
    });

    describe('remove', () => {
        it('should call usersService.remove with correct id', async () => {
            const userId = '123';

            mockUsersService.remove.mockResolvedValue(undefined);

            await controller.remove(userId);

            expect(usersService.remove).toHaveBeenCalledWith(123);
        });

        it('should propagate errors from usersService.remove', async () => {
            const userId = '999';
            const error = new Error('User not found');
            mockUsersService.remove.mockRejectedValue(error);

            await expect(controller.remove(userId)).rejects.toThrow('User not found');
            expect(usersService.remove).toHaveBeenCalledWith(999);
        });

        it('should handle forbidden deletion attempts', async () => {
            const userId = '123';
            const error = new Error('Forbidden: Cannot delete this user');
            mockUsersService.remove.mockRejectedValue(error);

            await expect(controller.remove(userId)).rejects.toThrow(
                'Forbidden: Cannot delete this user',
            );
            expect(usersService.remove).toHaveBeenCalledWith(123);
        });

        it('should return void on successful deletion', async () => {
            const userId = '123';

            mockUsersService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(userId);

            expect(usersService.remove).toHaveBeenCalledWith(123);
            expect(result).toBeUndefined();
        });
    });
});

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { JwtResetPayload } from 'src/common/interfaces/jwt-payload.interface';
import { User } from 'src/database/entities/user.entity';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { JwtResetStrategy } from './jwt-reset.strategy';

describe('JwtResetStrategy', () => {
    let strategy: JwtResetStrategy;
    let userService: jest.Mocked<IUserService>;
    let configService: jest.Mocked<ConfigService>;

    const mockUser: User = {
        id: 1,
        phoneNumber: '+1234567890',
        password: 'hashedPassword',
        name: 'John',
        lastName: 'Doe',
        status: UserStatus.ACTIVE,
        role: Role.NEIGHBOR,
        createdAt: new Date(),
        passwordUpdatedAt: new Date('2023-01-01'),
        reports: [],
        votes: [],
        comments: [],
        refreshTokens: [],
        messages: [],
        reportChanges: [],
        reportsFollowed: [],
    };

    beforeEach(async () => {
        const mockUserService = {
            findById: jest.fn(),
            findByPhoneNumberWithPassword: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
        };

        const mockConfigService = {
            get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
                const config = {
                    JWT_EXPIRATION: '15m',
                    JWT_REFRESH_EXPIRATION: '7d',
                    JWT_RESET_EXPIRATION: '15m',
                };
                return config[key] ?? defaultValue;
            }),
            getOrThrow: jest.fn((key: string) => {
                const config = {
                    JWT_SECRET: 'test-secret',
                    JWT_REFRESH_SECRET: 'test-refresh-secret',
                    JWT_RESET_SECRET: 'test-reset-secret',
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtResetStrategy,
                {
                    provide: USER_SERVICE,
                    useValue: mockUserService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtResetStrategy>(JwtResetStrategy);
        userService = module.get(USER_SERVICE);
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        const basePayload: JwtResetPayload = {
            sub: '1',
            scope: 'reset_password',
            iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };

        it('should return user object when token is valid', async () => {
            // Arrange
            userService.findById.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(basePayload);

            // Assert
            expect(result).toEqual({
                id: 1,
            });
            expect(userService.findById).toHaveBeenCalledWith(1);
        });

        it('should throw UnauthorizedException when scope is not reset_password', async () => {
            // Arrange
            const invalidPayload = {
                ...basePayload,
                scope: 'invalid_scope' as 'reset_password',
            };

            // Act & Assert
            await expect(strategy.validate(invalidPayload)).rejects.toThrow(
                new UnauthorizedException('Invalid token scope'),
            );
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            // Arrange
            userService.findById.mockRejectedValue(new Error('User not found'));

            // Act & Assert
            await expect(strategy.validate(basePayload)).rejects.toThrow();
        });

        it('should throw UnauthorizedException when user is inactive', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, status: UserStatus.REJECTED };
            userService.findById.mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(strategy.validate(basePayload)).rejects.toThrow(
                new UnauthorizedException('User not found or inactive'),
            );
        });

        it('should allow PENDING_APPROVAL users', async () => {
            // Arrange
            const pendingUser = { ...mockUser, status: UserStatus.PENDING_APPROVAL };
            userService.findById.mockResolvedValue(pendingUser);

            // Act
            const result = await strategy.validate(basePayload);

            // Assert
            expect(result).toEqual({
                id: 1,
            });
        });

        it('should throw UnauthorizedException when password was changed after token issued', async () => {
            // Arrange
            const recentPasswordUpdate = new Date();
            const userWithRecentPasswordUpdate = {
                ...mockUser,
                passwordUpdatedAt: recentPasswordUpdate,
            };
            const oldTokenPayload = {
                ...basePayload,
                iat: Math.floor((recentPasswordUpdate.getTime() - 1000) / 1000), // Token issued before password change
            };

            userService.findById.mockResolvedValue(userWithRecentPasswordUpdate);

            // Act & Assert
            await expect(strategy.validate(oldTokenPayload)).rejects.toThrow(
                new UnauthorizedException('Password has already been changed'),
            );
        });

        it('should allow token when password was changed before token issued', async () => {
            // Arrange
            const oldPasswordUpdate = new Date('2023-01-01');
            const userWithOldPasswordUpdate = {
                ...mockUser,
                passwordUpdatedAt: oldPasswordUpdate,
            };
            const newTokenPayload = {
                ...basePayload,
                iat: Math.floor((oldPasswordUpdate.getTime() + 1000) / 1000), // Token issued after password change
            };

            userService.findById.mockResolvedValue(userWithOldPasswordUpdate);

            // Act
            const result = await strategy.validate(newTokenPayload);

            // Assert
            expect(result).toEqual({
                id: 1,
            });
        });

        it('should handle user with null passwordUpdatedAt', async () => {
            // Arrange
            const userWithNullPasswordUpdate = {
                ...mockUser,
                passwordUpdatedAt: null,
            };
            userService.findById.mockResolvedValue(userWithNullPasswordUpdate);

            // Act
            const result = await strategy.validate(basePayload);

            // Assert
            expect(result).toEqual({
                id: 1,
            });
        });

        it('should handle user with null passwordUpdatedAt', async () => {
            // Arrange
            const userWithNullPasswordUpdate = {
                ...mockUser,
                passwordUpdatedAt: null,
            };
            userService.findById.mockResolvedValue(userWithNullPasswordUpdate);

            // Act
            const result = await strategy.validate(basePayload);

            // Assert
            expect(result).toEqual({
                id: 1,
            });
        });

        it('should convert string sub to number correctly', async () => {
            // Arrange
            const stringSubPayload = { ...basePayload, sub: '999' };
            const userWithId999 = { ...mockUser, id: 999 };
            userService.findById.mockResolvedValue(userWithId999);

            // Act
            const result = await strategy.validate(stringSubPayload);

            // Assert
            expect(result).toEqual({
                id: 999,
            });
            expect(userService.findById).toHaveBeenCalledWith(999);
        });

        it('should handle service errors correctly', async () => {
            // Arrange
            const serviceError = new Error('Database connection failed');
            userService.findById.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(strategy.validate(basePayload)).rejects.toThrow(serviceError);
        });
    });

    describe('constructor', () => {
        it('should load reset secret from config service', () => {
            // Assert
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_RESET_SECRET');
        });
    });
});

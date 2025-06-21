import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import { expectAuthErrorAsync } from '../../../common/test-helpers/exception-test.helper';
import { AUTH_SERVICE, IAuthService } from '../interfaces/auth-service.interface';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

describe('JwtRefreshStrategy', () => {
    let strategy: JwtRefreshStrategy;
    let authService: jest.Mocked<IAuthService>;
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
        passwordUpdatedAt: new Date(),
        reports: [],
        votes: [],
        comments: [],
        refreshTokens: [],
        messages: [],
        reportChanges: [],
        reportsFollowed: [],
    };

    beforeEach(async () => {
        const mockAuthService = {
            getUserIfRefreshTokenMatches: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
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
                    JWT_REFRESH_SECRET: 'test-refresh-secret',
                    JWT_SECRET: 'test-secret',
                    JWT_RESET_SECRET: 'test-reset-secret',
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtRefreshStrategy,
                {
                    provide: AUTH_SERVICE,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
        authService = module.get(AUTH_SERVICE);
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });
    describe('validate', () => {
        // Use Record type for proper typing without TypeScript errors
        let mockRequest: Record<string, unknown> & { body: Record<string, unknown> };

        beforeEach(() => {
            mockRequest = {
                body: {
                    refreshToken: 'mock-refresh-token',
                },
            };
        });
        it('should return user when refresh token matches', async () => {
            // Arrange
            const payload = { sub: 1 };
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(mockRequest as unknown as Request, payload);

            // Assert
            expect(result).toEqual(mockUser);
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
                'mock-refresh-token',
                1,
            );
        });
        it('should throw AppException with INVALID_REFRESH_TOKEN when refresh token does not match', async () => {
            // Arrange
            const payload = { sub: 1 };
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate(mockRequest as unknown as Request, payload),
            ).rejects.toThrow(expectAuthErrorAsync.invalidRefreshToken());
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
                'mock-refresh-token',
                1,
            );
        });

        it('should handle different user IDs correctly', async () => {
            // Arrange
            const payload = { sub: 999 };
            const differentUser = { ...mockUser, id: 999 };
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(differentUser);

            // Act
            const result = await strategy.validate(mockRequest as unknown as Request, payload);

            // Assert
            expect(result).toEqual(differentUser);
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
                'mock-refresh-token',
                999,
            );
        });

        it('should extract refresh token from request body correctly', async () => {
            // Arrange
            const payload = { sub: 1 };
            mockRequest.body.refreshToken = 'different-refresh-token';
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(mockUser);

            // Act
            await strategy.validate(mockRequest as unknown as Request, payload);

            // Assert
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
                'different-refresh-token',
                1,
            );
        });
        it('should handle missing refresh token in request body', async () => {
            // Arrange
            const payload = { sub: 1 };
            mockRequest.body = {}; // No refreshToken field
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate(mockRequest as unknown as Request, payload),
            ).rejects.toThrow(expectAuthErrorAsync.invalidRefreshToken());
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(undefined, 1);
        });

        it('should handle payload with additional properties', async () => {
            // Arrange
            const payload = {
                sub: 1,
                additionalProp: 'value',
                anotherProp: 123,
            };
            authService.getUserIfRefreshTokenMatches.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(mockRequest as unknown as Request, payload);

            // Assert
            expect(result).toEqual(mockUser);
            expect(authService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
                'mock-refresh-token',
                1,
            );
        });

        it('should handle service errors correctly', async () => {
            // Arrange
            const payload = { sub: 1 };
            const serviceError = new Error('Database connection failed');
            authService.getUserIfRefreshTokenMatches.mockRejectedValue(serviceError);

            // Act & Assert
            await expect(
                strategy.validate(mockRequest as unknown as Request, payload),
            ).rejects.toThrow(serviceError);
        });
    });

    describe('constructor', () => {
        it('should load refresh secret from config service', () => {
            // Assert
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
        });
    });
});

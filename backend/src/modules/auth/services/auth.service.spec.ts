import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { IUserService, USER_SERVICE } from '../../users/interfaces/user-service.interface';
import { LoginDto } from '../dto/login.dto';
import {
    AccountNotActiveException,
    InvalidCredentialsException,
    InvalidRefreshTokenException,
} from '../exceptions/auth.exceptions';
import { AuthService } from './auth.service';
import { TokenFactoryService } from './token-factory.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<IUserService>;
    let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
    let tokenFactory: jest.Mocked<TokenFactoryService>;

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

    const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
    };

    const mockRefreshTokenEntity: RefreshToken = {
        id: 1,
        token: 'mock-refresh-token',
        user: mockUser,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
    };

    beforeEach(async () => {
        const mockUserService = {
            findByPhoneNumberWithPassword: jest.fn(),
        };

        const mockRefreshTokenRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        };

        const mockTokenFactory = {
            generateTokenPair: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: USER_SERVICE,
                    useValue: mockUserService,
                },
                {
                    provide: getRepositoryToken(RefreshToken),
                    useValue: mockRefreshTokenRepository,
                },
                {
                    provide: TokenFactoryService,
                    useValue: mockTokenFactory,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(USER_SERVICE);
        refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
        tokenFactory = module.get(TokenFactoryService);

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            phoneNumber: '+1234567890',
            password: 'password123',
        };

        it('should successfully login a user with valid credentials', async () => {
            // Arrange
            bcrypt.compare.mockResolvedValue(true);
            userService.findByPhoneNumberWithPassword.mockResolvedValue(mockUser);
            tokenFactory.generateTokenPair.mockResolvedValue(mockTokens);
            refreshTokenRepository.create.mockReturnValue(mockRefreshTokenEntity);
            refreshTokenRepository.save.mockResolvedValue(mockRefreshTokenEntity);

            // Act
            const result = await service.login(loginDto);

            // Assert
            expect(result).toEqual({
                ...mockTokens,
                user: {
                    id: mockUser.id,
                    phoneNumber: mockUser.phoneNumber,
                    name: mockUser.name,
                    lastName: mockUser.lastName,
                    role: mockUser.role,
                },
            });
            expect(userService.findByPhoneNumberWithPassword).toHaveBeenCalledWith(
                loginDto.phoneNumber,
            );
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(tokenFactory.generateTokenPair).toHaveBeenCalledWith(mockUser);
        });

        it('should throw InvalidCredentialsException when user is not found', async () => {
            // Arrange
            userService.findByPhoneNumberWithPassword.mockRejectedValue(new NotFoundException());

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsException);
        });

        it('should throw InvalidCredentialsException when password is incorrect', async () => {
            // Arrange
            bcrypt.compare.mockResolvedValue(false);
            userService.findByPhoneNumberWithPassword.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsException);
        });

        it('should throw AccountNotActiveException when user is not active', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, status: UserStatus.PENDING_APPROVAL };
            bcrypt.compare.mockResolvedValue(true);
            userService.findByPhoneNumberWithPassword.mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(AccountNotActiveException);
        });
    });

    describe('refreshToken', () => {
        const refreshToken = 'mock-refresh-token';
        const userId = 1;

        it('should successfully refresh tokens with valid refresh token', async () => {
            // Arrange
            refreshTokenRepository.findOne
                .mockResolvedValueOnce(mockRefreshTokenEntity) // For getUserIfRefreshTokenMatches
                .mockResolvedValueOnce(mockRefreshTokenEntity); // For finding token to invalidate
            tokenFactory.generateTokenPair.mockResolvedValue(mockTokens);
            refreshTokenRepository.create.mockReturnValue(mockRefreshTokenEntity);
            refreshTokenRepository.save.mockResolvedValue(mockRefreshTokenEntity);
            refreshTokenRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

            // Act
            const result = await service.refreshToken(refreshToken, userId);

            // Assert
            expect(result).toEqual({
                ...mockTokens,
                user: {
                    id: mockUser.id,
                    phoneNumber: mockUser.phoneNumber,
                    name: mockUser.name,
                    lastName: mockUser.lastName,
                    role: mockUser.role,
                },
            });
            expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
                id: mockRefreshTokenEntity.id,
            });
            expect(tokenFactory.generateTokenPair).toHaveBeenCalledWith(mockUser);
        });

        it('should throw InvalidRefreshTokenException when refresh token is invalid', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.refreshToken(refreshToken, userId)).rejects.toThrow(
                InvalidRefreshTokenException,
            );
        });
    });

    describe('getUserIfRefreshTokenMatches', () => {
        const refreshToken = 'mock-refresh-token';
        const userId = 1;

        it('should return user when refresh token is valid and not expired', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);

            // Act
            const result = await service.getUserIfRefreshTokenMatches(refreshToken, userId);

            // Assert
            expect(result).toEqual(mockUser);
            expect(refreshTokenRepository.findOne).toHaveBeenCalledTimes(1);
            const callArgs = refreshTokenRepository.findOne.mock.calls[0][0];
            expect(callArgs.relations).toEqual(['user']);
            expect(callArgs.where).toBeDefined();
            // TypeORM creates EqualOperator objects for where clauses
            const whereClause = callArgs.where as Record<string, unknown>;
            expect((whereClause.token as { _value: string })._value).toBe(refreshToken);
            expect((whereClause.user as { id: { _value: number } }).id._value).toBe(userId);
        });

        it('should return null when refresh token is not found', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(null);

            // Act
            const result = await service.getUserIfRefreshTokenMatches(refreshToken, userId);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when refresh token is expired', async () => {
            // Arrange
            const expiredToken = {
                ...mockRefreshTokenEntity,
                expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
            };
            refreshTokenRepository.findOne.mockResolvedValue(expiredToken);

            // Act
            const result = await service.getUserIfRefreshTokenMatches(refreshToken, userId);

            // Assert
            expect(result).toBeNull();
        });
    });
});

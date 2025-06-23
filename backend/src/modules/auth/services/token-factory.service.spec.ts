import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/database/entities/user.entity';
import {
    TEST_AUTH_DATA,
    TEST_IDS,
    TEST_PHONE_NUMBERS,
    TEST_USER_DATA,
    createMockUser,
} from '../../../common/test-helpers';
import { TokenFactoryService } from './token-factory.service';

describe('TokenFactoryService', () => {
    let service: TokenFactoryService;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;
    const mockUser: User = createMockUser({
        id: TEST_IDS.USER_ID,
        phoneNumber: TEST_PHONE_NUMBERS.VALID,
        password: TEST_AUTH_DATA.HASHED_PASSWORD,
        name: TEST_USER_DATA.NAME.split(' ')[0],
        lastName: TEST_USER_DATA.LAST_NAME,
    });

    const mockJwtConfig = {
        secret: 'test-secret',
        refreshSecret: 'test-refresh-secret',
        accessTokenExpiration: '15m',
        refreshTokenExpiration: '7d',
        resetTokenExpiration: '1h',
        resetSecret: 'test-reset-secret',
    };

    beforeEach(async () => {
        const mockJwtService = {
            signAsync: jest.fn(),
        };

        const mockConfigService = {
            getOrThrow: jest.fn((key: string) => {
                const config = {
                    JWT_SECRET: mockJwtConfig.secret,
                    JWT_REFRESH_SECRET: mockJwtConfig.refreshSecret,
                    JWT_EXPIRATION: mockJwtConfig.accessTokenExpiration,
                    JWT_REFRESH_EXPIRATION: mockJwtConfig.refreshTokenExpiration,
                    JWT_RESET_SECRET: mockJwtConfig.resetSecret,
                    JWT_RESET_EXPIRATION: mockJwtConfig.resetTokenExpiration,
                };
                return config[key];
            }),
            get: jest.fn((key: string, defaultValue?: string) => {
                const config = {
                    JWT_SECRET: mockJwtConfig.secret,
                    JWT_REFRESH_SECRET: mockJwtConfig.refreshSecret,
                    JWT_EXPIRATION: mockJwtConfig.accessTokenExpiration,
                    JWT_REFRESH_EXPIRATION: mockJwtConfig.refreshTokenExpiration,
                    JWT_RESET_SECRET: mockJwtConfig.resetSecret,
                    JWT_RESET_EXPIRATION: mockJwtConfig.resetTokenExpiration,
                };
                return config[key] ?? defaultValue;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenFactoryService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<TokenFactoryService>(TokenFactoryService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTokenPair', () => {
        it('should generate both access and refresh tokens', async () => {
            // Arrange
            const mockAccessToken = TEST_AUTH_DATA.ACCESS_TOKEN;
            const mockRefreshToken = TEST_AUTH_DATA.REFRESH_TOKEN;

            jwtService.signAsync
                .mockResolvedValueOnce(mockAccessToken)
                .mockResolvedValueOnce(mockRefreshToken);

            // Act
            const result = await service.generateTokenPair(mockUser);

            // Assert
            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
            });
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
        });
        it('should generate access token with correct payload and options', async () => {
            // Arrange
            const mockAccessToken = TEST_AUTH_DATA.ACCESS_TOKEN;
            const mockRefreshToken = TEST_AUTH_DATA.REFRESH_TOKEN;

            jwtService.signAsync
                .mockResolvedValueOnce(mockAccessToken)
                .mockResolvedValueOnce(mockRefreshToken);

            // Act
            await service.generateTokenPair(mockUser);

            // Assert
            const accessTokenCall = jwtService.signAsync.mock.calls[0];
            expect(accessTokenCall[0]).toEqual({
                sub: mockUser.id,
                phoneNumber: mockUser.phoneNumber,
                role: mockUser.role,
            });
            expect(accessTokenCall[1]).toEqual({
                expiresIn: mockJwtConfig.accessTokenExpiration,
                secret: mockJwtConfig.secret,
            });
        });
        it('should generate refresh token with correct payload and options', async () => {
            // Arrange
            const mockAccessToken = TEST_AUTH_DATA.ACCESS_TOKEN;
            const mockRefreshToken = TEST_AUTH_DATA.REFRESH_TOKEN;

            jwtService.signAsync
                .mockResolvedValueOnce(mockAccessToken)
                .mockResolvedValueOnce(mockRefreshToken);

            // Act
            await service.generateTokenPair(mockUser);

            // Assert
            const refreshTokenCall = jwtService.signAsync.mock.calls[1];
            expect(refreshTokenCall[0]).toEqual({
                sub: mockUser.id,
            });
            expect(refreshTokenCall[1]).toEqual({
                expiresIn: mockJwtConfig.refreshTokenExpiration,
                secret: mockJwtConfig.refreshSecret,
            });
        });

        it('should handle JWT signing errors', async () => {
            // Arrange
            const jwtError = new Error('JWT signing failed');
            jwtService.signAsync.mockRejectedValue(jwtError);

            // Act & Assert
            await expect(service.generateTokenPair(mockUser)).rejects.toThrow(jwtError);
        });
    });

    describe('configuration', () => {
        it('should load JWT configuration from ConfigService', () => {
            // Assert
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_RESET_SECRET');
            expect(configService.get).toHaveBeenCalledWith('JWT_EXPIRATION', '15m');
            expect(configService.get).toHaveBeenCalledWith('JWT_REFRESH_EXPIRATION', '7d');
            expect(configService.get).toHaveBeenCalledWith('JWT_RESET_EXPIRATION', '15m');
        });
    });
});

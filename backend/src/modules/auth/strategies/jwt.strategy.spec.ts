import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/common/enums/roles.enums';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const mockConfigService = {
            getOrThrow: jest.fn((key: string) => {
                const config = {
                    JWT_SECRET: 'test-secret',
                    JWT_REFRESH_SECRET: 'test-refresh-secret',
                    JWT_RESET_SECRET: 'test-reset-secret',
                };
                return config[key];
            }),
            get: jest.fn((key: string, defaultValue?: string) => {
                const config = {
                    JWT_EXPIRATION: '15m',
                    JWT_REFRESH_EXPIRATION: '7d',
                    JWT_RESET_EXPIRATION: '15m',
                };
                return config[key] ?? defaultValue;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        configService = module.get(ConfigService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return user object with correct structure', () => {
            // Arrange
            const payload: JwtPayload = {
                sub: '123',
                phoneNumber: '+1234567890',
                role: Role.NEIGHBOR,
            };

            // Act
            const result = strategy.validate(payload);

            // Assert
            expect(result).toEqual({
                id: '123',
                phoneNumber: '+1234567890',
                role: Role.NEIGHBOR,
            });
        });

        it('should handle admin role correctly', () => {
            // Arrange
            const payload: JwtPayload = {
                sub: '456',
                phoneNumber: '+0987654321',
                role: Role.ADMIN,
            };

            // Act
            const result = strategy.validate(payload);

            // Assert
            expect(result).toEqual({
                id: '456',
                phoneNumber: '+0987654321',
                role: Role.ADMIN,
            });
        });

        it('should map sub to id correctly', () => {
            // Arrange
            const payload: JwtPayload = {
                sub: '999',
                phoneNumber: '+1111111111',
                role: Role.NEIGHBOR,
            };

            // Act
            const result = strategy.validate(payload);

            // Assert
            expect(result.id).toBe('999');
            expect(result.id).toBe(payload.sub);
        });

        it('should preserve phoneNumber exactly as provided', () => {
            // Arrange
            const payload: JwtPayload = {
                sub: '123',
                phoneNumber: '+56912345678',
                role: Role.NEIGHBOR,
            };

            // Act
            const result = strategy.validate(payload);

            // Assert
            expect(result.phoneNumber).toBe('+56912345678');
            expect(result.phoneNumber).toBe(payload.phoneNumber);
        });

        it('should preserve role exactly as provided', () => {
            // Arrange
            const payload: JwtPayload = {
                sub: '123',
                phoneNumber: '+1234567890',
                role: Role.ADMIN,
            };

            // Act
            const result = strategy.validate(payload);

            // Assert
            expect(result.role).toBe(Role.ADMIN);
            expect(result.role).toBe(payload.role);
        });
    });

    describe('constructor', () => {
        it('should load JWT secret from config service', () => {
            // Assert
            expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
        });
    });
});

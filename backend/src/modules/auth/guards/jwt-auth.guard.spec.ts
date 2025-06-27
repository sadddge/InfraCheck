import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { expectAuthError } from '../../../common/test-helpers/exception-test.helper';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        reflector = module.get(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let mockContext: jest.Mocked<ExecutionContext>;

        beforeEach(() => {
            mockContext = {
                getHandler: jest.fn(),
                getClass: jest.fn(),
                switchToHttp: jest.fn(),
                getArgs: jest.fn(),
                getArgByIndex: jest.fn(),
                switchToRpc: jest.fn(),
                switchToWs: jest.fn(),
                getType: jest.fn(),
            };
        });

        it('should return true for public endpoints', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue(true); // @Public() decorator found

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockContext.getHandler(),
                mockContext.getClass(),
            ]);
        });

        it('should call parent canActivate for protected endpoints', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue(false); // No @Public() decorator
            const parentCanActivate = jest.spyOn(
                Object.getPrototypeOf(JwtAuthGuard.prototype),
                'canActivate',
            );
            parentCanActivate.mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
            expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
        });

        it('should call parent canActivate when @Public() returns undefined', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue(undefined); // No @Public() decorator
            const parentCanActivate = jest.spyOn(
                Object.getPrototypeOf(JwtAuthGuard.prototype),
                'canActivate',
            );
            parentCanActivate.mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
            expect(parentCanActivate).toHaveBeenCalledWith(mockContext);
        });
    });

    describe('handleRequest', () => {
        it('should return user when authentication is successful', () => {
            // Arrange
            const mockUser = { id: 1, phoneNumber: '+1234567890', role: 'NEIGHBOR' };

            // Act
            const result = guard.handleRequest(null, mockUser);

            // Assert
            expect(result).toEqual(mockUser);
        });
        it('should throw AppException with INVALID_ACCESS_TOKEN when user is not found', () => {
            // Act & Assert
            expectAuthError.invalidAccessToken(() => guard.handleRequest(null, null));
        });

        it('should throw AppException with INVALID_ACCESS_TOKEN when user is undefined', () => {
            // Act & Assert
            expectAuthError.invalidAccessToken(() => guard.handleRequest(null, undefined));
        });

        it('should throw the original error when error is provided', () => {
            // Arrange
            const originalError = new Error('JWT malformed');

            // Act & Assert
            expect(() => guard.handleRequest(originalError, null)).toThrow(originalError);
        });

        it('should prioritize error over user validation', () => {
            // Arrange
            const originalError = new Error('JWT expired');
            const mockUser = { id: 1, phoneNumber: '+1234567890', role: 'NEIGHBOR' };

            // Act & Assert
            expect(() => guard.handleRequest(originalError, mockUser)).toThrow(originalError);
        });

        it('should handle different user types correctly', () => {
            // Arrange
            const mockUser = { id: 1, username: 'testuser', permissions: ['read', 'write'] };

            // Act
            const result = guard.handleRequest<typeof mockUser>(null, mockUser);

            // Assert
            expect(result).toEqual(mockUser);
            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
            expect(result.permissions).toEqual(['read', 'write']);
        });
    });
});

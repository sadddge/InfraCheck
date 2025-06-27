import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/common/enums/roles.enums';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let mockContext: jest.Mocked<ExecutionContext>;
        interface MockRequest {
            user: { id?: number; role?: Role } | null;
        }
        let mockRequest: MockRequest;

        beforeEach(() => {
            mockRequest = {
                user: null,
            };

            // Properly mock HttpArgumentsHost
            const mockHttpArgumentsHost = {
                getRequest: jest.fn(() => mockRequest),
                getResponse: jest.fn(),
                getNext: jest.fn(),
            } as unknown as jest.Mocked<HttpArgumentsHost>;

            mockContext = {
                getHandler: jest.fn(),
                getClass: jest.fn(),
                switchToHttp: jest.fn(() => mockHttpArgumentsHost),
                getArgs: jest.fn(),
                getArgByIndex: jest.fn(),
                switchToRpc: jest.fn(),
                switchToWs: jest.fn(),
                getType: jest.fn(),
            } as unknown as jest.Mocked<ExecutionContext>;
        });

        it('should return true when no roles are required', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue(undefined);

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
                mockContext.getHandler(),
                mockContext.getClass(),
            ]);
        });

        it('should return false when no user is present in request', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            mockRequest.user = null;

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(false);
        });

        it('should return true for admin users regardless of required roles', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.NEIGHBOR]);
            mockRequest.user = { id: 1, role: Role.ADMIN };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when user has exact required role', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.NEIGHBOR]);
            mockRequest.user = { id: 1, role: Role.NEIGHBOR };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when user has one of multiple required roles', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.NEIGHBOR]);
            mockRequest.user = { id: 1, role: Role.NEIGHBOR };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when user does not have required role', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            mockRequest.user = { id: 1, role: Role.NEIGHBOR };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle empty required roles array', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([]);
            mockRequest.user = { id: 1, role: Role.NEIGHBOR };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when user object exists but has no role', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            mockRequest.user = { id: 1 }; // No role property

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle case where user has undefined role', () => {
            // Arrange
            reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
            mockRequest.user = { id: 1, role: undefined };

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBe(false);
        });
    });
});

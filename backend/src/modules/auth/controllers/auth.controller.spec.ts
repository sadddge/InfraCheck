import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from '../dto/login.dto';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyRecoverPasswordDto } from '../dto/verify-recover-password.dto';
import { AUTH_SERVICE, IAuthService } from '../interfaces/auth-service.interface';
import {
    IPasswordRecoveryService,
    PASSWORD_RECOVERY_SERVICE,
} from '../interfaces/password-recovery-service.interface';
import {
    IUserRegistrationService,
    USER_REGISTRATION_SERVICE,
} from '../interfaces/user-registration-service.interface';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<IAuthService>;
    let passwordRecoveryService: jest.Mocked<IPasswordRecoveryService>;
    let userRegistrationService: jest.Mocked<IUserRegistrationService>;

    const mockAuthService = {
        login: jest.fn(),
        refreshToken: jest.fn(),
        getUserIfRefreshTokenMatches: jest.fn(),
    };

    const mockPasswordRecoveryService = {
        sendResetPasswordCode: jest.fn(),
        generateResetPasswordToken: jest.fn(),
        resetPassword: jest.fn(),
    };

    const mockUserRegistrationService = {
        register: jest.fn(),
        verifyRegisterCode: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AUTH_SERVICE, useValue: mockAuthService },
                { provide: PASSWORD_RECOVERY_SERVICE, useValue: mockPasswordRecoveryService },
                { provide: USER_REGISTRATION_SERVICE, useValue: mockUserRegistrationService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AUTH_SERVICE);
        passwordRecoveryService = module.get(PASSWORD_RECOVERY_SERVICE);
        userRegistrationService = module.get(USER_REGISTRATION_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should call userRegistrationService.register with correct parameters', async () => {
            const registerDto: RegisterDto = {
                phoneNumber: '+56912345678',
                password: 'password123',
                name: 'John',
                lastName: 'Doe',
            };

            const expectedResult = {
                message: 'Registration successful',
                verificationRequired: true,
            };

            mockUserRegistrationService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(registerDto);

            expect(userRegistrationService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors from userRegistrationService.register', async () => {
            const registerDto: RegisterDto = {
                phoneNumber: '+56912345678',
                password: 'password123',
                name: 'John',
                lastName: 'Doe',
            };

            const error = new Error('Registration failed');
            mockUserRegistrationService.register.mockRejectedValue(error);

            await expect(controller.register(registerDto)).rejects.toThrow('Registration failed');
            expect(userRegistrationService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('verifyRegisterCode', () => {
        it('should call userRegistrationService.verifyRegisterCode with correct parameters', async () => {
            const phoneNumber = '+56912345678';
            const code = '123456';

            mockUserRegistrationService.verifyRegisterCode.mockResolvedValue(undefined);

            await controller.verifyRegisterCode(phoneNumber, code);

            expect(userRegistrationService.verifyRegisterCode).toHaveBeenCalledWith(
                phoneNumber,
                code,
            );
        });

        it('should propagate errors from userRegistrationService.verifyRegisterCode', async () => {
            const phoneNumber = '+56912345678';
            const code = '123456';
            const error = new Error('Invalid verification code');

            mockUserRegistrationService.verifyRegisterCode.mockRejectedValue(error);

            await expect(controller.verifyRegisterCode(phoneNumber, code)).rejects.toThrow(
                'Invalid verification code',
            );
            expect(userRegistrationService.verifyRegisterCode).toHaveBeenCalledWith(
                phoneNumber,
                code,
            );
        });
    });

    describe('login', () => {
        it('should call authService.login with correct parameters', async () => {
            const loginDto: LoginDto = {
                phoneNumber: '+56912345678',
                password: 'password123',
            };

            const expectedResult = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: { id: 1, phoneNumber: '+56912345678', name: 'John', lastName: 'Doe' },
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors from authService.login', async () => {
            const loginDto: LoginDto = {
                phoneNumber: '+56912345678',
                password: 'wrongpassword',
            };

            const error = new Error('Invalid credentials');
            mockAuthService.login.mockRejectedValue(error);

            await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refresh', () => {
        it('should call authService.refreshToken with correct parameters', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: 'refresh-token-123',
            };

            const mockRequest = {
                user: { id: 1 },
            };

            const expectedResult = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            };

            mockAuthService.refreshToken.mockResolvedValue(expectedResult);

            const result = await controller.refresh(refreshTokenDto, mockRequest);

            expect(authService.refreshToken).toHaveBeenCalledWith(
                refreshTokenDto.refreshToken,
                mockRequest.user.id,
            );
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors from authService.refreshToken', async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: 'invalid-token',
            };

            const mockRequest = {
                user: { id: 1 },
            };

            const error = new Error('Invalid refresh token');
            mockAuthService.refreshToken.mockRejectedValue(error);

            await expect(controller.refresh(refreshTokenDto, mockRequest)).rejects.toThrow(
                'Invalid refresh token',
            );
            expect(authService.refreshToken).toHaveBeenCalledWith(
                refreshTokenDto.refreshToken,
                mockRequest.user.id,
            );
        });
    });

    describe('sendResetPasswordCode', () => {
        it('should call passwordRecoveryService.sendResetPasswordCode and return success message', async () => {
            const recoverPasswordDto: RecoverPasswordDto = {
                phoneNumber: '+56912345678',
            };

            mockPasswordRecoveryService.sendResetPasswordCode.mockResolvedValue(undefined);

            const result = await controller.sendResetPasswordCode(recoverPasswordDto);

            expect(passwordRecoveryService.sendResetPasswordCode).toHaveBeenCalledWith(
                recoverPasswordDto.phoneNumber,
            );
            expect(result).toBe('Password recovery code sent successfully.');
        });

        it('should propagate errors from passwordRecoveryService.sendResetPasswordCode', async () => {
            const recoverPasswordDto: RecoverPasswordDto = {
                phoneNumber: '+56912345678',
            };

            const error = new Error('User not found');
            mockPasswordRecoveryService.sendResetPasswordCode.mockRejectedValue(error);

            await expect(controller.sendResetPasswordCode(recoverPasswordDto)).rejects.toThrow(
                'User not found',
            );
            expect(passwordRecoveryService.sendResetPasswordCode).toHaveBeenCalledWith(
                recoverPasswordDto.phoneNumber,
            );
        });
    });

    describe('verifyRecoverPasswordCode', () => {
        it('should call passwordRecoveryService.generateResetPasswordToken with correct parameters', async () => {
            const verifyRecoverPasswordDto: VerifyRecoverPasswordDto = {
                phoneNumber: '+56912345678',
                code: '123456',
            };

            const expectedResult = {
                token: 'reset-token-123',
                message: 'Reset token generated successfully',
            };
            mockPasswordRecoveryService.generateResetPasswordToken.mockResolvedValue(
                expectedResult,
            );

            const result = await controller.verifyRecoverPasswordCode(verifyRecoverPasswordDto);

            expect(passwordRecoveryService.generateResetPasswordToken).toHaveBeenCalledWith(
                verifyRecoverPasswordDto.phoneNumber,
                verifyRecoverPasswordDto.code,
            );
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors from passwordRecoveryService.generateResetPasswordToken', async () => {
            const verifyRecoverPasswordDto: VerifyRecoverPasswordDto = {
                phoneNumber: '+56912345678',
                code: '123456',
            };

            const error = new Error('Invalid recovery code');
            mockPasswordRecoveryService.generateResetPasswordToken.mockRejectedValue(error);

            await expect(
                controller.verifyRecoverPasswordCode(verifyRecoverPasswordDto),
            ).rejects.toThrow('Invalid recovery code');
            expect(passwordRecoveryService.generateResetPasswordToken).toHaveBeenCalledWith(
                verifyRecoverPasswordDto.phoneNumber,
                verifyRecoverPasswordDto.code,
            );
        });
    });

    describe('resetPassword', () => {
        it('should call passwordRecoveryService.resetPassword with correct parameters', async () => {
            const resetPasswordDto: ResetPasswordDto = {
                token: 'reset-token-123',
                newPassword: 'newpassword123',
            };

            const mockRequest = {
                user: { id: 1 },
            };

            const expectedResult = 'Password reset successfully.';
            mockPasswordRecoveryService.resetPassword.mockResolvedValue(expectedResult);

            const result = await controller.resetPassword(resetPasswordDto, mockRequest);

            expect(passwordRecoveryService.resetPassword).toHaveBeenCalledWith(
                mockRequest.user.id,
                resetPasswordDto.newPassword,
            );
            expect(result).toEqual(expectedResult);
        });

        it('should propagate errors from passwordRecoveryService.resetPassword', async () => {
            const resetPasswordDto: ResetPasswordDto = {
                token: 'reset-token-123',
                newPassword: 'newpassword123',
            };

            const mockRequest = {
                user: { id: 1 },
            };

            const error = new Error('Password reset failed');
            mockPasswordRecoveryService.resetPassword.mockRejectedValue(error);

            await expect(controller.resetPassword(resetPasswordDto, mockRequest)).rejects.toThrow(
                'Password reset failed',
            );
            expect(passwordRecoveryService.resetPassword).toHaveBeenCalledWith(
                mockRequest.user.id,
                resetPasswordDto.newPassword,
            );
        });
    });
});

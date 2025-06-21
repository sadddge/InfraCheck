import { AppException } from '../../../common/exceptions/app.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import { UserDto } from '../../users/dto/user.dto';
import { IUserService, USER_SERVICE } from '../../users/interfaces/user-service.interface';
import { IVerificationService } from '../../verification/interfaces/verification-service.interface';

import { PasswordRecoveryService } from './password-recovery.service';
import { TokenFactoryService } from './token-factory.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('PasswordRecoveryService', () => {
    let service: PasswordRecoveryService;
    let userService: jest.Mocked<IUserService>;
    let verificationService: jest.Mocked<IVerificationService>;
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

    beforeEach(async () => {
        const mockUserService = {
            findByPhoneNumber: jest.fn(),
            findByIdWithPassword: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            registerNeighbor: jest.fn(),
            createAdmin: jest.fn(),
            remove: jest.fn(),
            findByPhoneNumberWithPassword: jest.fn(),
        } as jest.Mocked<IUserService>;

        const mockVerificationService = {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
        };

        const mockTokenFactory = {
            generateResetPasswordToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordRecoveryService,
                {
                    provide: USER_SERVICE,
                    useValue: mockUserService,
                },
                {
                    provide: VERIFICATION.RECOVER_PASSWORD_TOKEN,
                    useValue: mockVerificationService,
                },
                {
                    provide: TokenFactoryService,
                    useValue: mockTokenFactory,
                },
            ],
        }).compile();

        service = module.get<PasswordRecoveryService>(PasswordRecoveryService);
        userService = module.get(USER_SERVICE);
        verificationService = module.get(VERIFICATION.RECOVER_PASSWORD_TOKEN);
        tokenFactory = module.get(TokenFactoryService);

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendResetPasswordCode', () => {
        const phoneNumber = '+1234567890';

        it('should successfully send reset password code when user exists', async () => {
            // Arrange
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            verificationService.sendVerificationCode.mockResolvedValue(undefined);

            // Act
            await service.sendResetPasswordCode(phoneNumber);

            // Assert
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(verificationService.sendVerificationCode).toHaveBeenCalledWith(phoneNumber);
        });

        it('should handle case when user does not exist', async () => {
            // Arrange
            userService.findByPhoneNumber.mockRejectedValue(
                new AppException(ERROR_CODES.USERS.USER_NOT_FOUND),
            );

            // Act
            await service.sendResetPasswordCode(phoneNumber);

            // Assert
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(verificationService.sendVerificationCode).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully and not throw', async () => {
            // Arrange
            userService.findByPhoneNumber.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(service.sendResetPasswordCode(phoneNumber)).resolves.toBeUndefined();
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
        });
    });

    describe('generateResetPasswordToken', () => {
        const phoneNumber = '+1234567890';
        const code = '123456';
        const mockToken = 'mock-reset-token';

        it('should successfully generate reset password token with valid code', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue(undefined);
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            tokenFactory.generateResetPasswordToken.mockResolvedValue(mockToken);

            // Act
            const result = await service.generateResetPasswordToken(phoneNumber, code);

            // Assert
            expect(result).toEqual({
                token: mockToken,
                message: 'Password reset token generated successfully',
            });
            expect(verificationService.verifyCode).toHaveBeenCalledWith(phoneNumber, code);
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(tokenFactory.generateResetPasswordToken).toHaveBeenCalledWith(mockUser);
        });

        it('should throw AppException when verification code is invalid', async () => {
            // Arrange
            verificationService.verifyCode.mockRejectedValue(new Error('Invalid code'));

            // Act & Assert
            await expect(service.generateResetPasswordToken(phoneNumber, code)).rejects.toThrow(
                AppException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(phoneNumber, code);
            expect(userService.findByPhoneNumber).not.toHaveBeenCalled();
            expect(tokenFactory.generateResetPasswordToken).not.toHaveBeenCalled();
        });

        it('should throw AppException when user is not found', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue(undefined);
            userService.findByPhoneNumber.mockRejectedValue(new AppException(ERROR_CODES.USERS.USER_NOT_FOUND));

            // Act & Assert
            await expect(service.generateResetPasswordToken(phoneNumber, code)).rejects.toThrow(
                AppException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(phoneNumber, code);
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(tokenFactory.generateResetPasswordToken).not.toHaveBeenCalled();
        });

        it('should throw AppException when token generation fails', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue(undefined);
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            tokenFactory.generateResetPasswordToken.mockRejectedValue(
                new Error('Token generation failed'),
            );

            // Act & Assert
            await expect(service.generateResetPasswordToken(phoneNumber, code)).rejects.toThrow(
                AppException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(phoneNumber, code);
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(tokenFactory.generateResetPasswordToken).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('resetPassword', () => {
        const userId = 1;
        const newPassword = 'newPassword123';
        const hashedPassword = 'hashedNewPassword';

        beforeEach(() => {
            bcrypt.hash.mockResolvedValue(hashedPassword);
        });

        it('should successfully reset password', async () => {
            // Arrange
            const userToUpdate = { ...mockUser };
            const updatedUserDto: UserDto = {
                id: userToUpdate.id,
                phoneNumber: userToUpdate.phoneNumber,
                name: userToUpdate.name,
                lastName: userToUpdate.lastName,
                role: userToUpdate.role,
                status: userToUpdate.status,
                createdAt: userToUpdate.createdAt,
                passwordUpdatedAt: expect.any(Date) as Date,
            };
            userService.findByIdWithPassword.mockResolvedValue(userToUpdate);
            userService.update.mockResolvedValue(updatedUserDto);

            // Act
            const result = await service.resetPassword(userId, newPassword);

            // Assert
            expect(result).toBe('Password reset successful');
            expect(userService.findByIdWithPassword).toHaveBeenCalledWith(userId);
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(userService.update).toHaveBeenCalledWith(userId, {
                ...userToUpdate,
                password: hashedPassword,
                passwordUpdatedAt: expect.any(Date),
            });
        });

        it('should throw error when user is not found', async () => {
            // Arrange
            userService.findByIdWithPassword.mockRejectedValue(
                new AppException(ERROR_CODES.USERS.USER_NOT_FOUND),
            );

            // Act & Assert
            await expect(service.resetPassword(userId, newPassword)).rejects.toThrow(
                AppException,
            );
            expect(userService.findByIdWithPassword).toHaveBeenCalledWith(userId);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(userService.update).not.toHaveBeenCalled();
        });

        it('should throw error when password hashing fails', async () => {
            // Arrange
            userService.findByIdWithPassword.mockResolvedValue(mockUser);
            bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

            // Act & Assert
            await expect(service.resetPassword(userId, newPassword)).rejects.toThrow(
                'Hashing failed',
            );
            expect(userService.findByIdWithPassword).toHaveBeenCalledWith(userId);
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(userService.update).not.toHaveBeenCalled();
        });

        it('should throw error when user update fails', async () => {
            // Arrange
            const userToUpdate = { ...mockUser };
            userService.findByIdWithPassword.mockResolvedValue(userToUpdate);
            userService.update.mockRejectedValue(new Error('Update failed'));

            // Act & Assert
            await expect(service.resetPassword(userId, newPassword)).rejects.toThrow(
                'Update failed',
            );
            expect(userService.findByIdWithPassword).toHaveBeenCalledWith(userId);
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(userService.update).toHaveBeenCalledWith(userId, {
                ...userToUpdate,
                password: hashedPassword,
                passwordUpdatedAt: expect.any(Date),
            });
        });

        it('should update passwordUpdatedAt field when resetting password', async () => {
            // Arrange
            const userToUpdate = { ...mockUser };
            const dateBefore = new Date();
            const updatedUserDto: UserDto = {
                id: userToUpdate.id,
                phoneNumber: userToUpdate.phoneNumber,
                name: userToUpdate.name,
                lastName: userToUpdate.lastName,
                role: userToUpdate.role,
                status: userToUpdate.status,
                createdAt: userToUpdate.createdAt,
                passwordUpdatedAt: new Date(),
            };
            userService.findByIdWithPassword.mockResolvedValue(userToUpdate);
            userService.update.mockResolvedValue(updatedUserDto);

            // Act
            await service.resetPassword(userId, newPassword);
            const dateAfter = new Date();

            // Assert
            const updateCall = userService.update.mock.calls[0];
            const updateData = updateCall[1] as User; // The service actually passes a User object
            // The service passes the entire user object, which has passwordUpdatedAt
            expect(updateData.passwordUpdatedAt).toBeInstanceOf(Date);
            expect(updateData.passwordUpdatedAt).not.toBeNull();
            if (updateData.passwordUpdatedAt) {
                expect(updateData.passwordUpdatedAt.getTime()).toBeGreaterThanOrEqual(
                    dateBefore.getTime(),
                );
                expect(updateData.passwordUpdatedAt.getTime()).toBeLessThanOrEqual(
                    dateAfter.getTime(),
                );
            }
        });
    });
});




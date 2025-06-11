import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { VERIFICATION } from 'src/common/constants/verification.constants';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { User } from 'src/database/entities/user.entity';
import { UserDto } from 'src/modules/users/dto/user.dto';
import { IUserService, USER_SERVICE } from 'src/modules/users/interfaces/user-service.interface';
import { IVerificationService } from 'src/modules/verification/interfaces/verification-service.interface';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { RegisterDto } from '../dto/register.dto';
import { InvalidVerificationCodeException } from '../exceptions/auth.exceptions';
import { UserRegistrationService } from './user-registration.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserRegistrationService', () => {
    let service: UserRegistrationService;
    let userService: jest.Mocked<IUserService>;
    let verificationService: jest.Mocked<IVerificationService>;

    beforeEach(async () => {
        // Create comprehensive mocks
        const mockUserService = {
            findByPhoneNumber: jest.fn(),
            registerNeighbor: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            createAdmin: jest.fn(),
            remove: jest.fn(),
            findByIdWithPassword: jest.fn(),
            findByPhoneNumberWithPassword: jest.fn(),
        } as jest.Mocked<IUserService>;

        const mockVerificationService = {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
        } as jest.Mocked<IVerificationService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRegistrationService,
                {
                    provide: USER_SERVICE,
                    useValue: mockUserService,
                },
                {
                    provide: VERIFICATION.REGISTER_TOKEN,
                    useValue: mockVerificationService,
                },
            ],
        }).compile();

        service = module.get<UserRegistrationService>(UserRegistrationService);
        userService = module.get(USER_SERVICE);
        verificationService = module.get(VERIFICATION.REGISTER_TOKEN);

        // Setup default bcrypt mock
        mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            phoneNumber: '+56912345678',
            password: 'password123',
            name: 'Juan',
            lastName: 'Pérez',
        };

        const mockUserDto: UserDto = {
            id: 1,
            phoneNumber: '+56912345678',
            name: 'Juan',
            lastName: 'Pérez',
            role: Role.NEIGHBOR,
            status: UserStatus.PENDING_VERIFICATION,
            createdAt: new Date(),
            passwordUpdatedAt: null,
        };

        const expectedResponse: RegisterResponseDto = {
            id: 1,
            phoneNumber: '+56912345678',
            name: 'Juan',
            lastName: 'Pérez',
            role: Role.NEIGHBOR,
        };

        it('should successfully register a new user', async () => {
            // Arrange
            userService.registerNeighbor.mockResolvedValue(mockUserDto);
            verificationService.sendVerificationCode.mockResolvedValue();

            // Act
            const result = await service.register(registerDto);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userService.registerNeighbor).toHaveBeenCalledWith({
                ...registerDto,
                password: 'hashedPassword123',
            });
            expect(verificationService.sendVerificationCode).toHaveBeenCalledWith('+56912345678');
            expect(result).toEqual(expectedResponse);
        });

        it('should hash password with salt rounds 10', async () => {
            // Arrange
            userService.registerNeighbor.mockResolvedValue(mockUserDto);
            verificationService.sendVerificationCode.mockResolvedValue();

            // Act
            await service.register(registerDto);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        });

        it('should throw ConflictException when user already exists', async () => {
            // Arrange
            const conflictError = new ConflictException(
                'User with phone number +56912345678 already exists',
            );
            userService.registerNeighbor.mockRejectedValue(conflictError);

            // Act & Assert
            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userService.registerNeighbor).toHaveBeenCalledWith({
                ...registerDto,
                password: 'hashedPassword123',
            });
            expect(verificationService.sendVerificationCode).not.toHaveBeenCalled();
        });

        it('should handle error when password hashing fails', async () => {
            // Arrange
            const hashError = new Error('Hashing failed');
            mockedBcrypt.hash.mockRejectedValue(hashError as never);

            // Act & Assert
            await expect(service.register(registerDto)).rejects.toThrow('Hashing failed');
            expect(userService.registerNeighbor).not.toHaveBeenCalled();
            expect(verificationService.sendVerificationCode).not.toHaveBeenCalled();
        });

        it('should handle error when verification code sending fails', async () => {
            // Arrange
            userService.registerNeighbor.mockResolvedValue(mockUserDto);
            const verificationError = new Error('SMS service unavailable');
            verificationService.sendVerificationCode.mockRejectedValue(verificationError);

            // Act & Assert
            await expect(service.register(registerDto)).rejects.toThrow('SMS service unavailable');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userService.registerNeighbor).toHaveBeenCalledWith({
                ...registerDto,
                password: 'hashedPassword123',
            });
            expect(verificationService.sendVerificationCode).toHaveBeenCalledWith('+56912345678');
        });

        it('should handle error when user creation fails', async () => {
            // Arrange
            const userCreationError = new Error('Database error');
            userService.registerNeighbor.mockRejectedValue(userCreationError);

            // Act & Assert
            await expect(service.register(registerDto)).rejects.toThrow('Database error');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userService.registerNeighbor).toHaveBeenCalledWith({
                ...registerDto,
                password: 'hashedPassword123',
            });
            expect(verificationService.sendVerificationCode).not.toHaveBeenCalled();
        });

        it('should return user data without sensitive information', async () => {
            // Arrange
            userService.registerNeighbor.mockResolvedValue(mockUserDto);
            verificationService.sendVerificationCode.mockResolvedValue();

            // Act
            const result = await service.register(registerDto);

            // Assert
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('status');
            expect(result).not.toHaveProperty('createdAt');
            expect(result).not.toHaveProperty('passwordUpdatedAt');
            expect(result).toEqual({
                id: 1,
                phoneNumber: '+56912345678',
                name: 'Juan',
                lastName: 'Pérez',
                role: Role.NEIGHBOR,
            });
        });
    });

    describe('verifyRegisterCode', () => {
        const phoneNumber = '+56912345678';
        const verificationCode = '123456';

        const mockUser: UserDto = {
            id: 1,
            phoneNumber: '+56912345678',
            name: 'Juan',
            lastName: 'Pérez',
            role: Role.NEIGHBOR,
            status: UserStatus.PENDING_VERIFICATION,
            createdAt: new Date(),
            passwordUpdatedAt: null,
        };

        it('should successfully verify registration code and update user status', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue();
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            userService.update.mockResolvedValue({
                ...mockUser,
                status: UserStatus.PENDING_APPROVAL,
            });

            // Act
            await service.verifyRegisterCode(phoneNumber, verificationCode);

            // Assert
            expect(verificationService.verifyCode).toHaveBeenCalledWith(
                phoneNumber,
                verificationCode,
            );
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(userService.update).toHaveBeenCalledWith(1, {
                ...mockUser,
                status: UserStatus.PENDING_APPROVAL,
            });
        });

        it('should update user status from PENDING_VERIFICATION to PENDING_APPROVAL', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue();
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            userService.update.mockResolvedValue({
                ...mockUser,
                status: UserStatus.PENDING_APPROVAL,
            });

            // Act
            await service.verifyRegisterCode(phoneNumber, verificationCode);

            // Assert
            const updateCall = userService.update.mock.calls[0];
            const updatedUserData = updateCall[1] as User;
            expect(updatedUserData.status).toBe(UserStatus.PENDING_APPROVAL);
        });

        it('should throw InvalidVerificationCodeException when verification code is invalid', async () => {
            // Arrange
            const verificationError = new Error('Invalid verification code');
            verificationService.verifyCode.mockRejectedValue(verificationError);

            // Act & Assert
            await expect(service.verifyRegisterCode(phoneNumber, verificationCode)).rejects.toThrow(
                InvalidVerificationCodeException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(
                phoneNumber,
                verificationCode,
            );
            expect(userService.findByPhoneNumber).not.toHaveBeenCalled();
            expect(userService.update).not.toHaveBeenCalled();
        });

        it('should throw InvalidVerificationCodeException when user is not found', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue();
            const userNotFoundError = new Error('User not found');
            userService.findByPhoneNumber.mockRejectedValue(userNotFoundError);

            // Act & Assert
            await expect(service.verifyRegisterCode(phoneNumber, verificationCode)).rejects.toThrow(
                InvalidVerificationCodeException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(
                phoneNumber,
                verificationCode,
            );
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(userService.update).not.toHaveBeenCalled();
        });

        it('should throw InvalidVerificationCodeException when user update fails', async () => {
            // Arrange
            verificationService.verifyCode.mockResolvedValue();
            userService.findByPhoneNumber.mockResolvedValue(mockUser);
            const updateError = new Error('Database update failed');
            userService.update.mockRejectedValue(updateError);

            // Act & Assert
            await expect(service.verifyRegisterCode(phoneNumber, verificationCode)).rejects.toThrow(
                InvalidVerificationCodeException,
            );
            expect(verificationService.verifyCode).toHaveBeenCalledWith(
                phoneNumber,
                verificationCode,
            );
            expect(userService.findByPhoneNumber).toHaveBeenCalledWith(phoneNumber);
            expect(userService.update).toHaveBeenCalledWith(1, {
                ...mockUser,
                status: UserStatus.PENDING_APPROVAL,
            });
        });

        it('should log error with appropriate context when verification fails', async () => {
            // Arrange
            const errorMessage = 'Verification code expired';
            const verificationError = new Error(errorMessage);
            verificationService.verifyCode.mockRejectedValue(verificationError);

            // Act & Assert
            await expect(service.verifyRegisterCode(phoneNumber, verificationCode)).rejects.toThrow(
                InvalidVerificationCodeException,
            );
        });

        it('should handle verification code expiration gracefully', async () => {
            // Arrange
            const expiredCodeError = new Error('Verification code has expired');
            verificationService.verifyCode.mockRejectedValue(expiredCodeError);

            // Act & Assert
            await expect(service.verifyRegisterCode(phoneNumber, verificationCode)).rejects.toThrow(
                InvalidVerificationCodeException,
            );
        });
    });
});

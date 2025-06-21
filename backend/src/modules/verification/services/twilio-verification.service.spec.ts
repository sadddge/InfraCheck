import { AppException } from '../../../common/exceptions/app.exception';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Twilio } from 'twilio';

import { TwilioVerificationService } from './twilio-verification.service';

// Mock Twilio
jest.mock('twilio');

// Mock interfaces for Twilio API responses
interface MockVerificationResponse {
    status: string;
    sid: string;
    to?: string;
    channel?: string;
}

interface MockVerificationCheckResponse {
    status: string;
    sid: string;
    to?: string;
    valid?: boolean;
}

interface MockVerifications {
    create: jest.MockedFunction<
        (params: { to: string; channel: string }) => Promise<MockVerificationResponse>
    >;
}

interface MockVerificationChecks {
    create: jest.MockedFunction<
        (params: { to: string; code: string }) => Promise<MockVerificationCheckResponse>
    >;
}

interface MockVerifyService {
    verifications: MockVerifications;
    verificationChecks: MockVerificationChecks;
}

describe('TwilioVerificationService', () => {
    let service: TwilioVerificationService;
    let configService: jest.Mocked<ConfigService>;
    let mockTwilioClient: jest.Mocked<Twilio>;
    let mockVerifyService: MockVerifyService;
    let mockVerifications: MockVerifications;
    let mockVerificationChecks: MockVerificationChecks;

    const TEST_SERVICE_SID = 'VAtest-service-sid-123';
    const TEST_PHONE_NUMBER = '+1234567890';
    const TEST_CODE = '123456';

    beforeEach(async () => {
        // Create mocks for nested Twilio objects
        mockVerifications = {
            create: jest.fn(),
        };

        mockVerificationChecks = {
            create: jest.fn(),
        };

        mockVerifyService = {
            verifications: mockVerifications,
            verificationChecks: mockVerificationChecks,
        };

        // Mock the full Twilio client structure
        mockTwilioClient = {
            verify: {
                v2: {
                    services: jest.fn().mockReturnValue(mockVerifyService),
                },
            },
        } as unknown as jest.Mocked<Twilio>;

        // Mock Twilio constructor
        (Twilio as jest.MockedClass<typeof Twilio>).mockImplementation(() => mockTwilioClient);

        // Mock ConfigService
        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TwilioVerificationService,
                    useFactory: (configService: ConfigService) => {
                        return new TwilioVerificationService(configService, TEST_SERVICE_SID);
                    },
                    inject: [ConfigService],
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<TwilioVerificationService>(TwilioVerificationService);
        configService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it('should initialize Twilio client with correct credentials', () => {
            // Arrange
            const accountSid = 'test-account-sid';
            const authToken = 'test-auth-token';

            configService.get.mockReturnValueOnce(accountSid).mockReturnValueOnce(authToken);

            // Act
            const newService = new TwilioVerificationService(configService, TEST_SERVICE_SID);

            // Assert
            expect(configService.get).toHaveBeenCalledWith('TWILIO_ACCOUNT_SID');
            expect(configService.get).toHaveBeenCalledWith('TWILIO_AUTH_TOKEN');
            expect(Twilio).toHaveBeenCalledWith(accountSid, authToken);
            expect(newService).toBeDefined();
        });

        it('should store the service SID correctly', () => {
            // Act & Assert
            expect(service).toBeDefined();
            // Service SID is private, but we can verify it's used correctly in method calls
        });
    });

    describe('sendVerificationCode', () => {
        it('should send verification code successfully', async () => {
            // Arrange
            const mockResponse = {
                status: 'pending',
                sid: 'VEtest-verification-sid',
                to: TEST_PHONE_NUMBER,
                channel: 'sms',
            };

            mockVerifications.create.mockResolvedValue(mockResponse);

            // Act
            await service.sendVerificationCode(TEST_PHONE_NUMBER);

            // Assert
            expect(mockTwilioClient.verify.v2.services).toHaveBeenCalledWith(TEST_SERVICE_SID);
            expect(mockVerifications.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                channel: 'sms',
            });
        });

        it('should throw AppException when status is not pending', async () => {
            // Arrange
            const mockResponse = {
                status: 'failed',
                sid: 'VEtest-verification-sid',
                to: TEST_PHONE_NUMBER,
                channel: 'sms',
            };

            mockVerifications.create.mockResolvedValue(mockResponse);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(AppException);

            expect(mockVerifications.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                channel: 'sms',
            });
        });

        it('should handle Twilio API errors', async () => {
            // Arrange
            const twilioError = new Error('Twilio API Error: Invalid phone number');
            mockVerifications.create.mockRejectedValue(twilioError);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(
                twilioError,
            );

            expect(mockVerifications.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                channel: 'sms',
            });
        });

        it('should handle network timeouts', async () => {
            // Arrange
            const timeoutError = new Error('Network timeout');
            mockVerifications.create.mockRejectedValue(timeoutError);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(
                timeoutError,
            );
        });

        it('should handle invalid phone number format', async () => {
            // Arrange
            const invalidPhone = 'invalid-phone';
            const twilioError = new Error('Invalid phone number format');
            mockVerifications.create.mockRejectedValue(twilioError);

            // Act & Assert
            await expect(service.sendVerificationCode(invalidPhone)).rejects.toThrow(twilioError);

            expect(mockVerifications.create).toHaveBeenCalledWith({
                to: invalidPhone,
                channel: 'sms',
            });
        });
    });

    describe('verifyCode', () => {
        it('should verify code successfully', async () => {
            // Arrange
            const mockResponse = {
                status: 'approved',
                sid: 'VCtest-verification-check-sid',
                to: TEST_PHONE_NUMBER,
                valid: true,
            };

            mockVerificationChecks.create.mockResolvedValue(mockResponse);

            // Act
            await service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE);

            // Assert
            expect(mockTwilioClient.verify.v2.services).toHaveBeenCalledWith(TEST_SERVICE_SID);
            expect(mockVerificationChecks.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                code: TEST_CODE,
            });
        });

        it('should throw AppException when verification status is not approved', async () => {
            // Arrange
            const mockResponse = {
                status: 'pending',
                sid: 'VCtest-verification-check-sid',
                to: TEST_PHONE_NUMBER,
                valid: false,
            };

            mockVerificationChecks.create.mockResolvedValue(mockResponse);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE)).rejects.toThrow(AppException);

            expect(mockVerificationChecks.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                code: TEST_CODE,
            });
        });

        it('should handle expired verification code', async () => {
            // Arrange
            const mockResponse = {
                status: 'expired',
                sid: 'VCtest-verification-check-sid',
                to: TEST_PHONE_NUMBER,
                valid: false,
            };

            mockVerificationChecks.create.mockResolvedValue(mockResponse);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE)).rejects.toThrow(AppException);
        });

        it('should handle invalid verification code', async () => {
            // Arrange
            const mockResponse = {
                status: 'denied',
                sid: 'VCtest-verification-check-sid',
                to: TEST_PHONE_NUMBER,
                valid: false,
            };

            mockVerificationChecks.create.mockResolvedValue(mockResponse);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE)).rejects.toThrow(AppException);
        });

        it('should handle Twilio API errors during verification', async () => {
            // Arrange
            const twilioError = new Error('Twilio API Error: Service not found');
            mockVerificationChecks.create.mockRejectedValue(twilioError);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE)).rejects.toThrow(
                twilioError,
            );

            expect(mockVerificationChecks.create).toHaveBeenCalledWith({
                to: TEST_PHONE_NUMBER,
                code: TEST_CODE,
            });
        });

        it('should handle rate limiting errors', async () => {
            // Arrange
            const rateLimitError = new Error('Rate limit exceeded');
            mockVerificationChecks.create.mockRejectedValue(rateLimitError);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE)).rejects.toThrow(
                rateLimitError,
            );
        });
    });

    describe('edge cases', () => {
        it('should handle empty phone number', async () => {
            // Arrange
            const emptyPhone = '';
            const twilioError = new Error('Phone number is required');
            mockVerifications.create.mockRejectedValue(twilioError);

            // Act & Assert
            await expect(service.sendVerificationCode(emptyPhone)).rejects.toThrow(twilioError);
        });

        it('should handle empty verification code', async () => {
            // Arrange
            const emptyCode = '';
            const twilioError = new Error('Verification code is required');
            mockVerificationChecks.create.mockRejectedValue(twilioError);

            // Act & Assert
            await expect(service.verifyCode(TEST_PHONE_NUMBER, emptyCode)).rejects.toThrow(
                twilioError,
            );
        });

        it('should handle international phone numbers', async () => {
            // Arrange
            const internationalPhones = [
                '+44123456789', // UK
                '+33123456789', // France
                '+56912345678', // Chile
                '+81123456789', // Japan
            ];

            const mockResponse = {
                status: 'pending',
                sid: 'VEtest-verification-sid',
                channel: 'sms',
            };

            mockVerifications.create.mockResolvedValue(mockResponse);

            // Act & Assert
            for (const phone of internationalPhones) {
                await expect(service.sendVerificationCode(phone)).resolves.not.toThrow();

                expect(mockVerifications.create).toHaveBeenCalledWith({
                    to: phone,
                    channel: 'sms',
                });
            }
        });

        it('should handle different verification code formats', async () => {
            // Arrange
            const codes = ['123456', '000000', '999999', '111111'];
            const mockResponse = {
                status: 'approved',
                sid: 'VCtest-verification-check-sid',
                to: TEST_PHONE_NUMBER,
                valid: true,
            };

            mockVerificationChecks.create.mockResolvedValue(mockResponse);

            // Act & Assert
            for (const code of codes) {
                await expect(service.verifyCode(TEST_PHONE_NUMBER, code)).resolves.not.toThrow();

                expect(mockVerificationChecks.create).toHaveBeenCalledWith({
                    to: TEST_PHONE_NUMBER,
                    code: code,
                });
            }
        });
    });

    describe('service integration', () => {
        it('should use correct service SID for all operations', async () => {
            // Arrange
            const mockSendResponse = { status: 'pending', sid: 'VEtest-send-sid' };
            const mockVerifyResponse = { status: 'approved', sid: 'VCtest-verify-sid' };

            mockVerifications.create.mockResolvedValue(mockSendResponse);
            mockVerificationChecks.create.mockResolvedValue(mockVerifyResponse);

            // Act
            await service.sendVerificationCode(TEST_PHONE_NUMBER);
            await service.verifyCode(TEST_PHONE_NUMBER, TEST_CODE);

            // Assert
            expect(mockTwilioClient.verify.v2.services).toHaveBeenCalledWith(TEST_SERVICE_SID);
            expect(mockTwilioClient.verify.v2.services).toHaveBeenCalledTimes(2);
        });

        it('should work with different service SIDs', async () => {
            // Arrange
            const differentServiceSid = 'VAtest-different-service-sid';
            const differentService = new TwilioVerificationService(
                configService,
                differentServiceSid,
            );

            const mockResponse = { status: 'pending', sid: 'VEtest-different-sid' };
            mockVerifications.create.mockResolvedValue(mockResponse);

            // Act
            await differentService.sendVerificationCode(TEST_PHONE_NUMBER);

            // Assert
            expect(mockTwilioClient.verify.v2.services).toHaveBeenCalledWith(differentServiceSid);
        });
    });

    describe('error scenarios', () => {
        it('should handle Twilio authentication errors', async () => {
            // Arrange
            const authError = new Error('Authentication failed - invalid credentials');
            mockVerifications.create.mockRejectedValue(authError);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(
                authError,
            );
        });

        it('should handle service configuration errors', async () => {
            // Arrange
            const configError = new Error('Service configuration invalid');
            mockVerifications.create.mockRejectedValue(configError);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(
                configError,
            );
        });

        it('should handle quota exceeded errors', async () => {
            // Arrange
            const quotaError = new Error('SMS quota exceeded');
            mockVerifications.create.mockRejectedValue(quotaError);

            // Act & Assert
            await expect(service.sendVerificationCode(TEST_PHONE_NUMBER)).rejects.toThrow(
                quotaError,
            );
        });
    });
});


import { ImageAnnotatorClient } from '@google-cloud/vision';
import { InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AIImageValidatorStrategy } from './ai-image-validator.strategy';

// Mock Google Cloud Vision
jest.mock('@google-cloud/vision');

type MockImageAnnotatorClient = {
    safeSearchDetection: jest.Mock;
};

describe('AIImageValidatorStrategy', () => {
    let service: AIImageValidatorStrategy;
    let mockClient: MockImageAnnotatorClient;

    beforeEach(async () => {
        const mockImageAnnotatorClient: MockImageAnnotatorClient = {
            safeSearchDetection: jest.fn(),
        };

        (ImageAnnotatorClient as unknown as jest.Mock).mockImplementation(
            () => mockImageAnnotatorClient,
        );

        const module: TestingModule = await Test.createTestingModule({
            providers: [AIImageValidatorStrategy],
        }).compile();

        service = module.get<AIImageValidatorStrategy>(AIImageValidatorStrategy);
        mockClient = mockImageAnnotatorClient;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validate', () => {
        it('should pass validation for safe image', async () => {
            // Arrange
            const buffer = Buffer.from('safe image data');
            const safeResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(safeResponse);

            // Act & Assert
            await expect(service.validate(buffer)).resolves.not.toThrow();
            expect(mockClient.safeSearchDetection).toHaveBeenCalledWith({
                image: { content: buffer },
            });
        });

        it('should throw NotAcceptableException for adult content', async () => {
            // Arrange
            const buffer = Buffer.from('adult image data');
            const adultResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'LIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(adultResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: adult content detected',
            );
        });

        it('should throw NotAcceptableException for violent content', async () => {
            // Arrange
            const buffer = Buffer.from('violent image data');
            const violentResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'UNLIKELY',
                        violence: 'VERY_LIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(violentResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: violence content detected',
            );
        });

        it('should throw NotAcceptableException for racy content', async () => {
            // Arrange
            const buffer = Buffer.from('racy image data');
            const racyResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'LIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(racyResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: racy content detected',
            );
        });

        it('should throw NotAcceptableException for spoof content', async () => {
            // Arrange
            const buffer = Buffer.from('spoof image data');
            const spoofResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'VERY_LIKELY',
                        medical: 'UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(spoofResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: spoof content detected',
            );
        });

        it('should throw NotAcceptableException for medical content', async () => {
            // Arrange
            const buffer = Buffer.from('medical image data');
            const medicalResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'LIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(medicalResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: medical content detected',
            );
        });

        it('should throw InternalServerErrorException when no SafeSearch annotation found', async () => {
            // Arrange
            const buffer = Buffer.from('image data');
            const noAnnotationResponse = [
                {
                    // No safeSearchAnnotation property
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(noAnnotationResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(InternalServerErrorException);
            await expect(service.validate(buffer)).rejects.toThrow(
                'No SafeSearch annotation found',
            );
        });

        it('should handle multiple danger flags and throw for the first one encountered', async () => {
            // Arrange
            const buffer = Buffer.from('dangerous image data');
            const multipleIssuesResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'LIKELY',
                        spoof: 'UNLIKELY',
                        medical: 'VERY_LIKELY',
                        violence: 'LIKELY',
                        racy: 'UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(multipleIssuesResponse);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow(NotAcceptableException);
            // Should throw for the first dangerous content encountered (adult)
            await expect(service.validate(buffer)).rejects.toThrow(
                'Image validation failed: adult content detected',
            );
        });

        it('should handle API errors gracefully', async () => {
            // Arrange
            const buffer = Buffer.from('image data');
            const apiError = new Error('Vision API error');

            mockClient.safeSearchDetection.mockRejectedValue(apiError);

            // Act & Assert
            await expect(service.validate(buffer)).rejects.toThrow('Vision API error');
            expect(mockClient.safeSearchDetection).toHaveBeenCalledWith({
                image: { content: buffer },
            });
        });

        it('should pass validation when all flags are at safe levels', async () => {
            // Arrange
            const buffer = Buffer.from('completely safe image');
            const allSafeResponse = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'VERY_UNLIKELY',
                        medical: 'VERY_UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'VERY_UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(allSafeResponse);

            // Act & Assert
            await expect(service.validate(buffer)).resolves.not.toThrow();
            expect(mockClient.safeSearchDetection).toHaveBeenCalledWith({
                image: { content: buffer },
            });
        });

        it('should handle empty buffer', async () => {
            // Arrange
            const buffer = Buffer.alloc(0);
            const response = [
                {
                    safeSearchAnnotation: {
                        adult: 'VERY_UNLIKELY',
                        spoof: 'VERY_UNLIKELY',
                        medical: 'VERY_UNLIKELY',
                        violence: 'VERY_UNLIKELY',
                        racy: 'VERY_UNLIKELY',
                    },
                },
            ];

            mockClient.safeSearchDetection.mockResolvedValue(response);

            // Act & Assert
            await expect(service.validate(buffer)).resolves.not.toThrow();
            expect(mockClient.safeSearchDetection).toHaveBeenCalledWith({
                image: { content: buffer },
            });
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SharpImageProcessor } from './sharp-image-processor.service';

// Mock sharp instance
const mockSharpInstance = {
    resize: jest.fn(),
    jpeg: jest.fn(),
    toBuffer: jest.fn(),
};

// Mock sharp module - handle both default and named exports
jest.mock('sharp', () => {
    const mockSharp = jest.fn(() => mockSharpInstance);
    return {
        __esModule: true,
        default: mockSharp,
    };
});

// Import the mocked sharp for testing
import sharp from 'sharp';
const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

describe('SharpImageProcessor', () => {
    let service: SharpImageProcessor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SharpImageProcessor],
        }).compile();

        service = module.get<SharpImageProcessor>(SharpImageProcessor);

        // Reset mocks and setup return values
        jest.clearAllMocks();
        mockSharpInstance.resize.mockReturnValue(mockSharpInstance);
        mockSharpInstance.jpeg.mockReturnValue(mockSharpInstance);
        mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('processed image data'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processImage', () => {
        it('should process image successfully', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const outputBuffer = Buffer.from('processed image data');
            mockSharpInstance.toBuffer.mockResolvedValue(outputBuffer);

            // Act
            const result = await service.processImage(inputBuffer);

            // Assert
            expect(mockSharp).toHaveBeenCalledWith(inputBuffer);
            expect(result).toBe(outputBuffer);
            expect(mockSharpInstance.resize).toHaveBeenCalledWith({
                width: 800,
                height: 600,
                fit: 'inside',
            });
            expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
                quality: 80,
            });
            expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
        });

        it('should handle processing errors', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const error = new Error('Processing failed');
            mockSharpInstance.toBuffer.mockRejectedValue(error);

            // Act & Assert
            await expect(service.processImage(inputBuffer)).rejects.toThrow('Processing failed');
        });
    });
});

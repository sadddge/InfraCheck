// sharp-image-processor.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SharpImageProcessor } from './sharp-image-processor.service';

// Mock sharp instance methods
const mockSharpInstance = {
    resize: jest.fn(),
    jpeg: jest.fn(),
    toBuffer: jest.fn(),
};

// Mock the entire 'sharp' module using * import
jest.mock('sharp', () => {
    return jest.fn(() => mockSharpInstance);
});

// Import after mocking
import * as sharp from 'sharp';
const mockSharp = sharp as unknown as jest.Mock;

describe('SharpImageProcessor', () => {
    let service: SharpImageProcessor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SharpImageProcessor],
        }).compile();

        service = module.get<SharpImageProcessor>(SharpImageProcessor);

        // Reset mocks
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
            const inputBuffer = Buffer.from('input image data');
            const outputBuffer = Buffer.from('processed image data');

            const result = await service.processImage(inputBuffer);

            expect(mockSharp).toHaveBeenCalledWith(inputBuffer);
            expect(mockSharpInstance.resize).toHaveBeenCalledWith({
                width: 800,
                height: 600,
                fit: 'inside',
            });
            expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
                quality: 80,
            });
            expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
            expect(result).toStrictEqual(outputBuffer);
        });

        it('should handle processing errors', async () => {
            const inputBuffer = Buffer.from('input image data');
            const error = new Error('Processing failed');
            mockSharpInstance.toBuffer.mockRejectedValue(error);

            await expect(service.processImage(inputBuffer)).rejects.toThrow('Processing failed');
        });
    });
});

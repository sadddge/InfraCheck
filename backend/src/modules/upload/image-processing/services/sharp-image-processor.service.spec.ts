import { Test, TestingModule } from '@nestjs/testing';
import * as sharp from 'sharp';
import { SharpImageProcessor } from './sharp-image-processor.service';

// Mock sharp module
jest.mock('sharp');

type MockSharpInstance = {
    resize: jest.Mock;
    jpeg: jest.Mock;
    toBuffer: jest.Mock;
};

describe('SharpImageProcessor', () => {
    let service: SharpImageProcessor;
    let mockSharp: jest.MockedFunction<typeof sharp>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SharpImageProcessor],
        }).compile();

        service = module.get<SharpImageProcessor>(SharpImageProcessor);
        mockSharp = sharp as jest.MockedFunction<typeof sharp>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processImage', () => {
        it('should process image with correct parameters', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const outputBuffer = Buffer.from('processed image data');

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockResolvedValue(outputBuffer),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act
            const result = await service.processImage(inputBuffer);

            // Assert
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
            expect(result).toBe(outputBuffer);
        });

        it('should handle empty buffer', async () => {
            // Arrange
            const inputBuffer = Buffer.alloc(0);
            const outputBuffer = Buffer.from('processed empty image');

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockResolvedValue(outputBuffer),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act
            const result = await service.processImage(inputBuffer);

            // Assert
            expect(mockSharp).toHaveBeenCalledWith(inputBuffer);
            expect(result).toBe(outputBuffer);
        });

        it('should throw error when sharp fails', async () => {
            // Arrange
            const inputBuffer = Buffer.from('invalid image data');
            const sharpError = new Error('Sharp processing failed');

            mockSharp.mockImplementation(() => {
                throw sharpError;
            });

            // Act & Assert
            await expect(service.processImage(inputBuffer)).rejects.toThrow(
                'Sharp processing failed',
            );
            expect(mockSharp).toHaveBeenCalledWith(inputBuffer);
        });

        it('should throw error when resize fails', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const resizeError = new Error('Resize failed');

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockImplementation(() => {
                    throw resizeError;
                }),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn(),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act & Assert
            await expect(service.processImage(inputBuffer)).rejects.toThrow('Resize failed');
            expect(mockSharpInstance.resize).toHaveBeenCalled();
        });

        it('should throw error when jpeg conversion fails', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const jpegError = new Error('JPEG conversion failed');

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockImplementation(() => {
                    throw jpegError;
                }),
                toBuffer: jest.fn(),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act & Assert
            await expect(service.processImage(inputBuffer)).rejects.toThrow(
                'JPEG conversion failed',
            );
            expect(mockSharpInstance.jpeg).toHaveBeenCalled();
        });

        it('should throw error when toBuffer fails', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const bufferError = new Error('Buffer conversion failed');

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockRejectedValue(bufferError),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act & Assert
            await expect(service.processImage(inputBuffer)).rejects.toThrow(
                'Buffer conversion failed',
            );
            expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
        });

        it('should call methods in correct order', async () => {
            // Arrange
            const inputBuffer = Buffer.from('input image data');
            const outputBuffer = Buffer.from('processed image data');
            const callOrder: string[] = [];

            const mockSharpInstance: MockSharpInstance = {
                resize: jest.fn().mockImplementation(() => {
                    callOrder.push('resize');
                    return mockSharpInstance;
                }),
                jpeg: jest.fn().mockImplementation(() => {
                    callOrder.push('jpeg');
                    return mockSharpInstance;
                }),
                toBuffer: jest.fn().mockImplementation(async () => {
                    callOrder.push('toBuffer');
                    return outputBuffer;
                }),
            };

            mockSharp.mockReturnValue(mockSharpInstance as unknown as sharp.Sharp);

            // Act
            await service.processImage(inputBuffer);

            // Assert
            expect(callOrder).toEqual(['resize', 'jpeg', 'toBuffer']);
        });
    });
});

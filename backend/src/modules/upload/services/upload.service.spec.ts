import { Test, TestingModule } from '@nestjs/testing';
import { TEST_IMAGE_DATA, TEST_URLS, createMockFile } from '../../../common/test-helpers';
import {
    IImageProcessor,
    IMAGE_PROCESSOR,
} from '../image-processing/interfaces/image-processor.interface';
import {
    IImageValidator,
    IMAGE_VALIDATOR,
} from '../image-validation/interfaces/image-validator.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/interfaces/storage-service.interface';
import { UploadService } from './upload.service';

describe('UploadService', () => {
    let service: UploadService;
    let imageProcessor: jest.Mocked<IImageProcessor>;
    let imageValidator: jest.Mocked<IImageValidator>;
    let storageService: jest.Mocked<IStorageService>;
    const mockFile: Express.Multer.File = createMockFile({
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: TEST_IMAGE_DATA.ENCODING,
        mimetype: TEST_IMAGE_DATA.MIME_TYPE,
        buffer: Buffer.from('mock file buffer'),
        size: TEST_IMAGE_DATA.SIZE,
    });

    beforeEach(async () => {
        const mockImageProcessor = {
            processImage: jest.fn(),
        };

        const mockImageValidator = {
            validate: jest.fn(),
        };

        const mockStorageService = {
            upload: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadService,
                {
                    provide: IMAGE_PROCESSOR,
                    useValue: mockImageProcessor,
                },
                {
                    provide: IMAGE_VALIDATOR,
                    useValue: mockImageValidator,
                },
                {
                    provide: STORAGE_SERVICE,
                    useValue: mockStorageService,
                },
            ],
        }).compile();

        service = module.get<UploadService>(UploadService);
        imageProcessor = module.get(IMAGE_PROCESSOR);
        imageValidator = module.get(IMAGE_VALIDATOR);
        storageService = module.get(STORAGE_SERVICE);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should successfully upload a file', async () => {
            // Arrange
            const processedBuffer = Buffer.from('processed image');
            const expectedUrl = TEST_URLS.IMAGE_UPLOAD;

            imageProcessor.processImage.mockResolvedValue(processedBuffer);
            imageValidator.validate.mockResolvedValue();
            storageService.upload.mockResolvedValue(expectedUrl);

            // Mock Date.now to get predictable file names
            const mockDate = 1234567890;
            jest.spyOn(Date, 'now').mockReturnValue(mockDate);

            // Act
            const result = await service.uploadFile(mockFile);

            // Assert
            expect(imageProcessor.processImage).toHaveBeenCalledWith(mockFile.buffer);
            expect(imageValidator.validate).toHaveBeenCalledWith(processedBuffer);
            expect(storageService.upload).toHaveBeenCalledWith(
                processedBuffer,
                `${mockDate}-${mockFile.originalname}`,
            );
            expect(result).toBe(expectedUrl);

            // Cleanup
            jest.restoreAllMocks();
        });

        it('should throw error when image processing fails', async () => {
            // Arrange
            const processingError = new Error('Image processing failed');
            imageProcessor.processImage.mockRejectedValue(processingError);

            // Act & Assert
            await expect(service.uploadFile(mockFile)).rejects.toThrow('Image processing failed');
            expect(imageProcessor.processImage).toHaveBeenCalledWith(mockFile.buffer);
            expect(imageValidator.validate).not.toHaveBeenCalled();
            expect(storageService.upload).not.toHaveBeenCalled();
        });

        it('should throw error when image validation fails', async () => {
            // Arrange
            const processedBuffer = Buffer.from('processed image');
            const validationError = new Error('Image validation failed');

            imageProcessor.processImage.mockResolvedValue(processedBuffer);
            imageValidator.validate.mockRejectedValue(validationError);

            // Act & Assert
            await expect(service.uploadFile(mockFile)).rejects.toThrow('Image validation failed');
            expect(imageProcessor.processImage).toHaveBeenCalledWith(mockFile.buffer);
            expect(imageValidator.validate).toHaveBeenCalledWith(processedBuffer);
            expect(storageService.upload).not.toHaveBeenCalled();
        });

        it('should throw error when storage upload fails', async () => {
            // Arrange
            const processedBuffer = Buffer.from('processed image');
            const storageError = new Error('Storage upload failed');

            imageProcessor.processImage.mockResolvedValue(processedBuffer);
            imageValidator.validate.mockResolvedValue();
            storageService.upload.mockRejectedValue(storageError);

            const mockDate = 1234567890;
            jest.spyOn(Date, 'now').mockReturnValue(mockDate);

            // Act & Assert
            await expect(service.uploadFile(mockFile)).rejects.toThrow('Storage upload failed');
            expect(imageProcessor.processImage).toHaveBeenCalledWith(mockFile.buffer);
            expect(imageValidator.validate).toHaveBeenCalledWith(processedBuffer);
            expect(storageService.upload).toHaveBeenCalledWith(
                processedBuffer,
                `${mockDate}-${mockFile.originalname}`,
            );

            // Cleanup
            jest.restoreAllMocks();
        });

        it('should generate unique file names for multiple uploads', async () => {
            // Arrange
            const processedBuffer = Buffer.from('processed image');
            const expectedUrl = TEST_URLS.GENERIC_UPLOAD;

            imageProcessor.processImage.mockResolvedValue(processedBuffer);
            imageValidator.validate.mockResolvedValue();
            storageService.upload.mockResolvedValue(expectedUrl);

            const mockDates = [1234567890, 1234567891];
            jest.spyOn(Date, 'now')
                .mockReturnValueOnce(mockDates[0])
                .mockReturnValueOnce(mockDates[1]);

            // Act
            const result1 = await service.uploadFile(mockFile);
            const result2 = await service.uploadFile(mockFile);

            // Assert
            expect(storageService.upload).toHaveBeenNthCalledWith(
                1,
                processedBuffer,
                `${mockDates[0]}-${mockFile.originalname}`,
            );
            expect(storageService.upload).toHaveBeenNthCalledWith(
                2,
                processedBuffer,
                `${mockDates[1]}-${mockFile.originalname}`,
            );
            expect(result1).toBe(expectedUrl);
            expect(result2).toBe(expectedUrl);

            // Cleanup
            jest.restoreAllMocks();
        });
    });
});

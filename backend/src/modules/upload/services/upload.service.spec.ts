import { UploadService } from './upload.service';
import type { IImageProcessor } from '../image-processing/interfaces/image-processor.interface';
import type { IImageValidator } from '../image-validation/interfaces/image-validator.interface';
import type { IStorageService } from '../storage/interfaces/storage-service.interface';

describe('UploadService', () => {
    let service: UploadService;
    let processor: jest.Mocked<IImageProcessor>;
    let validator: jest.Mocked<IImageValidator>;
    let storage: jest.Mocked<IStorageService>;

    beforeEach(() => {
        processor = { processImage: jest.fn() } as any;
        validator = { validate: jest.fn() } as any;
        storage = { upload: jest.fn() } as any;
        service = new UploadService(processor, validator, storage);
    });

    it('processes, validates and uploads the file', async () => {
        const file = { buffer: Buffer.from('buf'), originalname: 'pic.png' } as any;
        const processed = Buffer.from('processed');
        processor.processImage.mockResolvedValueOnce(processed);
        validator.validate.mockResolvedValueOnce();
        storage.upload.mockResolvedValueOnce('url');

        await expect(service.uploadFile(file)).resolves.toBe('url');
        expect(processor.processImage).toHaveBeenCalledWith(file.buffer);
        expect(validator.validate).toHaveBeenCalledWith(processed);
        expect(storage.upload).toHaveBeenCalledWith(processed, expect.stringMatching(/pic.png$/));
    });
});

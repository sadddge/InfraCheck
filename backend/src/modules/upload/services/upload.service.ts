import { Inject, Injectable } from '@nestjs/common';
import {
    IImageProcessor,
    IMAGE_PROCESSOR,
} from '../image-processing/interfaces/image-processor.interface';
import {
    IImageValidator,
    IMAGE_VALIDATOR,
} from '../image-validation/interfaces/image-validator.interface';
import { IUploadService } from '../interfaces/upload-service.interface';
import { IStorageService, STORAGE_SERVICE } from '../storage/interfaces/storage-service.interface';

/**
 * Upload service orchestrating image processing, validation, and storage.
 * Provides complete file upload workflow for report images with quality control.
 *
 * Upload pipeline:
 * 1. Image processing (resize, optimize, format conversion)
 * 2. Content validation (AI-based inappropriate content detection)
 * 3. Storage upload (local or cloud storage)
 *
 * @example
 * ```typescript
 * const uploadService = new UploadService(processor, validator, storage);
 * const imageUrl = await uploadService.uploadFile(multerFile);
 * ```
 */
@Injectable()
export class UploadService implements IUploadService {
    /**
     * Creates a new UploadService instance.
     *
     * @param processor Image processing service for optimization and resizing
     * @param validator Image validation service for content screening
     * @param storageService Storage service for file persistence
     */
    constructor(
        @Inject(IMAGE_PROCESSOR)
        private readonly processor: IImageProcessor,
        @Inject(IMAGE_VALIDATOR)
        private readonly validator: IImageValidator,
        @Inject(STORAGE_SERVICE)
        private readonly storageService: IStorageService,
    ) {}

    /**
     * @inheritDoc
     */
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const processedFile = await this.processor.processImage(file.buffer);
        await this.validator.validate(processedFile);
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileUrl = await this.storageService.upload(processedFile, fileName);
        return fileUrl;
    }
}

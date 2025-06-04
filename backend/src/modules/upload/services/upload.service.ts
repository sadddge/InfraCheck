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

@Injectable()
export class UploadService implements IUploadService {
    constructor(
        @Inject(IMAGE_PROCESSOR)
        private readonly processor: IImageProcessor,
        @Inject(IMAGE_VALIDATOR)
        private readonly validator: IImageValidator,
        @Inject(STORAGE_SERVICE)
        private readonly storageService: IStorageService,
    ) {}

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const processedFile = await this.processor.processImage(file.buffer);
        await this.validator.validate(processedFile);
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileUrl = await this.storageService.upload(processedFile, fileName);
        return fileUrl;
    }
}

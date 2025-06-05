import { Module } from '@nestjs/common';
import { ImageProcessingModule } from './image-processing/image-processing.module';
import { ImageValidationModule } from './image-validation/image-validation.module';
import { UPLOAD_SERVICE } from './interfaces/upload-service.interface';
import { UploadService } from './services/upload.service';
import { StorageModule } from './storage/storage.module';

@Module({
    imports: [StorageModule, ImageValidationModule, ImageProcessingModule],
    controllers: [],
    providers: [
        {
            provide: UPLOAD_SERVICE,
            useClass: UploadService,
        },
    ],
    exports: [UPLOAD_SERVICE],
})
export class UploadModule {}

import { Module } from '@nestjs/common';
import { IMAGE_PROCESSOR } from './interfaces/image-processor.interface';
import { SharpImageProcessor } from './services/sharp-image-processor.service';

@Module({
    providers: [
        {
            provide: IMAGE_PROCESSOR,
            useClass: SharpImageProcessor,
        },
    ],
    exports: [IMAGE_PROCESSOR],
})
export class ImageProcessingModule {}

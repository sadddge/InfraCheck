import { Module } from '@nestjs/common';
import { IMAGE_VALIDATOR } from './interfaces/image-validator.interface';
import { AIImageValidatorStrategy } from './strategies/ai-image-validator.strategy';

@Module({
    providers: [
        {
            provide: IMAGE_VALIDATOR,
            useClass: AIImageValidatorStrategy,
        },
    ],
    exports: [IMAGE_VALIDATOR],
})
export class ImageValidationModule {}

import vision from '@google-cloud/vision';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
} from '@nestjs/common';
import { IImageValidator } from '../interfaces/image-validator.interface';

@Injectable()
export class AIImageValidatorStrategy implements IImageValidator {
    private readonly logger = new Logger(AIImageValidatorStrategy.name);
    private readonly client = new vision.ImageAnnotatorClient();

    async validate(buffer: Buffer): Promise<void> {
        const [result] = await this.client.safeSearchDetection({ image: { content: buffer } });
        const safeSearch = result.safeSearchAnnotation;

        if (!safeSearch) {
            throw new InternalServerErrorException('No SafeSearch annotation found');
        }

        const flags = {
            adult: safeSearch.adult,
            spoof: safeSearch.spoof,
            medical: safeSearch.medical,
            violence: safeSearch.violence,
            racy: safeSearch.racy,
        };

        const dangerLevels = ['LIKELY', 'VERY_LIKELY'];
        for (const key of Object.keys(flags)) {
            this.logger.debug(`SafeSearch flag for ${key}: ${flags[key]}`);
            if (dangerLevels.includes(flags[key])) {
                this.logger.warn(`Image validation failed: ${key} content detected`);
                throw new NotAcceptableException(
                    `Image validation failed: ${key} content detected`,
                );
            }
        }
    }
}

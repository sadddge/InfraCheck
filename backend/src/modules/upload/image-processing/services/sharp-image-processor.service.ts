import { Injectable } from '@nestjs/common';
import { IImageProcessor } from '../interfaces/image-processor.interface';
import * as sharp from 'sharp';

@Injectable()
export class SharpImageProcessor implements IImageProcessor {
    async processImage(buffer: Buffer): Promise<Buffer> {
        return await sharp(buffer)
            .resize({ width: 800, height: 600, fit: 'inside' })
            .jpeg({ quality: 80 })
            .toBuffer()
    }
}

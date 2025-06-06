export const IMAGE_PROCESSOR = 'IMAGE_PROCESSOR';

export interface IImageProcessor {
    processImage(buffer: Buffer): Promise<Buffer>;
}

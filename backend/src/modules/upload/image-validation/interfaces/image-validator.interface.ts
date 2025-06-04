export const IMAGE_VALIDATOR = 'IMAGE_VALIDATOR';

export interface IImageValidator {
    validate(buffer: Buffer): Promise<void>;
}

/**
 * Service token for dependency injection of image validator service.
 * Used with NestJS @Inject decorator to provide IImageValidator implementation.
 */
export const IMAGE_VALIDATOR = 'IMAGE_VALIDATOR';

/**
 * Interface defining the contract for image validation service implementations.
 * Provides abstraction for different image validation strategies and content analysis methods.
 *
 * Image validator interface providing:
 * - Content safety analysis and filtering
 * - Inappropriate content detection and blocking
 * - Customizable validation rules and thresholds
 * - Integration with various AI/ML validation services
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AIImageValidatorStrategy implements IImageValidator {
 *   async validate(buffer: Buffer): Promise<void> {
 *     // Implementation using Google Cloud Vision AI
 *   }
 * }
 *
 * @Injectable()
 * export class RuleBasedImageValidator implements IImageValidator {
 *   async validate(buffer: Buffer): Promise<void> {
 *     // Implementation using rule-based content analysis
 *   }
 * }
 * ```
 */
export interface IImageValidator {
    /**
     * Validates image content for appropriateness and safety.
     * Analyzes image buffer for inappropriate content and throws exception if validation fails.
     * Should be called before processing and storing user-uploaded images.
     *
     * @param buffer Image data as Buffer to validate for content safety
     * @returns Promise that resolves if image passes all validation checks
     * @throws {NotAcceptableException} When image contains inappropriate content
     * @throws {Error} When validation service fails or returns invalid results
     *
     * @example
     * ```typescript
     * // Validate image before processing
     * const uploadedImage = await multerFile.buffer();
     *
     * try {
     *   await imageValidator.validate(uploadedImage);
     *   console.log('✓ Image passed content validation');
     *
     *   // Safe to proceed with processing
     *   const processedImage = await imageProcessor.processImage(uploadedImage);
     *   const imageUrl = await storageService.upload(processedImage, fileName);
     *
     *   // Save to database
     *   await reportImageRepository.save({
     *     reportId,
     *     imageUrl,
     *     validatedAt: new Date()
     *   });
     *
     * } catch (error) {
     *   console.error('Image validation failed:', error.message);
     *
     *   // Handle inappropriate content
     *   if (error instanceof NotAcceptableException) {
     *     return res.status(406).json({
     *       error: 'Image content not appropriate',
     *       message: 'Please upload images suitable for infrastructure reporting'
     *     });
     *   }
     *
     *   // Handle service errors
     *   throw new InternalServerErrorException('Image validation service unavailable');
     * }
     * ```
     */
    validate(buffer: Buffer): Promise<void>;
}

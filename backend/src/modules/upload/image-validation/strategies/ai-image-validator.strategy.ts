import vision from '@google-cloud/vision';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
} from '@nestjs/common';
import { IImageValidator } from '../interfaces/image-validator.interface';

/**
 * AI-powered image validator using Google Cloud Vision API for content safety analysis.
 * Implements comprehensive image validation to ensure appropriate content for infrastructure reports.
 *
 * Validation capabilities:
 * - Adult content detection and blocking
 * - Violence and inappropriate content filtering
 * - Medical content identification (may be inappropriate for public reports)
 * - Spoof and fake content detection
 * - Racy content identification and prevention
 *
 * Safety features:
 * - Google Cloud Vision SafeSearch API integration
 * - Configurable sensitivity levels (LIKELY, VERY_LIKELY)
 * - Comprehensive logging for audit and debugging
 * - Fail-safe error handling for API issues
 * - Real-time validation before storage
 *
 * @example
 * ```typescript
 * const aiValidator = new AIImageValidatorStrategy();
 *
 * try {
 *   const imageBuffer = await multerFile.buffer();
 *   await aiValidator.validate(imageBuffer);
 *   console.log('Image passed AI content validation');
 *
 *   // Proceed with processing and storage
 *   const processedImage = await imageProcessor.processImage(imageBuffer);
 *   const imageUrl = await storageService.upload(processedImage, fileName);
 * } catch (error) {
 *   console.error('Image validation failed:', error.message);
 *   // Reject upload and inform user
 * }
 * ```
 */
@Injectable()
export class AIImageValidatorStrategy implements IImageValidator {
    /** Logger instance for tracking validation operations and security events */
    private readonly logger = new Logger(AIImageValidatorStrategy.name);

    /** Google Cloud Vision API client for SafeSearch content analysis */
    private readonly client = new vision.ImageAnnotatorClient();

    /**
     * Validates image content using Google Cloud Vision AI SafeSearch detection.
     * Analyzes image for inappropriate content across multiple categories and blocks unsafe images.
     * Provides detailed logging for security audit and monitoring purposes.
     *
     * Validation categories:
     * - Adult: Explicit adult content detection
     * - Violence: Violent or disturbing content identification
     * - Medical: Medical content that may be inappropriate for public viewing
     * - Spoof: Fake or manipulated content detection
     * - Racy: Suggestive or racy content identification
     *
     * @param buffer Image data as Buffer to analyze for content safety
     * @returns Promise that resolves if image passes validation
     * @throws {NotAcceptableException} When inappropriate content is detected
     * @throws {InternalServerErrorException} When API call fails or returns invalid data
     *
     * @example
     * ```typescript
     * // Validate infrastructure report image
     * const reportImage = await req.files[0].buffer();
     *
     * try {
     *   await aiImageValidator.validate(reportImage);
     *   console.log('✓ Image content is appropriate for infrastructure reporting');
     *
     *   // Safe to proceed with upload
     *   const processedImage = await imageProcessor.processImage(reportImage);
     *   const savedUrl = await storageService.upload(processedImage, fileName);
     *
     * } catch (error) {
     *   if (error instanceof NotAcceptableException) {
     *     console.log('✗ Image rejected: inappropriate content detected');
     *     // Return error to user with guidance
     *     res.status(406).json({
     *       error: 'Image content not appropriate for infrastructure reports',
     *       message: 'Please upload images related to infrastructure issues only'
     *     });
     *   } else {
     *     console.error('AI validation service error:', error.message);
     *     // Fallback handling or manual review queue
     *   }
     * }
     * ```
     */
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

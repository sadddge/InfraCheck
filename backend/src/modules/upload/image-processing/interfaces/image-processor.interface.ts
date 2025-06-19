/**
 * Service token for dependency injection of image processor service.
 * Used with NestJS @Inject decorator to provide IImageProcessor implementation.
 */
export const IMAGE_PROCESSOR = 'IMAGE_PROCESSOR';

/**
 * Interface defining the contract for image processing service implementations.
 * Provides abstraction for different image processing libraries and strategies.
 *
 * Image processor interface providing:
 * - Image optimization and compression
 * - Format standardization and conversion
 * - Resizing and aspect ratio management
 * - Quality control for web optimization
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class SharpImageProcessor implements IImageProcessor {
 *   async processImage(buffer: Buffer): Promise<Buffer> {
 *     // Implementation using Sharp library
 *   }
 * }
 *
 * @Injectable()
 * export class ImageMagickProcessor implements IImageProcessor {
 *   async processImage(buffer: Buffer): Promise<Buffer> {
 *     // Implementation using ImageMagick
 *   }
 * }
 * ```
 */
export interface IImageProcessor {
    /**
     * Processes and optimizes an image buffer for web display and storage.
     * Handles resizing, format conversion, and quality optimization based on implementation.
     * Should produce web-optimized images suitable for fast loading and display.
     *
     * @param buffer Original image data as Buffer from file upload or processing
     * @returns Promise resolving to processed and optimized image buffer
     * @throws {Error} When image processing fails due to invalid format, corruption, or processing errors
     *
     * @example
     * ```typescript
     * // Process uploaded image for report
     * const originalImage = await multerFile.buffer();
     * const optimizedImage = await imageProcessor.processImage(originalImage);
     *
     * // Typical optimizations:
     * // - Resize to max 800x600 (preserving aspect ratio)
     * // - Convert to JPEG format for consistency
     * // - Compress to 80% quality for size optimization
     * // - Strip metadata to reduce file size
     *
     * console.log(`Size reduction: ${originalImage.length} → ${optimizedImage.length} bytes`);
     *
     * // Save optimized image
     * const imageUrl = await storageService.upload(optimizedImage, fileName);
     * ```
     */
    processImage(buffer: Buffer): Promise<Buffer>;
}

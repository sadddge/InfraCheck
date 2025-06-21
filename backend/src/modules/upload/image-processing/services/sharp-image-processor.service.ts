import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IImageProcessor } from '../interfaces/image-processor.interface';

/**
 * Sharp-based image processor providing high-performance image optimization for uploads.
 * Implements image resizing, format conversion, and quality optimization using Sharp library.
 *
 * Image processing capabilities:
 * - Automatic resizing to standardized dimensions (800x600 max)
 * - JPEG conversion with optimized quality (80% compression)
 * - Aspect ratio preservation with 'fit: inside' strategy
 * - Memory-efficient buffer-to-buffer processing
 * - High-performance native library (libvips) backend
 *
 * Optimization features:
 * - Reduces file sizes by 70-80% typically
 * - Standardizes image formats to JPEG for consistency
 * - Maintains visual quality while reducing bandwidth
 * - Fast processing suitable for real-time uploads
 *
 * @example
 * ```typescript
 * const imageProcessor = new SharpImageProcessor();
 *
 * // Process uploaded image
 * const originalBuffer = await multerFile.buffer();
 * const optimizedBuffer = await imageProcessor.processImage(originalBuffer);
 *
 * console.log(`Original size: ${originalBuffer.length} bytes`);
 * console.log(`Optimized size: ${optimizedBuffer.length} bytes`);
 * console.log(`Savings: ${((1 - optimizedBuffer.length / originalBuffer.length) * 100).toFixed(1)}%`);
 * ```
 */
@Injectable()
export class SharpImageProcessor implements IImageProcessor {
    /**
     * Processes and optimizes an image buffer for web display and storage.
     * Resizes to maximum 800x600 dimensions while preserving aspect ratio,
     * converts to JPEG format with 80% quality for optimal file size.
     *
     * Processing pipeline:
     * 1. Load image from buffer (supports PNG, JPEG, WebP, etc.)
     * 2. Resize to fit within 800x600 pixels (maintains aspect ratio)
     * 3. Convert to JPEG format with 80% quality compression
     * 4. Return optimized buffer for storage
     *
     * @param buffer Original image data as Buffer from file upload
     * @returns Promise resolving to optimized image buffer (JPEG format)
     * @throws {Error} When image processing fails due to invalid format or corruption
     *
     * @example
     * ```typescript
     * // Process report image upload
     * const uploadedFile = req.files[0]; // From multer
     * const originalBuffer = uploadedFile.buffer;
     *
     * try {
     *   const processedBuffer = await imageProcessor.processImage(originalBuffer);
     *
     *   // Save optimized image
     *   const fileName = `report-${reportId}-optimized.jpg`;
     *   const imageUrl = await storageService.upload(processedBuffer, fileName);
     *
     *   console.log(`Image optimized and saved: ${imageUrl}`);
     *   // Typical results:
     *   // - Original: 3.2MB PNG → Optimized: 0.4MB JPEG
     *   // - Dimensions: 4000x3000 → 800x600 (preserved ratio)
     *   // - Format: PNG/HEIC/WebP → JPEG
     * } catch (error) {
     *   console.error('Image processing failed:', error.message);
     *   // Handle corrupted or unsupported image formats
     * }
     * ```
     */
    async processImage(buffer: Buffer): Promise<Buffer> {
        return await sharp(buffer)
            .resize({ width: 800, height: 600, fit: 'inside' })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
}

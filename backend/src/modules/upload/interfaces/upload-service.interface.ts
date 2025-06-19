/**
 * Service token for dependency injection of upload service.
 * Used with NestJS @Inject decorator to provide IUploadService implementation.
 */
export const UPLOAD_SERVICE = 'UPLOAD_SERVICE';

/**
 * Interface defining the contract for file upload service implementations.
 * Provides complete upload workflow with processing, validation, and storage.
 *
 * Upload service interface providing:
 * - Image processing and optimization
 * - Content validation and screening
 * - Storage abstraction (local/cloud)
 * - URL generation for uploaded files
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UploadService implements IUploadService {
 *   async uploadFile(file: Express.Multer.File): Promise<string> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IUploadService {
    /**
     * Uploads and processes a file through the complete pipeline.
     * Handles image optimization, validation, and storage.
     *
     * @param file Multer file object from multipart request
     * @returns Public URL of the uploaded and processed file
     * @throws {BadRequestException} When file processing or validation fails
     *
     * @example
     * ```typescript
     * const fileUrl = await uploadService.uploadFile(multerFile);
     * console.log(`File available at: ${fileUrl}`);
     * ```
     */
    uploadFile(file: Express.Multer.File): Promise<string>;
}

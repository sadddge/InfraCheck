/**
 * Service token for dependency injection of storage service.
 * Used with NestJS @Inject decorator to provide IStorageService implementation.
 */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

/**
 * Interface defining the contract for file storage service implementations.
 * Provides abstraction for different storage backends (local, cloud, etc.).
 *
 * Storage service interface providing:
 * - File upload operations with buffer handling
 * - URL/path generation for file access
 * - Error handling for storage operations
 * - Backend abstraction for easy switching
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class LocalStorageService implements IStorageService {
 *   async upload(buffer: Buffer, fileName: string): Promise<string> {
 *     // Implementation for local file system
 *   }
 * }
 *
 * @Injectable()
 * export class S3StorageService implements IStorageService {
 *   async upload(buffer: Buffer, fileName: string): Promise<string> {
 *     // Implementation for AWS S3
 *   }
 * }
 * ```
 */
export interface IStorageService {
    /**
     * Uploads a file buffer to the configured storage backend.
     * Handles file writing and returns accessible URL or path for the stored file.
     * Supports any storage implementation (local, cloud, CDN, etc.).
     *
     * @param buffer File content as Buffer (from multer or image processing)
     * @param fileName Sanitized file name with extension (should be unique)
     * @returns Promise resolving to URL path or full URL for accessing the file
     * @throws {Error} When upload fails due to storage issues, permissions, or invalid parameters
     *
     * @example
     * ```typescript
     * // Upload user-provided image
     * const fileBuffer = await multerFile.buffer();
     * const fileName = `report-${reportId}-${Date.now()}.jpg`;
     * const fileUrl = await storageService.upload(fileBuffer, fileName);
     *
     * // Save URL to database
     * await reportImageRepository.save({
     *   reportId,
     *   imageUrl: fileUrl,
     *   fileName: fileName
     * });
     *
     * // Return to client
     * res.json({ imageUrl: fileUrl });
     * // Client can access image at: domain.com/uploads/report-123-1640995200000.jpg
     * ```
     */
    upload(buffer: Buffer, fileName: string): Promise<string>;
}

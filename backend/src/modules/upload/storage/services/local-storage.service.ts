import { existsSync, mkdirSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { storageError } from '../../../../common/helpers/exception.helper';
import { IStorageService } from '../interfaces/storage-service.interface';

/**
 * Local file storage service providing disk-based file management for uploaded images.
 * Implements secure file storage with automatic directory creation and error handling.
 *
 * Storage functionality:
 * - Local disk storage in configurable upload directory
 * - Automatic directory structure creation
 * - Secure file writing with buffer handling
 * - URL path generation for file access
 * - Error handling for disk operations
 *
 * Security features:
 * - Controlled storage location (uploads directory)
 * - File name validation through interface contract
 * - Buffer-based writing for memory safety
 * - Error containment with proper exception handling
 *
 * @example
 * ```typescript
 * const storageService = new LocalStorageService();
 *
 * // Upload image file
 * const imageBuffer = await file.buffer();
 * const fileName = 'report-123-image-1.jpg';
 * const fileUrl = await storageService.upload(imageBuffer, fileName);
 *
 * console.log(fileUrl); // "/uploads/report-123-image-1.jpg"
 * // File is now accessible at: http://domain.com/uploads/report-123-image-1.jpg
 * ```
 */
@Injectable()
export class LocalStorageService implements IStorageService {
    /** Base storage path for uploaded files relative to project root */
    private readonly storagePath: string = join(process.cwd(), 'uploads');

    /**
     * Creates a new LocalStorageService instance and ensures storage directory exists.
     * Automatically creates the uploads directory structure if it doesn't exist.
     */
    constructor() {
        if (!existsSync(this.storagePath)) {
            mkdirSync(this.storagePath, { recursive: true });
        }
    }

    /**
     * Uploads a file buffer to local disk storage.
     * Writes the file to the uploads directory and returns the accessible URL path.
     * Handles file system operations with proper error handling and validation.
     *
     * @param buffer File content as Buffer (from multer or processed image)
     * @param fileName Sanitized file name including extension
     * @returns URL path to access the uploaded file
     * @throws {AppException} UPL004 - When file write operation fails
     *
     * @example
     * ```typescript
     * // Upload original image
     * const originalBuffer = await multerFile.buffer();
     * const originalUrl = await storageService.upload(
     *   originalBuffer,
     *   'report-123-original.jpg'
     * );
     *
     * // Upload processed thumbnail
     * const thumbnailBuffer = await imageProcessor.generateThumbnail(originalBuffer);
     * const thumbnailUrl = await storageService.upload(
     *   thumbnailBuffer,
     *   'report-123-thumb.jpg'
     * );
     *
     * console.log(originalUrl);  // "/uploads/report-123-original.jpg"
     * console.log(thumbnailUrl); // "/uploads/report-123-thumb.jpg"
     * ```
     */
    async upload(buffer: Buffer, fileName: string): Promise<string> {
        const filePath = join(this.storagePath, fileName);
        writeFile(filePath, buffer, err => {
            if (err) {
                storageError({
                    storageLocation: filePath,
                    fileName,
                });
            }
        });
        return `/uploads/${fileName}`;
    }
}

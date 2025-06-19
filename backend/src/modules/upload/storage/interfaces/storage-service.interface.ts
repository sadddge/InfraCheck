export const STORAGE_SERVICE = 'STORAGE_SERVICE';

/**
 * Interface for storage service implementations that handle file uploads.
 *
 * This interface defines the contract for storage services that can upload
 * files to various storage backends (e.g., local filesystem, cloud storage).
 */
export interface IStorageService {
    /**
     * Uploads a file buffer to the storage backend.
     *
     * @param buffer - The file content as a Buffer
     * @param fileName - The name to assign to the uploaded file
     * @returns A promise that resolves to the file path or URL of the uploaded file
     * @throws Error when upload fails due to storage issues or invalid parameters
     */
    upload(buffer: Buffer, fileName: string): Promise<string>;
}

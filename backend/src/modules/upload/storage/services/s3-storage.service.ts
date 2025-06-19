import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../interfaces/storage-service.interface';

/**
 * AWS S3 storage service implementation for cloud file storage.
 * Provides secure, scalable cloud storage for uploaded images and files.
 *
 * Features:
 * - Direct upload to AWS S3 buckets
 * - Automatic URL generation for stored files
 * - Configuration-based bucket and region setup
 * - Production-ready cloud storage solution
 *
 * @example
 * ```typescript
 * const s3Storage = new S3StorageService(configService);
 * const fileUrl = await s3Storage.upload(imageBuffer, 'photo.jpg');
 * ```
 */
@Injectable()
export class S3StorageService implements IStorageService {
    /** AWS S3 client instance configured with region and credentials */
    private readonly s3Client: S3Client;

    /** S3 bucket name for file storage */
    private readonly bucketName: string;

    /**
     * Creates a new S3StorageService instance.
     * Initializes S3 client with configuration from environment variables.
     *
     * @param configService NestJS configuration service for environment variables
     */
    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.getOrThrow<string>('AWS_REGION'),
        });
        this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    }

    /**
     * Uploads a file buffer to AWS S3 bucket.
     * Stores the file in the configured S3 bucket and returns the public URL.
     *
     * @param buffer File content as Buffer
     * @param fileName Name/key for the file in S3
     * @returns Public HTTPS URL of the uploaded file
     * @throws {Error} When S3 upload fails or configuration is invalid
     *
     * @example
     * ```typescript
     * const imageUrl = await s3Storage.upload(imageBuffer, '12345-photo.jpg');
     * console.log(`Image stored at: ${imageUrl}`);
     * ```
     */
    async upload(buffer: Buffer, fileName: string): Promise<string> {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: buffer,
            }),
        );
        return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
    }
}

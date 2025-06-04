import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../interfaces/storage-service.interface';

@Injectable()
export class S3StorageService implements IStorageService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.getOrThrow<string>('AWS_REGION'),
        });
        this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    }
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

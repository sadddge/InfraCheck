import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from './s3-storage.service';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');

describe('S3StorageService', () => {
    let service: S3StorageService;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockS3Client: jest.Mocked<S3Client>;

    const mockBucketName = 'test-bucket';
    const mockRegion = 'us-east-1';

    beforeEach(async () => {
        const mockConfig = {
            getOrThrow: jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'AWS_REGION':
                        return mockRegion;
                    case 'AWS_S3_BUCKET':
                        return mockBucketName;
                    default:
                        throw new Error(`Unknown config key: ${key}`);
                }
            }),
        };

        mockS3Client = {
            send: jest.fn().mockResolvedValue({}),
        } as unknown as jest.Mocked<S3Client>;

        (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                S3StorageService,
                {
                    provide: ConfigService,
                    useValue: mockConfig,
                },
            ],
        }).compile();

        service = module.get<S3StorageService>(S3StorageService);
        mockConfigService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it('should initialize S3Client with correct configuration', () => {
            // Assert
            expect(S3Client).toHaveBeenCalledWith({
                region: mockRegion,
            });
            expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('AWS_REGION');
            expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('AWS_S3_BUCKET');
        });
    });

    describe('upload', () => {
        it('should successfully upload file to S3', async () => {
            // Arrange
            const buffer = Buffer.from('test file content');
            const fileName = 'test-file.jpg';
            const expectedUrl = `https://${mockBucketName}.s3.amazonaws.com/${fileName}`;

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
            expect(result).toBe(expectedUrl);
        });

        it('should handle empty buffer', async () => {
            // Arrange
            const buffer = Buffer.alloc(0);
            const fileName = 'empty-file.jpg';
            const expectedUrl = `https://${mockBucketName}.s3.amazonaws.com/${fileName}`;

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
            expect(result).toBe(expectedUrl);
        });

        it('should handle special characters in filename', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test file with spaces & special-chars.jpg';
            const expectedUrl = `https://${mockBucketName}.s3.amazonaws.com/${fileName}`;

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
            expect(result).toBe(expectedUrl);
        });

        it('should throw error when S3 upload fails', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test-file.jpg';
            const s3Error = new Error('S3 upload failed');

            (mockS3Client.send as jest.Mock).mockRejectedValueOnce(s3Error);

            // Act & Assert
            await expect(service.upload(buffer, fileName)).rejects.toThrow('S3 upload failed');
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
        });

        it('should handle large files', async () => {
            // Arrange
            const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
            const fileName = 'large-file.jpg';
            const expectedUrl = `https://${mockBucketName}.s3.amazonaws.com/${fileName}`;

            // Act
            const result = await service.upload(largeBuffer, fileName);

            // Assert
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
            expect(result).toBe(expectedUrl);
        });

        it('should handle concurrent uploads', async () => {
            // Arrange
            const buffer1 = Buffer.from('file 1 content');
            const buffer2 = Buffer.from('file 2 content');
            const fileName1 = 'file1.jpg';
            const fileName2 = 'file2.jpg';

            // Act
            const [result1, result2] = await Promise.all([
                service.upload(buffer1, fileName1),
                service.upload(buffer2, fileName2),
            ]);

            // Assert
            expect(result1).toBe(`https://${mockBucketName}.s3.amazonaws.com/${fileName1}`);
            expect(result2).toBe(`https://${mockBucketName}.s3.amazonaws.com/${fileName2}`);
            expect(mockS3Client.send).toHaveBeenCalledTimes(2);
        });

        it('should create correct S3 URL format', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'folder/subfolder/file.jpg';
            const expectedUrl = `https://${mockBucketName}.s3.amazonaws.com/${fileName}`;

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it('should handle S3 service errors gracefully', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test-file.jpg';
            const serviceError = {
                name: 'NoSuchBucket',
                message: 'The specified bucket does not exist',
            };

            (mockS3Client.send as jest.Mock).mockRejectedValueOnce(serviceError);

            // Act & Assert
            await expect(service.upload(buffer, fileName)).rejects.toEqual(serviceError);
        });

        it('should use correct bucket name in upload', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test-file.jpg';

            // Act
            await service.upload(buffer, fileName);

            // Assert
            expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
        });
    });
});

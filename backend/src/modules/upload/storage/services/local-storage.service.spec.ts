import { existsSync, mkdirSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { AppException } from 'src/common/exceptions/app.exception';
import { LocalStorageService } from './local-storage.service';

// Mock fs module
jest.mock('node:fs');
jest.mock('node:path');

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let mockExistsSync: jest.MockedFunction<typeof existsSync>;
    let mockMkdirSync: jest.MockedFunction<typeof mkdirSync>;
    let mockWriteFile: jest.MockedFunction<typeof writeFile>;
    let mockJoin: jest.MockedFunction<typeof join>;

    beforeEach(async () => {
        mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
        mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;
        mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
        mockJoin = join as jest.MockedFunction<typeof join>;

        // Mock path.join to return predictable paths
        mockJoin.mockImplementation((...paths: string[]) => paths.join('/'));

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create uploads directory if it does not exist', async () => {
            // Arrange
            mockExistsSync.mockReturnValue(false);
            mockMkdirSync.mockReturnValue(undefined);

            // Act
            const module: TestingModule = await Test.createTestingModule({
                providers: [LocalStorageService],
            }).compile();

            service = module.get<LocalStorageService>(LocalStorageService);

            // Assert
            expect(mockExistsSync).toHaveBeenCalled();
            expect(mockMkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
        });

        it('should not create uploads directory if it already exists', async () => {
            // Arrange
            mockExistsSync.mockReturnValue(true);

            // Act
            const module: TestingModule = await Test.createTestingModule({
                providers: [LocalStorageService],
            }).compile();

            service = module.get<LocalStorageService>(LocalStorageService);

            // Assert
            expect(mockExistsSync).toHaveBeenCalled();
            expect(mockMkdirSync).not.toHaveBeenCalled();
        });
    });

    describe('upload', () => {
        beforeEach(async () => {
            // Setup service for upload tests
            mockExistsSync.mockReturnValue(true);

            const module: TestingModule = await Test.createTestingModule({
                providers: [LocalStorageService],
            }).compile();

            service = module.get<LocalStorageService>(LocalStorageService);
        });

        it('should successfully upload a file', async () => {
            // Arrange
            const buffer = Buffer.from('test file content');
            const fileName = 'test-file.jpg';
            const expectedUrl = `/uploads/${fileName}`;

            mockWriteFile.mockImplementation((path, data, callback) => {
                // Simulate successful write
                if (typeof callback === 'function') {
                    callback(null);
                }
            });

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(mockWriteFile).toHaveBeenCalledWith(
                expect.stringContaining(fileName),
                buffer,
                expect.any(Function),
            );
            expect(result).toBe(expectedUrl);
        });

        it('should throw AppException when file write fails', async () => {
            // Arrange
            const buffer = Buffer.from('test file content');
            const fileName = 'test-file.jpg';
            const writeError = new Error('Permission denied');

            mockWriteFile.mockImplementation((path, data, callback) => {
                // Simulate write error
                if (typeof callback === 'function') {
                    callback(writeError);
                }
            });

            // Act & Assert
            await expect(service.upload(buffer, fileName)).rejects.toThrow(AppException);
        });

        it('should handle empty buffer', async () => {
            // Arrange
            const buffer = Buffer.alloc(0);
            const fileName = 'empty-file.jpg';
            const expectedUrl = `/uploads/${fileName}`;

            mockWriteFile.mockImplementation((path, data, callback) => {
                if (typeof callback === 'function') {
                    callback(null);
                }
            });

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(mockWriteFile).toHaveBeenCalledWith(
                expect.any(String),
                buffer,
                expect.any(Function),
            );
            expect(result).toBe(expectedUrl);
        });

        it('should handle special characters in filename', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test file with spaces & special-chars.jpg';
            const expectedUrl = `/uploads/${fileName}`;

            mockWriteFile.mockImplementation((path, data, callback) => {
                if (typeof callback === 'function') {
                    callback(null);
                }
            });

            // Act
            const result = await service.upload(buffer, fileName);

            // Assert
            expect(result).toBe(expectedUrl);
            expect(mockWriteFile).toHaveBeenCalled();
        });

        it('should construct correct file path', async () => {
            // Arrange
            const buffer = Buffer.from('test content');
            const fileName = 'test-image.png';

            mockWriteFile.mockImplementation((path, data, callback) => {
                if (typeof callback === 'function') {
                    callback(null);
                }
            });

            // Act
            await service.upload(buffer, fileName);

            // Assert
            expect(mockJoin).toHaveBeenCalledWith(expect.any(String), fileName);
        });

        it('should handle very large files', async () => {
            // Arrange
            const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
            const fileName = 'large-file.jpg';
            const expectedUrl = `/uploads/${fileName}`;

            mockWriteFile.mockImplementation((path, data, callback) => {
                if (typeof callback === 'function') {
                    callback(null);
                }
            });

            // Act
            const result = await service.upload(largeBuffer, fileName);

            // Assert
            expect(mockWriteFile).toHaveBeenCalledWith(
                expect.any(String),
                largeBuffer,
                expect.any(Function),
            );
            expect(result).toBe(expectedUrl);
        });

        it('should handle concurrent uploads', async () => {
            // Arrange
            const buffer1 = Buffer.from('file 1 content');
            const buffer2 = Buffer.from('file 2 content');
            const fileName1 = 'file1.jpg';
            const fileName2 = 'file2.jpg';

            mockWriteFile.mockImplementation((path, data, callback) => {
                if (typeof callback === 'function') setTimeout(() => callback(null), 10);
            });

            // Act
            const [result1, result2] = await Promise.all([
                service.upload(buffer1, fileName1),
                service.upload(buffer2, fileName2),
            ]);

            // Assert
            expect(result1).toBe(`/uploads/${fileName1}`);
            expect(result2).toBe(`/uploads/${fileName2}`);
            expect(mockWriteFile).toHaveBeenCalledTimes(2);
        });
    });
});

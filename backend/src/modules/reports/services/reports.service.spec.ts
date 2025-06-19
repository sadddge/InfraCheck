import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Readable } from 'node:stream';
import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportChangeType } from 'src/common/enums/report-change-type.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { ReportChange } from 'src/database/entities/report-change.entity';
import { ReportImage } from 'src/database/entities/report-image.entity';
import { Report } from 'src/database/entities/report.entity';
import { User } from 'src/database/entities/user.entity';
import {
    IUploadService,
    UPLOAD_SERVICE,
} from 'src/modules/upload/interfaces/upload-service.interface';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let reportRepository: jest.Mocked<Repository<Report>>;
    let uploadService: jest.Mocked<IUploadService>;

    // Mock data
    const mockUser: User = {
        id: 1,
        name: 'Test User',
        lastName: 'Test Last',
        phoneNumber: '+1234567890',
        password: 'hashedPassword',
        role: Role.NEIGHBOR,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        passwordUpdatedAt: null,
        refreshTokens: [],
        reports: [],
        comments: [],
        votes: [],
        reportChanges: [],
        messages: [],
        reportsFollowed: [],
    };

    const mockReportImage: ReportImage = {
        id: 1,
        imageUrl: 'https://example.com/image1.jpg',
        takenAt: new Date('2024-01-01T10:00:00Z'),
        latitude: -33.4489,
        longitude: -70.6693,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        report: {} as Report,
    };

    const mockReport: Report = {
        id: 1,
        title: 'Test Report',
        description: 'Test description',
        category: ReportCategory.INFRASTRUCTURE,
        state: ReportState.PENDING,
        isVisible: true,
        latitude: -33.4489,
        longitude: -70.6693,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        creator: mockUser,
        images: [mockReportImage],
        changes: [],
        comments: [],
        votes: [],
        followers: [],
    };

    const mockReportChange: ReportChange = {
        id: 1,
        changeType: ReportChangeType.STATE,
        from: ReportState.PENDING,
        to: ReportState.IN_PROGRESS,
        createdAt: new Date('2024-01-02T10:00:00Z'),
        creator: mockUser,
        report: mockReport,
    };

    const mockCreateReportDto: CreateReportDto = {
        title: 'New Report',
        description: 'New report description',
        category: ReportCategory.INFRASTRUCTURE,
        images: [
            {
                takenAt: '2024-01-01T10:00:00Z',
                latitude: -33.4489,
                longitude: -70.6693,
            },
            {
                takenAt: '2024-01-01T10:05:00Z',
                latitude: -33.449,
                longitude: -70.6694,
            },
        ],
    };

    const mockFiles: Express.Multer.File[] = [
        {
            fieldname: 'images',
            originalname: 'image1.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('fake-image-data'),
            destination: '',
            filename: '',
            path: '',
            stream: new Readable(),
        },
        {
            fieldname: 'images',
            originalname: 'image2.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 2048,
            buffer: Buffer.from('fake-image-data-2'),
            destination: '',
            filename: '',
            path: '',
            stream: new Readable(),
        },
    ];

    beforeEach(async () => {
        const mockReportRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockUploadService = {
            uploadFile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getRepositoryToken(Report),
                    useValue: mockReportRepository,
                },
                {
                    provide: UPLOAD_SERVICE,
                    useValue: mockUploadService,
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        reportRepository = module.get(getRepositoryToken(Report));
        uploadService = module.get(UPLOAD_SERVICE);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all reports with mapped DTOs', async () => {
            // Arrange
            const reports = [mockReport];
            reportRepository.find.mockResolvedValue(reports);

            // Act
            const result = await service.findAll();

            // Assert
            expect(reportRepository.find).toHaveBeenCalledWith({
                relations: ['creator', 'images'],
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: mockReport.id,
                title: mockReport.title,
                description: mockReport.description,
                category: mockReport.category,
                state: mockReport.state,
                isVisible: mockReport.isVisible,
                latitude: mockReport.latitude,
                longitude: mockReport.longitude,
                createdAt: mockReport.createdAt,
                creatorId: mockReport.creator.id,
                images: [
                    {
                        takenAt: mockReportImage.takenAt,
                        latitude: mockReportImage.latitude,
                        longitude: mockReportImage.longitude,
                        url: mockReportImage.imageUrl,
                    },
                ],
            });
        });

        it('should return empty array when no reports exist', async () => {
            // Arrange
            reportRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return a report by ID', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(mockReport);

            // Act
            const result = await service.findById(1);

            // Assert
            expect(reportRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
                relations: ['creator', 'images'],
            });

            expect(result).toEqual({
                id: mockReport.id,
                title: mockReport.title,
                description: mockReport.description,
                category: mockReport.category,
                state: mockReport.state,
                isVisible: mockReport.isVisible,
                latitude: mockReport.latitude,
                longitude: mockReport.longitude,
                createdAt: mockReport.createdAt,
                creatorId: mockReport.creator.id,
                images: [
                    {
                        takenAt: mockReportImage.takenAt,
                        latitude: mockReportImage.latitude,
                        longitude: mockReportImage.longitude,
                        url: mockReportImage.imageUrl,
                    },
                ],
            });
        });

        it('should throw NotFoundException when report not found', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(999)).rejects.toThrow(
                new NotFoundException('Report with ID 999 not found'),
            );
        });
    });

    describe('findHistoryByReportId', () => {
        it('should return report change history', async () => {
            // Arrange
            const reportWithChanges = {
                ...mockReport,
                changes: [mockReportChange],
            };
            reportRepository.findOne.mockResolvedValue(reportWithChanges);

            // Act
            const result = await service.findHistoryByReportId(1);

            // Assert
            expect(reportRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
                relations: ['changes', 'changes.creator'],
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                creatorId: mockReportChange.creator.id,
                changeType: mockReportChange.changeType,
                from: mockReportChange.from,
                to: mockReportChange.to,
                createdAt: mockReportChange.createdAt,
            });
        });

        it('should throw NotFoundException when report not found for history', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findHistoryByReportId(999)).rejects.toThrow(
                new NotFoundException('Report with ID 999 not found'),
            );
        });

        it('should return empty array when report has no changes', async () => {
            // Arrange
            const reportWithoutChanges = {
                ...mockReport,
                changes: [],
            };
            reportRepository.findOne.mockResolvedValue(reportWithoutChanges);

            // Act
            const result = await service.findHistoryByReportId(1);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('createReport', () => {
        it('should create a report with images and upload files', async () => {
            // Arrange
            const uploadedUrls = [
                'https://s3.amazonaws.com/bucket/image1.jpg',
                'https://s3.amazonaws.com/bucket/image2.jpg',
            ];

            uploadService.uploadFile
                .mockResolvedValueOnce(uploadedUrls[0])
                .mockResolvedValueOnce(uploadedUrls[1]);

            const createdReport = {
                ...mockReport,
                id: 2,
                title: mockCreateReportDto.title,
                description: mockCreateReportDto.description,
                category: mockCreateReportDto.category,
                latitude: -33.44895, // Average of latitudes
                longitude: -70.66935, // Average of longitudes
                images: [
                    {
                        imageUrl: uploadedUrls[0],
                        takenAt: new Date(mockCreateReportDto.images[0].takenAt),
                        latitude: mockCreateReportDto.images[0].latitude,
                        longitude: mockCreateReportDto.images[0].longitude,
                    },
                    {
                        imageUrl: uploadedUrls[1],
                        takenAt: new Date(mockCreateReportDto.images[1].takenAt),
                        latitude: mockCreateReportDto.images[1].latitude,
                        longitude: mockCreateReportDto.images[1].longitude,
                    },
                ],
            };

            reportRepository.create.mockReturnValue(createdReport as Report);
            reportRepository.save.mockResolvedValue(createdReport as Report);

            // Act
            const result = await service.createReport(mockCreateReportDto, mockFiles, 1);

            // Assert
            expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockFiles[0]);
            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockFiles[1]);

            expect(reportRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: mockCreateReportDto.title,
                    description: mockCreateReportDto.description,
                    category: mockCreateReportDto.category,
                    images: [
                        {
                            imageUrl: uploadedUrls[0],
                            takenAt: new Date(mockCreateReportDto.images[0].takenAt),
                            latitude: mockCreateReportDto.images[0].latitude,
                            longitude: mockCreateReportDto.images[0].longitude,
                        },
                        {
                            imageUrl: uploadedUrls[1],
                            takenAt: new Date(mockCreateReportDto.images[1].takenAt),
                            latitude: mockCreateReportDto.images[1].latitude,
                            longitude: mockCreateReportDto.images[1].longitude,
                        },
                    ],
                    creator: { id: 1 },
                }),
            );

            // Check latitude and longitude separately with precision tolerance
            const createCall = reportRepository.create.mock.calls[0][0];
            expect(createCall.latitude).toBeCloseTo(-33.44895, 4);
            expect(createCall.longitude).toBeCloseTo(-70.66935, 4);

            expect(reportRepository.save).toHaveBeenCalledWith(createdReport);

            expect(result).toEqual({
                id: createdReport.id,
                title: createdReport.title,
                description: createdReport.description,
                category: createdReport.category,
                state: createdReport.state,
                isVisible: createdReport.isVisible,
                latitude: createdReport.latitude,
                longitude: createdReport.longitude,
                createdAt: createdReport.createdAt,
                creatorId: 1,
                images: createdReport.images.map(img => ({
                    takenAt: img.takenAt,
                    latitude: img.latitude,
                    longitude: img.longitude,
                    url: img.imageUrl,
                })),
            });
        });

        it('should handle upload service errors gracefully', async () => {
            // Arrange
            uploadService.uploadFile.mockRejectedValue(new Error('Upload failed'));

            // Act & Assert
            await expect(service.createReport(mockCreateReportDto, mockFiles, 1)).rejects.toThrow(
                'Upload failed',
            );

            expect(uploadService.uploadFile).toHaveBeenCalledWith(mockFiles[0]);
            expect(reportRepository.create).not.toHaveBeenCalled();
            expect(reportRepository.save).not.toHaveBeenCalled();
        });

        it('should calculate correct average coordinates', async () => {
            // Arrange
            const dtoWithMultipleImages: CreateReportDto = {
                ...mockCreateReportDto,
                images: [
                    { takenAt: '2024-01-01T10:00:00Z', latitude: 10.0, longitude: 20.0 },
                    { takenAt: '2024-01-01T10:05:00Z', latitude: 30.0, longitude: 40.0 },
                    { takenAt: '2024-01-01T10:10:00Z', latitude: 50.0, longitude: 60.0 },
                ],
            };

            const filesForMultiple = [mockFiles[0], mockFiles[1], mockFiles[0]];

            uploadService.uploadFile.mockResolvedValue('https://example.com/image.jpg');

            const expectedLat = (10.0 + 30.0 + 50.0) / 3; // 30.0
            const expectedLon = (20.0 + 40.0 + 60.0) / 3; // 40.0

            reportRepository.create.mockReturnValue({} as Report);
            reportRepository.save.mockResolvedValue({
                id: 1,
                images: [],
                createdAt: new Date(),
            } as Partial<Report> as Report);

            // Act
            await service.createReport(dtoWithMultipleImages, filesForMultiple, 1);

            // Assert
            expect(reportRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    latitude: expectedLat,
                    longitude: expectedLon,
                }),
            );
        });
    });

    describe('updateState', () => {
        it('should update report state', async () => {
            // Arrange
            const updatedReport = { ...mockReport, state: ReportState.IN_PROGRESS };
            reportRepository.findOne.mockResolvedValue(mockReport);
            reportRepository.save.mockResolvedValue(updatedReport);

            // Mock findById call that happens after update
            const findByIdSpy = jest.spyOn(service, 'findById').mockResolvedValue({
                id: updatedReport.id,
                title: updatedReport.title,
                description: updatedReport.description,
                category: updatedReport.category,
                state: updatedReport.state,
                isVisible: updatedReport.isVisible,
                latitude: updatedReport.latitude,
                longitude: updatedReport.longitude,
                createdAt: updatedReport.createdAt,
                creatorId: updatedReport.creator.id,
                images: [],
            });

            // Act
            const result = await service.updateState(1, ReportState.IN_PROGRESS);

            // Assert
            expect(reportRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
                relations: ['creator', 'images'],
            });

            expect(reportRepository.save).toHaveBeenCalledWith({
                ...mockReport,
                state: ReportState.IN_PROGRESS,
            });

            expect(findByIdSpy).toHaveBeenCalledWith(updatedReport.id);
            expect(result.state).toBe(ReportState.IN_PROGRESS);
        });

        it('should throw NotFoundException when updating non-existent report', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.updateState(999, ReportState.IN_PROGRESS)).rejects.toThrow(
                new NotFoundException('Report with ID 999 not found'),
            );

            expect(reportRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getAverage (private method)', () => {
        it('should calculate correct average through createReport', async () => {
            // Arrange
            const dtoWithKnownValues: CreateReportDto = {
                ...mockCreateReportDto,
                images: [
                    { takenAt: '2024-01-01T10:00:00Z', latitude: 0, longitude: 0 },
                    { takenAt: '2024-01-01T10:05:00Z', latitude: 10, longitude: 20 },
                ],
            };

            uploadService.uploadFile.mockResolvedValue('https://example.com/image.jpg');
            reportRepository.create.mockReturnValue({} as Report);
            reportRepository.save.mockResolvedValue({
                id: 1,
                images: [],
                createdAt: new Date(),
            } as Partial<Report> as Report);

            // Act
            await service.createReport(dtoWithKnownValues, [mockFiles[0], mockFiles[1]], 1);

            // Assert
            expect(reportRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    latitude: 5, // (0 + 10) / 2
                    longitude: 10, // (0 + 20) / 2
                }),
            );
        });
    });

    describe('error handling', () => {
        it('should handle database errors in findAll', async () => {
            // Arrange
            reportRepository.find.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(service.findAll()).rejects.toThrow('Database error');
        });

        it('should handle database errors in save operation', async () => {
            // Arrange
            uploadService.uploadFile.mockResolvedValue('https://example.com/image.jpg');
            reportRepository.create.mockReturnValue({} as Report);
            reportRepository.save.mockRejectedValue(new Error('Save failed'));

            // Act & Assert
            await expect(service.createReport(mockCreateReportDto, mockFiles, 1)).rejects.toThrow(
                'Save failed',
            );
        });
    });
});

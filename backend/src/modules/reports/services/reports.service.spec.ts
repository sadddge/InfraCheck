import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '../../../common/exceptions/app.exception';

import { ReportState } from 'src/common/enums/report-state.enums';
import { ReportChange } from 'src/database/entities/report-change.entity';
import { Report } from 'src/database/entities/report.entity';
import {
    IUploadService,
    UPLOAD_SERVICE,
} from 'src/modules/upload/interfaces/upload-service.interface';
import {
    DEFAULT_PAGINATION_DTO,
    TEST_COORDINATES,
    TEST_DATES,
    TEST_IDS,
    TEST_REPORT_DATA,
    createMockFiles,
    createMockPaginationResponse,
    createMockReport,
    createMockReportChange,
    createMockReportImage,
    createMockRepository,
    createMockUploadService,
    mockPaginate,
} from '../../../common/test-helpers';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let reportRepository: jest.Mocked<Repository<Report>>;
    let changeRepository: jest.Mocked<Repository<ReportChange>>;
    let uploadService: jest.Mocked<IUploadService>;

    // Mock data using test fixtures
    const mockReportImage = createMockReportImage();
    const mockReport = createMockReport({ images: [mockReportImage] });
    const mockReportChange = createMockReportChange();

    const mockCreateReportDto: CreateReportDto = {
        title: TEST_REPORT_DATA.TITLE,
        description: TEST_REPORT_DATA.DESCRIPTION,
        category: TEST_REPORT_DATA.CATEGORY,
        images: [
            {
                takenAt: TEST_DATES.CREATED_AT.toISOString(),
                latitude: TEST_COORDINATES.LATITUDE,
                longitude: TEST_COORDINATES.LONGITUDE,
            },
            {
                takenAt: TEST_DATES.UPDATED_AT.toISOString(),
                latitude: TEST_COORDINATES.LATITUDE + 0.001,
                longitude: TEST_COORDINATES.LONGITUDE + 0.001,
            },
        ],
    };

    const mockFiles = createMockFiles(2);
    beforeEach(async () => {
        const mockReportRepository = createMockRepository<Repository<Report>>();
        const mockChangeRepository = createMockRepository<Repository<ReportChange>>();
        const mockUploadService = createMockUploadService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getRepositoryToken(Report),
                    useValue: mockReportRepository,
                },
                {
                    provide: getRepositoryToken(ReportChange),
                    useValue: mockChangeRepository,
                },
                {
                    provide: UPLOAD_SERVICE,
                    useValue: mockUploadService,
                },
            ],
        }).compile();
        service = module.get<ReportsService>(ReportsService);
        reportRepository = module.get(getRepositoryToken(Report));
        changeRepository = module.get(getRepositoryToken(ReportChange));
        uploadService = module.get(UPLOAD_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('findAll', () => {
        it('should return all reports with mapped DTOs', async () => {
            // Arrange
            const reports = [mockReport];
            const mockPaginatedResponse = createMockPaginationResponse(reports);

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAll(DEFAULT_PAGINATION_DTO);

            // Assert
            expect(mockPaginate).toHaveBeenCalledWith(reportRepository, DEFAULT_PAGINATION_DTO, {
                relations: ['creator', 'images'],
                order: { createdAt: 'DESC' },
            });

            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toEqual({
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
            const mockPaginatedResponse = createMockPaginationResponse([]);

            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findAll(DEFAULT_PAGINATION_DTO);

            // Assert
            expect(result.items).toEqual([]);
        });
    });
    describe('findById', () => {
        it('should return a report by ID', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(mockReport);

            // Act
            const result = await service.findById(TEST_IDS.USER_ID);

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

        it('should throw AppException when report not found', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(999)).rejects.toThrow(AppException);
        });
    });
    describe('findHistoryByReportId', () => {
        it('should return report change history', async () => {
            // Arrange
            const options = { page: 1, limit: 10 };

            // Mock para verificar que el reporte existe
            reportRepository.findOne.mockResolvedValue(mockReport);
            // Mock para el query builder
            const mockQueryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                innerJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
            };
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            changeRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as any);

            // Mock para paginate del query builder
            const mockPaginatedResponse = {
                items: [mockReportChange],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/changes?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/changes?page=1',
                },
            };
            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findHistoryByReportId(1, options);

            // Assert
            expect(reportRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
            });

            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toEqual({
                id: mockReportChange.id,
                changeType: mockReportChange.changeType,
                from: mockReportChange.from,
                to: mockReportChange.to,
                createdAt: mockReportChange.createdAt,
                creatorId: mockReportChange.creator.id,
            });
        });
        it('should throw AppException when report not found for history', async () => {
            // Arrange
            const options = { page: 1, limit: 10 };
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findHistoryByReportId(999, options)).rejects.toThrow(AppException);
        });

        it('should return empty array when report has no changes', async () => {
            // Arrange
            const options = { page: 1, limit: 10 };
            reportRepository.findOne.mockResolvedValue(mockReport);
            const mockQueryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                innerJoinAndSelect: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
            };
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            changeRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as any);

            const mockPaginatedResponse = {
                items: [],
                meta: {
                    totalItems: 0,
                    itemCount: 0,
                    itemsPerPage: 10,
                    totalPages: 0,
                    currentPage: 1,
                },
                links: {
                    first: '',
                    previous: '',
                    next: '',
                    last: '',
                },
            };
            mockPaginate.mockResolvedValue(mockPaginatedResponse);

            // Act
            const result = await service.findHistoryByReportId(1, options);

            // Assert
            expect(result.items).toEqual([]);
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
                latitude: -33.4484, // Average of latitudes
                longitude: -70.6688, // Average of longitudes
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
            ); // Check latitude and longitude separately with precision tolerance
            const createCall = reportRepository.create.mock.calls[0][0];
            expect(createCall.latitude).toBeCloseTo(-33.4484, 4);
            expect(createCall.longitude).toBeCloseTo(-70.6688, 4);

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

            // Mock para el cambio
            changeRepository.create.mockReturnValue(mockReportChange);
            changeRepository.save.mockResolvedValue(mockReportChange);

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
            const result = await service.updateState(1, 1, ReportState.IN_PROGRESS);

            // Assert
            expect(reportRepository.findOne).toHaveBeenCalledWith({
                where: { id: expect.any(Object) },
                relations: ['creator', 'images'],
            });

            expect(reportRepository.save).toHaveBeenCalledWith({
                ...mockReport,
                state: ReportState.IN_PROGRESS,
            });

            expect(changeRepository.create).toHaveBeenCalled();
            expect(changeRepository.save).toHaveBeenCalled();

            expect(findByIdSpy).toHaveBeenCalledWith(updatedReport.id);
            expect(result.state).toBe(ReportState.IN_PROGRESS);
        });

        it('should throw AppException when updating non-existent report', async () => {
            // Arrange
            reportRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.updateState(999, 1, ReportState.IN_PROGRESS)).rejects.toThrow(
                AppException,
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
            const options = { page: 1, limit: 10 };
            mockPaginate.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(service.findAll(options)).rejects.toThrow('Database error');
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

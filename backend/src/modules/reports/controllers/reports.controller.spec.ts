import { Test, TestingModule } from '@nestjs/testing';
import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { AppException } from '../../../common/exceptions/app.exception';
import {
    DEFAULT_PAGINATION_DTO,
    TEST_COORDINATES,
    TEST_REPORT_DATA,
    createMockFiles,
    createMockReportDto,
    createMockReportHistory,
    createMockReportsService,
    createReportMetadataString,
    mockClassTransformer,
    mockClassValidator,
} from '../../../common/test-helpers';
import { CreateReportDto } from '../dto/create-report.dto';
import { IReportsService, REPORTS_SERVICE } from '../interfaces/reports-service.interface';
import { ReportsController } from './reports.controller';

// Mock class-transformer and class-validator
jest.mock('class-transformer', () => mockClassTransformer);

jest.mock('class-validator', () => mockClassValidator);

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ReportsController', () => {
    let controller: ReportsController;
    let reportsService: jest.Mocked<IReportsService>;

    // Use centralized mock service factory
    const mockReportsService = createMockReportsService();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [{ provide: REPORTS_SERVICE, useValue: mockReportsService }],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);
        reportsService = module.get(REPORTS_SERVICE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getReportCategories', () => {
        it('should return all report categories', () => {
            const result = controller.getReportCategories();

            expect(result).toEqual(Object.values(ReportCategory));
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('getAllReports', () => {
        it('should call reportsService.findAll and return reports', async () => {
            // Use factory functions for mock data
            const mockReports = [
                createMockReportDto({
                    id: 1,
                    title: `${TEST_REPORT_DATA.TITLE} 1`,
                    description: 'Description 1',
                    category: ReportCategory.INFRASTRUCTURE,
                    state: ReportState.PENDING,
                    creatorId: 1,
                }),
                createMockReportDto({
                    id: 2,
                    title: `${TEST_REPORT_DATA.TITLE} 2`,
                    description: 'Description 2',
                    category: ReportCategory.SECURITY,
                    state: ReportState.IN_PROGRESS,
                    creatorId: 2,
                }),
            ];

            const mockPaginatedResponse = {
                items: mockReports,
                meta: {
                    totalItems: 2,
                    itemCount: 2,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
                links: {
                    first: 'http://localhost:3000/reports?page=1',
                    previous: '',
                    next: '',
                    last: 'http://localhost:3000/reports?page=1',
                },
            };

            reportsService.findAll.mockResolvedValue(mockPaginatedResponse);

            const paginationDto = DEFAULT_PAGINATION_DTO;
            const result = await controller.getAllReports(paginationDto);

            expect(reportsService.findAll).toHaveBeenCalledWith(paginationDto);
            expect(result).toEqual(mockPaginatedResponse);
        });
        it('should propagate errors from reportsService.findAll', async () => {
            const error = new Error('Database connection failed');
            const paginationDto = { page: 1, limit: 10 };
            mockReportsService.findAll.mockRejectedValue(error);

            await expect(controller.getAllReports(paginationDto)).rejects.toThrow(
                'Database connection failed',
            );
            expect(reportsService.findAll).toHaveBeenCalledWith(paginationDto);
        });
    });
    describe('getReportById', () => {
        it('should call reportsService.findById with correct id and return report', async () => {
            const reportId = '123';
            const mockReport = createMockReportDto({
                id: 123,
                creatorId: 1,
            });

            mockReportsService.findById.mockResolvedValue(mockReport);

            const result = await controller.getReportById(reportId);

            expect(reportsService.findById).toHaveBeenCalledWith(123);
            expect(result).toEqual(mockReport);
        });

        it('should propagate errors from reportsService.findById', async () => {
            const reportId = '999';
            const error = new Error('Report not found');
            mockReportsService.findById.mockRejectedValue(error);

            await expect(controller.getReportById(reportId)).rejects.toThrow('Report not found');
            expect(reportsService.findById).toHaveBeenCalledWith(999);
        });
    });
    describe('createReport', () => {
        const mockFiles = createMockFiles(2);
        const rawMetadata = createReportMetadataString(2);

        const mockRequest = { user: { id: 5 } };
        beforeEach(() => {
            (plainToInstance as jest.Mock).mockReturnValue({
                title: TEST_REPORT_DATA.TITLE,
                description: TEST_REPORT_DATA.DESCRIPTION,
                category: TEST_REPORT_DATA.CATEGORY,
                latitude: TEST_COORDINATES.LATITUDE,
                longitude: TEST_COORDINATES.LONGITUDE,
                images: [
                    {
                        takenAt: new Date(),
                        latitude: TEST_COORDINATES.LATITUDE,
                        longitude: TEST_COORDINATES.LONGITUDE,
                    },
                    {
                        takenAt: new Date(),
                        latitude: TEST_COORDINATES.LATITUDE,
                        longitude: TEST_COORDINATES.LONGITUDE,
                    },
                ],
            });
            (validate as jest.Mock).mockResolvedValue([]);
        });
        it('should create report successfully with valid data', async () => {
            const expectedReport = createMockReportDto({
                id: 1,
                creatorId: 5,
            });

            mockReportsService.createReport.mockResolvedValue(expectedReport);

            const result = await controller.createReport(mockFiles, rawMetadata, mockRequest);

            expect(plainToInstance).toHaveBeenCalledWith(CreateReportDto, JSON.parse(rawMetadata));
            expect(validate).toHaveBeenCalled();
            expect(reportsService.createReport).toHaveBeenCalledWith(
                expect.any(Object),
                mockFiles,
                5,
            );
            expect(result).toEqual(expectedReport);
        });

        it('should throw AppException when no files are uploaded', async () => {
            await expect(controller.createReport([], rawMetadata, mockRequest)).rejects.toThrow(
                AppException,
            );

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should throw AppException when no metadata is provided', async () => {
            await expect(controller.createReport(mockFiles, '', mockRequest)).rejects.toThrow(
                AppException,
            );

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should throw AppException when metadata validation fails', async () => {
            (validate as jest.Mock).mockResolvedValue([
                { property: 'title', errors: ['Title is required'] },
            ]);

            await expect(
                controller.createReport(mockFiles, rawMetadata, mockRequest),
            ).rejects.toThrow(AppException);

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });
        it('should throw AppException when file count does not match metadata', async () => {
            const metadataWithOneImage = createReportMetadataString(1);

            (plainToInstance as jest.Mock).mockReturnValue({
                images: [
                    {
                        takenAt: new Date(),
                        latitude: TEST_COORDINATES.LATITUDE,
                        longitude: TEST_COORDINATES.LONGITUDE,
                    },
                ],
            });

            await expect(
                controller.createReport(mockFiles, metadataWithOneImage, mockRequest),
            ).rejects.toThrow(AppException);

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should propagate errors from reportsService.createReport', async () => {
            const error = new Error('File upload failed');
            mockReportsService.createReport.mockRejectedValue(error);

            await expect(
                controller.createReport(mockFiles, rawMetadata, mockRequest),
            ).rejects.toThrow('File upload failed');

            expect(reportsService.createReport).toHaveBeenCalled();
        });
    });
    describe('getReportHistory', () => {
        it('should call reportsService.findHistoryByReportId with correct id and return history', async () => {
            const reportId = '123';
            const mockHistory = createMockReportHistory();
            mockReportsService.findHistoryByReportId.mockResolvedValue(mockHistory);

            const paginationDto = { page: 1, limit: 10 };
            const result = await controller.getReportHistory(reportId, paginationDto);

            expect(reportsService.findHistoryByReportId).toHaveBeenCalledWith(123, paginationDto);
            expect(result).toEqual(mockHistory);
        });
        it('should propagate errors from reportsService.findHistoryByReportId', async () => {
            const reportId = '999';
            const paginationDto = { page: 1, limit: 10 };
            const error = new Error('Report not found');
            mockReportsService.findHistoryByReportId.mockRejectedValue(error);

            await expect(controller.getReportHistory(reportId, paginationDto)).rejects.toThrow(
                'Report not found',
            );
            expect(reportsService.findHistoryByReportId).toHaveBeenCalledWith(999, paginationDto);
        });
    });

    describe('updateReportState', () => {
        it('should call reportsService.updateState with correct parameters and return updated report', async () => {
            const reportId = '123';
            const newState = ReportState.RESOLVED;
            const mockUpdatedReport = createMockReportDto({
                id: 123,
                state: ReportState.RESOLVED,
                creatorId: 1,
            });
            mockReportsService.updateState.mockResolvedValue(mockUpdatedReport);

            const mockRequest = { user: { id: 1 } };
            const result = await controller.updateReportState(reportId, newState, mockRequest);

            expect(reportsService.updateState).toHaveBeenCalledWith(123, 1, newState);
            expect(result).toEqual(mockUpdatedReport);
        });
        it('should propagate errors from reportsService.updateState', async () => {
            const reportId = '999';
            const newState = ReportState.RESOLVED;
            const mockRequest = { user: { id: 1 } };
            const error = new Error('Report not found');
            mockReportsService.updateState.mockRejectedValue(error);

            await expect(
                controller.updateReportState(reportId, newState, mockRequest),
            ).rejects.toThrow('Report not found');
            expect(reportsService.updateState).toHaveBeenCalledWith(999, 1, newState);
        });
    });
});

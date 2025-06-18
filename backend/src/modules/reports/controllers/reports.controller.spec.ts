import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { CreateReportDto } from '../dto/create-report.dto';
import { IReportsService, REPORTS_SERVICE } from '../interfaces/reports-service.interface';
import { ReportsController } from './reports.controller';

// Mock class-transformer and class-validator
jest.mock('class-transformer', () => ({
    plainToInstance: jest.fn(),
    Type: () => () => {},
}));

jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsDateString: () => () => {},
    IsString: () => () => {},
    IsNumber: () => () => {},
    IsEnum: () => () => {},
    IsArray: () => () => {},
    ValidateNested: () => () => {},
}));

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ReportsController', () => {
    let controller: ReportsController;
    let reportsService: jest.Mocked<IReportsService>;

    const mockReportsService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        findHistoryByReportId: jest.fn(),
        createReport: jest.fn(),
        updateState: jest.fn(),
    };

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
            const mockReports = [
                {
                    id: 1,
                    title: 'Test Report 1',
                    description: 'Description 1',
                    category: ReportCategory.INFRASTRUCTURE,
                    state: ReportState.PENDING,
                    isVisible: true,
                    latitude: -33.4489,
                    longitude: -70.6693,
                    createdAt: new Date(),
                    creatorId: 1,
                    images: [],
                },
                {
                    id: 2,
                    title: 'Test Report 2',
                    description: 'Description 2',
                    category: ReportCategory.SECURITY,
                    state: ReportState.IN_PROGRESS,
                    isVisible: true,
                    latitude: -33.4489,
                    longitude: -70.6693,
                    createdAt: new Date(),
                    creatorId: 2,
                    images: [],
                },
            ];

            mockReportsService.findAll.mockResolvedValue(mockReports);

            const result = await controller.getAllReports();

            expect(reportsService.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockReports);
        });

        it('should propagate errors from reportsService.findAll', async () => {
            const error = new Error('Database connection failed');
            mockReportsService.findAll.mockRejectedValue(error);

            await expect(controller.getAllReports()).rejects.toThrow('Database connection failed');
            expect(reportsService.findAll).toHaveBeenCalled();
        });
    });

    describe('getReportById', () => {
        it('should call reportsService.findById with correct id and return report', async () => {
            const reportId = '123';
            const mockReport = {
                id: 123,
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.INFRASTRUCTURE,
                state: ReportState.PENDING,
                isVisible: true,
                latitude: -33.4489,
                longitude: -70.6693,
                createdAt: new Date(),
                creatorId: 1,
                images: [],
            };

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
        const mockFiles = [
            {
                fieldname: 'images',
                originalname: 'test1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('fake-image-data'),
                size: 1024,
            },
            {
                fieldname: 'images',
                originalname: 'test2.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('fake-image-data-2'),
                size: 2048,
            },
        ] as Express.Multer.File[];

        const rawMetadata = JSON.stringify({
            title: 'Test Report',
            description: 'Test Description',
            category: ReportCategory.INFRASTRUCTURE,
            latitude: -33.4489,
            longitude: -70.6693,
            images: [
                { takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 },
                { takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 },
            ],
        });

        const mockRequest = { user: { id: 5 } };

        beforeEach(() => {
            (plainToInstance as jest.Mock).mockReturnValue({
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.INFRASTRUCTURE,
                latitude: -33.4489,
                longitude: -70.6693,
                images: [
                    { takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 },
                    { takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 },
                ],
            });
            (validate as jest.Mock).mockResolvedValue([]);
        });

        it('should create report successfully with valid data', async () => {
            const expectedReport = {
                id: 1,
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.INFRASTRUCTURE,
                state: ReportState.PENDING,
                isVisible: true,
                latitude: -33.4489,
                longitude: -70.6693,
                createdAt: new Date(),
                creatorId: 5,
                images: [],
            };

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

        it('should throw BadRequestException when no files are uploaded', async () => {
            await expect(controller.createReport([], rawMetadata, mockRequest)).rejects.toThrow(
                new BadRequestException('No files uploaded'),
            );

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when no metadata is provided', async () => {
            await expect(controller.createReport(mockFiles, '', mockRequest)).rejects.toThrow(
                new BadRequestException('No metadata provided'),
            );

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when metadata validation fails', async () => {
            (validate as jest.Mock).mockResolvedValue([
                { property: 'title', errors: ['Title is required'] },
            ]);

            await expect(
                controller.createReport(mockFiles, rawMetadata, mockRequest),
            ).rejects.toThrow(new BadRequestException('Invalid metadata'));

            expect(reportsService.createReport).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when file count does not match metadata', async () => {
            const metadataWithOneImage = JSON.stringify({
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.INFRASTRUCTURE,
                latitude: -33.4489,
                longitude: -70.6693,
                images: [{ takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 }],
            });

            (plainToInstance as jest.Mock).mockReturnValue({
                images: [{ takenAt: new Date(), latitude: -33.4489, longitude: -70.6693 }],
            });

            await expect(
                controller.createReport(mockFiles, metadataWithOneImage, mockRequest),
            ).rejects.toThrow(
                new BadRequestException('Number of uploaded files does not match metadata'),
            );

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
            const mockHistory = [
                {
                    id: 1,
                    reportId: 123,
                    changeType: 'STATE_CHANGE',
                    fromValue: ReportState.PENDING,
                    toValue: ReportState.IN_PROGRESS,
                    changeDate: new Date(),
                    userId: 1,
                },
                {
                    id: 2,
                    reportId: 123,
                    changeType: 'STATE_CHANGE',
                    fromValue: ReportState.IN_PROGRESS,
                    toValue: ReportState.RESOLVED,
                    changeDate: new Date(),
                    userId: 2,
                },
            ];

            mockReportsService.findHistoryByReportId.mockResolvedValue(mockHistory);

            const result = await controller.getReportHistory(reportId);

            expect(reportsService.findHistoryByReportId).toHaveBeenCalledWith(123);
            expect(result).toEqual(mockHistory);
        });

        it('should propagate errors from reportsService.findHistoryByReportId', async () => {
            const reportId = '999';
            const error = new Error('Report not found');
            mockReportsService.findHistoryByReportId.mockRejectedValue(error);

            await expect(controller.getReportHistory(reportId)).rejects.toThrow('Report not found');
            expect(reportsService.findHistoryByReportId).toHaveBeenCalledWith(999);
        });
    });

    describe('updateReportState', () => {
        it('should call reportsService.updateState with correct parameters and return updated report', async () => {
            const reportId = '123';
            const newState = ReportState.RESOLVED;
            const mockUpdatedReport = {
                id: 123,
                title: 'Test Report',
                description: 'Test Description',
                category: ReportCategory.INFRASTRUCTURE,
                state: ReportState.RESOLVED,
                isVisible: true,
                latitude: -33.4489,
                longitude: -70.6693,
                createdAt: new Date(),
                creatorId: 1,
                images: [],
            };

            mockReportsService.updateState.mockResolvedValue(mockUpdatedReport);

            const result = await controller.updateReportState(reportId, newState);

            expect(reportsService.updateState).toHaveBeenCalledWith(123, newState);
            expect(result).toEqual(mockUpdatedReport);
        });

        it('should propagate errors from reportsService.updateState', async () => {
            const reportId = '999';
            const newState = ReportState.RESOLVED;
            const error = new Error('Report not found');
            mockReportsService.updateState.mockRejectedValue(error);

            await expect(controller.updateReportState(reportId, newState)).rejects.toThrow(
                'Report not found',
            );
            expect(reportsService.updateState).toHaveBeenCalledWith(999, newState);
        });
    });
});

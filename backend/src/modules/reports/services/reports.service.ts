import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { ReportChangeType } from 'src/common/enums/report-change-type.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { reportNotFound } from 'src/common/helpers/exception.helper';
import { ReportChange } from 'src/database/entities/report-change.entity';
import { Report } from 'src/database/entities/report.entity';
import { INotificationService, NOTIFICATION_SERVICE } from 'src/modules/notifications/interfaces/notification-service.interface';
import {
    IUploadService,
    UPLOAD_SERVICE,
} from 'src/modules/upload/interfaces/upload-service.interface';
import { Equal, Repository } from 'typeorm';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportChangeDto } from '../dto/report-change.dto';
import { ReportDto } from '../dto/report.dto';
import { FOLLOWS_SERVICE, IFollowsService } from '../follows/interfaces/follows-service.interface';
import { IReportsService } from '../interfaces/reports-service.interface';

/**
 * Reports service providing CRUD operations and business logic for infrastructure reports.
 * Handles report creation with image uploads, state management, and data retrieval.
 *
 * Core functionality:
 * - Report creation with geolocation and image processing
 * - Report retrieval with filtering and relationships
 * - Administrative state management workflow
 * - Change history tracking and audit trail
 *
 * @example
 * ```typescript
 * const reportsService = new ReportsService(reportRepository, uploadService);
 * const reports = await reportsService.findAll();
 * const report = await reportsService.createReport(dto, files, userId);
 * ```
 */
@Injectable()
export class ReportsService implements IReportsService {
    /**
     * Creates a new ReportsService instance.
     *
     * @param reportRepository TypeORM repository for Report entity operations
     * @param uploadService Service for handling image uploads and processing
     * @param notificationService Service for handling notifications
     * @param followsService Service for handling user-report follow relationships
     */
    constructor(
        @InjectRepository(ReportChange)
        private readonly changeRepository: Repository<ReportChange>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @Inject(UPLOAD_SERVICE)
        private readonly uploadService: IUploadService,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @Inject(FOLLOWS_SERVICE)
        private readonly followsService: IFollowsService,
    ) { }

    /** @inheritDoc */
    async findAll(options: IPaginationOptions): Promise<Pagination<ReportDto>> {
        const paginated = await paginate(this.reportRepository, options, {
            relations: ['creator', 'images'],
            order: { createdAt: 'DESC' },
        });

        const items: ReportDto[] = paginated.items.map(report => ({
            id: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            state: report.state,
            isVisible: report.isVisible,
            latitude: report.latitude,
            longitude: report.longitude,
            createdAt: report.createdAt,
            creatorId: report.creator.id,
            images: report.images.map(img => ({
                takenAt: img.takenAt,
                latitude: img.latitude,
                longitude: img.longitude,
                url: img.imageUrl,
            })),
        }));

        return new Pagination(items, paginated.meta, paginated.links);
    }

    /** @inheritDoc */
    async findById(id: number): Promise<ReportDto> {
        const report = await this.reportRepository.findOne({
            where: { id: Equal(id) },
            relations: ['creator', 'images'],
        });

        if (!report) {
            reportNotFound();
        }

        return {
            id: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            state: report.state,
            isVisible: report.isVisible,
            latitude: report.latitude,
            longitude: report.longitude,
            createdAt: report.createdAt,
            creatorId: report.creator.id,
            images: report.images.map(img => ({
                takenAt: img.takenAt,
                latitude: img.latitude,
                longitude: img.longitude,
                url: img.imageUrl,
            })),
        };
    }

    /** @inheritDoc */
    async findHistoryByReportId(
        reportId: number,
        options: IPaginationOptions,
    ): Promise<Pagination<ReportChangeDto>> {
        const exists = await this.reportRepository.findOne({
            where: { id: Equal(reportId) },
        });
        if (!exists) {
            reportNotFound();
        }

        const qb = this.changeRepository
            .createQueryBuilder('change')
            .innerJoin('change.report', 'report', 'report.id = :reportId', { reportId })
            .innerJoinAndSelect('change.creator', 'creator')
            .select([
                'creator.id',
                'change.id',
                'change.changeType',
                'change.from',
                'change.to',
                'change.createdAt',
            ])
            .orderBy('change.createdAt', 'DESC');

        const paginated = await paginate<ReportChange>(qb, options);
        const items: ReportChangeDto[] = paginated.items.map(change => ({
            id: change.id,
            changeType: change.changeType,
            from: change.from,
            to: change.to,
            createdAt: change.createdAt,
            creatorId: change.creator.id,
        }));
        return new Pagination<ReportChangeDto>(items, paginated.meta, paginated.links);
    }

    /** @inheritDoc */
    async createReport(
        dto: CreateReportDto,
        files: Express.Multer.File[],
        creatorId: number,
    ): Promise<ReportDto> {
        const imageRecords: {
            imageUrl: string;
            takenAt: Date;
            latitude: number;
            longitude: number;
        }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const meta = dto.images[i];

            const url = await this.uploadService.uploadFile(file);

            imageRecords.push({
                imageUrl: url,
                takenAt: new Date(meta.takenAt),
                latitude: meta.latitude,
                longitude: meta.longitude,
            });
        }

        const lat = this.getAverage(imageRecords.map(img => img.latitude));
        const lon = this.getAverage(imageRecords.map(img => img.longitude));

        const report: Report = this.reportRepository.create({
            title: dto.title,
            description: dto.description,
            category: dto.category,
            images: imageRecords,
            latitude: lat,
            longitude: lon,
            creator: { id: creatorId },
        });

        const savedReport = await this.reportRepository.save(report);
        const reportDto: ReportDto = {
            id: savedReport.id,
            title: savedReport.title,
            description: savedReport.description,
            category: savedReport.category,
            state: savedReport.state,
            isVisible: savedReport.isVisible,
            latitude: savedReport.latitude,
            longitude: savedReport.longitude,
            createdAt: savedReport.createdAt,
            creatorId: creatorId,
            images: savedReport.images.map(img => ({
                takenAt: img.takenAt,
                latitude: img.latitude,
                longitude: img.longitude,
                url: img.imageUrl,
            })),
        };
        return reportDto;
    }

    /** @inheritDoc */
    async updateState(id: number, creatorId: number, state: ReportState): Promise<ReportDto> {
        const report = await this.reportRepository.findOne({
            where: { id: Equal(id) },
            relations: ['creator', 'images'],
        });

        if (!report) {
            reportNotFound();
        }

        if (report.state === state) {
            return this.findById(report.id);
        }

        const change = this.changeRepository.create({
            report,
            creator: { id: creatorId },
            changeType: ReportChangeType.STATE,
            from: report.state,
            to: state,
        });

        await this.changeRepository.save(change);

        // Get all followers of this report
        const followerIds = await this.followsService.getReportFollowerIds(report.id);

        // Send notification to report creator (if they're not the one making the change)
        const recipientIds = new Set<number>();
        if (report.creator.id !== creatorId) {
            recipientIds.add(report.creator.id);
        }

        // Add all followers to recipients
        for (const userId of followerIds) {
            if (userId !== creatorId) { // Don't notify the person making the change
                recipientIds.add(userId);
            }
        }

        // Send notifications to all recipients
        const notificationPayload = {
            reportId: report.id,
            from: report.state,
            to: state,
            title: `Estado del reporte #${report.title}`,
            message: `El reporte ha cambiado de estado de ${report.state} a ${state}`,
        };

        // Send notifications in parallel
        const notificationPromises = Array.from(recipientIds).map(userId =>
            this.notificationService.sendNotification(userId, notificationPayload)
        );

        try {
            await Promise.allSettled(notificationPromises);
        } catch (error) {
            // Log error but don't fail the operation
            console.error('Error sending notifications:', error);
        }

        report.state = state;
        const updatedReport = await this.reportRepository.save(report);

        return this.findById(updatedReport.id);
    }

    private getAverage(values: number[]): number {
        return values.reduce((acc, val) => acc + val, 0) / values.length;
    }
}

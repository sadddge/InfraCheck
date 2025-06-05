import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import {
    IUploadService,
    UPLOAD_SERVICE,
} from 'src/modules/upload/interfaces/upload-service.interface';
import { Repository } from 'typeorm';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportDto } from '../dto/report.dto';
import { IReportsService } from '../interfaces/reports-service.interface';

@Injectable()
export class ReportsService implements IReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @Inject(UPLOAD_SERVICE)
        private readonly uploadService: IUploadService,
    ) {}

    async findAll(): Promise<ReportDto[]> {
        const reports = await this.reportRepository.find({
            relations: ['creator', 'images'],
        });

        return reports.map(report => ({
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
    }

    async findById(id: number): Promise<ReportDto> {
        const report = await this.reportRepository.findOne({
            where: { id },
            relations: ['creator', 'images'],
        });

        if (!report) {
            throw new NotFoundException(`Report with ID ${id} not found`);
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

        const lat = this.getAvarage(imageRecords.map(img => img.latitude));
        const lon = this.getAvarage(imageRecords.map(img => img.longitude));

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

    updateReport(id: number, dto: CreateReportDto): Promise<ReportDto> {
        throw new Error('Method not implemented.');
    }

    deleteReport(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private getAvarage(values: number[]): number {
        return values.reduce((acc, val) => acc + val, 0) / values.length;
    }
}

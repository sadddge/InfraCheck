import { CreateReportDto } from '../dto/create-report.dto';
import { ReportDto } from '../dto/report.dto';

export const REPORTS_SERVICE = 'REPORTS_SERVICE';
export interface IReportsService {
    findAll(): Promise<ReportDto[]>;
    findById(id: number): Promise<ReportDto>;
    createReport(
        dto: CreateReportDto,
        files: Express.Multer.File[],
        creatorId: number,
    ): Promise<ReportDto>;
    updateReport(id: number, dto: CreateReportDto): Promise<ReportDto>;
    deleteReport(id: number): Promise<void>;
}

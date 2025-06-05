import { ReportState } from 'src/common/enums/report-state.enums';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportChangeDto } from '../dto/report-change.dto';
import { ReportDto } from '../dto/report.dto';

export const REPORTS_SERVICE = 'REPORTS_SERVICE';
export interface IReportsService {
    findAll(): Promise<ReportDto[]>;
    findById(id: number): Promise<ReportDto>;
    findHistoryByReportId(reportId: number): Promise<ReportChangeDto[]>;
    createReport(
        dto: CreateReportDto,
        files: Express.Multer.File[],
        creatorId: number,
    ): Promise<ReportDto>;
    updateState(id: number, state: ReportState): Promise<ReportDto>;
}

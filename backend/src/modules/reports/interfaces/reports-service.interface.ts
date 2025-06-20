import { ReportState } from 'src/common/enums/report-state.enums';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportChangeDto } from '../dto/report-change.dto';
import { ReportDto } from '../dto/report.dto';

/**
 * Service token for dependency injection of reports service.
 * Used with NestJS @Inject decorator to provide IReportsService implementation.
 */
export const REPORTS_SERVICE = 'REPORTS_SERVICE';

/**
 * Interface defining the contract for report service implementations.
 * Provides comprehensive report management functionality for infrastructure reporting system.
 *
 * Report service interface providing:
 * - Report CRUD operations with geolocation support
 * - Image upload and processing integration
 * - Administrative state management workflow
 * - Change history tracking and audit trail
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class ReportsService implements IReportsService {
 *   async findAll(): Promise<ReportDto[]> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IReportsService {
    /**
     * Retrieves all reports in the system with complete information.
     * Returns reports with creator details and image attachments.
     *
     * @returns Array of report DTOs
     *
     * @example
     * ```typescript
     * const reports = await reportsService.findAll();
     * reports.forEach(report => console.log(report.title));
     * ```
     */
    findAll(): Promise<ReportDto[]>;

    /**
     * Finds a specific report by its unique identifier.
     * Includes all related data (creator, images, comments, etc.).
     *
     * @param id Unique report identifier
     * @returns Report DTO with complete information
     * @throws {AppException} REP001 - When report with specified ID does not exist
     *
     * @example
     * ```typescript
     * const report = await reportsService.findById(123);
     * console.log(`Report: ${report.title} at ${report.latitude}, ${report.longitude}`);
     * ```
     */
    findById(id: number): Promise<ReportDto>;

    /**
     * Retrieves change history for a specific report.
     * Returns chronological list of state changes for audit trail.
     *
     * @param reportId Unique identifier of the report
     * @returns Array of report change DTOs ordered by creation date
     * @throws {AppException} REP001 - When report with specified ID does not exist
     *
     * @example
     * ```typescript
     * const history = await reportsService.findHistoryByReportId(123);
     * history.forEach(change => console.log(`${change.fromState} -> ${change.toState}`));
     * ```
     */
    findHistoryByReportId(reportId: number): Promise<ReportChangeDto[]>;

    /**
     * Creates a new infrastructure report with image uploads.
     * Processes geolocation data and uploads associated images.
     *
     * @param dto Report creation data with metadata
     * @param files Array of uploaded image files
     * @param creatorId ID of the user creating the report
     * @returns Created report DTO
     * @throws {BadRequestException} When validation fails or images are invalid
     *
     * @example
     * ```typescript
     * const newReport = await reportsService.createReport(
     *   { title: 'Broken streetlight', category: ReportCategory.LIGHTING, ... },
     *   imageFiles,
     *   userId
     * );
     * ```
     */

    createReport(
        dto: CreateReportDto,
        files: Express.Multer.File[],
        creatorId: number,
    ): Promise<ReportDto>;

    /**
     * Updates the processing state of a report for administrative workflow.
     * Creates change history entry and updates report status.
     *
     * @param id Report identifier to update
     * @param state New state to apply
     * @returns Updated report DTO
     * @throws {AppException} REP001 - When report does not exist
     * @throws {AppException} GEN002 - When state transition is invalid
     *
     * @example
     * ```typescript
     * const updatedReport = await reportsService.updateState(123, ReportState.IN_PROGRESS);
     * console.log(`Report now ${updatedReport.state}`);
     * ```
     */
    updateState(id: number, state: ReportState): Promise<ReportDto>;
}

import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Role } from 'src/common/enums/roles.enums';
import { invalidRequest, validationError } from 'src/common/helpers/exception.helper';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportChangeDto } from '../dto/report-change.dto';
import { ReportDto } from '../dto/report.dto';
import { IReportsService, REPORTS_SERVICE } from '../interfaces/reports-service.interface';

/**
 * Infrastructure reports controller providing RESTful endpoints for report management.
 * Handles report CRUD operations, image uploads, state management, and category filtering.
 *
 * Exposes report management endpoints including:
 * - Report listing and retrieval with filtering
 * - Report creation with image upload and geolocation
 * - Administrative state management workflow
 * - Category listing for filtering and classification
 * - Change history tracking and audit trail
 *
 * Features role-based access control for administrative operations
 * and supports multipart form data for image uploads.
 *
 * @example
 * ```typescript
 * // All endpoints are prefixed with /api/v1/reports
 * GET /api/v1/reports                    // Get all reports
 * POST /api/v1/reports                   // Create new report with images
 * GET /api/v1/reports/123                // Get specific report
 * GET /api/v1/reports/categories         // Get available categories
 * PATCH /api/v1/reports/123/state        // Update report state (admin)
 * GET /api/v1/reports/123/history        // Get change history
 * ```
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller({
    path: 'reports',
    version: '1',
})
export class ReportsController {
    /**
     * Creates a new ReportsController instance.
     *
     * @param reportsService Report service for handling business logic
     */
    constructor(
        @Inject(REPORTS_SERVICE)
        private readonly reportsService: IReportsService,
    ) {}

    /**
     * Retrieves all available report categories for classification.
     * Returns predefined categories used for report filtering and organization.
     * Public endpoint that doesn't require authentication.
     *
     * @returns Array of available report category strings
     *
     * @example
     * ```typescript
     * // Get available categories
     * GET /api/v1/reports/categories
     *
     * // Response
     * ["SECURITY", "INFRASTRUCTURE", "TRANSIT", "GARBAGE"]
     * ```
     */
    @Get('categories')
    @ApiOperation({
        summary: 'Get available report categories',
        description: 'Retrieves all available categories for report classification and filtering',
    })
    @ApiResponse({
        status: 200,
        description: 'List of available report categories',
        type: [String],
    })
    getReportCategories(): string[] {
        return Object.values(ReportCategory);
    }

    /**
     * Retrieves all infrastructure reports in the system.
     * Returns reports with creator information, image attachments, and geolocation data.
     * Supports pagination via page and limit query parameters.
     *
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 10)
     * @returns Paginated report DTOs with metadata
     *
     * @example
     * ```typescript
     * // Get paginated reports
     * GET /api/v1/reports?page=1&limit=10
     * Authorization: Bearer <token>
     *
     * // Response includes pagination metadata and report items
     * ```
     */
    @Get()
    @ApiOperation({
        summary: 'Get paginated reports',
        description:
            'Retrieves paginated infrastructure reports with creator and image information',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiResponse({
        status: 200,
        description: 'Paginated list of reports',
        type: [ReportDto],
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
    })
    async getAllReports(@Query() { page, limit }: PaginationDto): Promise<Pagination<ReportDto>> {
        return await this.reportsService.findAll({ page, limit });
    }

    /**
     * Retrieves a specific infrastructure report by its unique identifier.
     * Returns complete report information including relationships and history.
     *
     * @param id Unique identifier of the report to retrieve
     * @returns Report DTO with complete information
     *
     * @example
     * ```typescript
     * // Get specific report
     * GET /api/v1/reports/123
     * Authorization: Bearer <token>
     *
     * // Response includes:
     * // - Complete report details
     * // - Creator information
     * // - All image attachments
     * // - Current state and category
     * ```
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get report by ID',
        description: 'Retrieves a specific report with all related information',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the report',
        type: Number,
        example: 123,
    })
    @ApiResponse({
        status: 200,
        description: 'Report details',
        type: ReportDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
    })
    async getReportById(@Param('id') id: string): Promise<ReportDto> {
        return await this.reportsService.findById(+id);
    }

    /**
     * Creates a new infrastructure report with image uploads and geolocation.
     * Processes multipart form data with images and metadata validation.
     * Associates report with authenticated user and uploads images to storage.
     *
     * @param files Array of uploaded image files (max 10)
     * @param rawMetadata JSON string containing report metadata
     * @param req Express request object containing authenticated user information
     * @returns Created report DTO with complete information
     *
     * @example
     * ```typescript
     * // Create new report with images
     * POST /api/v1/reports
     * Content-Type: multipart/form-data
     * Authorization: Bearer <token>
     *
     * FormData:
     * - images: [file1.jpg, file2.jpg]
     * - metadata: '{
     *     "title": "Broken streetlight",
     *     "description": "Light has been out for 3 days",
     *     "category": "SECURITY",
     *     "images": [
     *       {
     *         "takenAt": "2024-01-15T14:30:00.000Z",
     *         "latitude": -33.4489,
     *         "longitude": -70.6693
     *       }
     *     ]
     *   }'
     * ```
     */
    @Post()
    @UseInterceptors(FilesInterceptor('images', 10))
    @ApiOperation({
        summary: 'Create new report with images',
        description: 'Creates a new infrastructure report with image uploads and geolocation data',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: 201,
        description: 'Report created successfully',
        type: ReportDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid files or metadata',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
    })
    async createReport(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('metadata') rawMetadata: string,
        @Req() req,
    ): Promise<ReportDto> {
        if (!files || files.length === 0) invalidRequest({ info: 'No files uploaded' });
        if (!rawMetadata) invalidRequest({ info: 'No metadata provided' });

        const metadata = JSON.parse(rawMetadata);
        const dto: CreateReportDto = plainToInstance(CreateReportDto, metadata);
        const errors = await validate(dto);
        if (errors.length)
            validationError(
                errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints ?? {},
                })),
                'Invalid metadata',
            );

        if (files.length !== dto.images.length)
            invalidRequest({ info: 'Number of uploaded files does not match metadata' });
        const creatorId = req.user.id ?? 5; // Assuming user ID is available in the request

        return await this.reportsService.createReport(dto, files, creatorId);
    }

    /**
     * Retrieves the change history for a specific report.
     * Returns chronological list of state changes for audit trail.
     * Shows administrative actions and workflow progression.
     *
     * @param id Unique identifier of the report
     * @returns Array of report change DTOs ordered by creation date
     *
     * @example
     * ```typescript
     * // Get report change history
     * GET /api/v1/reports/123/history
     * Authorization: Bearer <token>
     *
     * // Response includes:
     * // - State transitions (PENDING -> IN_PROGRESS -> RESOLVED)
     * // - Timestamps of changes
     * // - Administrative actions taken
     * ```
     */
    @Get(':id/history')
    @ApiOperation({
        summary: 'Get report change history',
        description: 'Retrieves chronological list of state changes and administrative actions',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the report',
        type: Number,
        example: 123,
    })
    @ApiResponse({
        status: 200,
        description: 'Report change history',
        type: [ReportChangeDto],
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
    })
    async getReportHistory(@Param('id') id: string): Promise<ReportChangeDto[]> {
        return await this.reportsService.findHistoryByReportId(+id);
    }

    /**
     * Updates the processing state of a report for administrative workflow.
     * Restricted to administrators only for report state management.
     * Creates change history entry and triggers notifications to followers.
     *
     * @param id Unique identifier of the report to update
     * @param state New state to apply to the report
     * @returns Updated report DTO with new state
     *
     * @example
     * ```typescript
     * // Update report state (admin only)
     * PATCH /api/v1/reports/123/state
     * Authorization: Bearer <admin-token>
     * Content-Type: application/json
     *
     * {
     *   "state": "IN_PROGRESS"
     * }
     *
     * // Valid states: PENDING, IN_PROGRESS, RESOLVED, REJECTED
     * ```
     */
    @Patch(':id/state')
    @Roles(Role.ADMIN)
    @ApiOperation({
        summary: 'Update report state (Admin only)',
        description: 'Updates the processing state of a report in the administrative workflow',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the report',
        type: Number,
        example: 123,
    })
    @ApiResponse({
        status: 200,
        description: 'Report state updated successfully',
        type: ReportDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid state transition',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin role required',
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found',
    })
    async updateReportState(
        @Param('id') id: string,
        @Body('state') state: ReportState,
    ): Promise<ReportDto> {
        return await this.reportsService.updateState(+id, state);
    }
}

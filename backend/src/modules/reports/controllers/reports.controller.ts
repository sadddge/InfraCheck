import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Role } from 'src/common/enums/roles.enums';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportChangeDto } from '../dto/report-change.dto';
import { ReportDto } from '../dto/report.dto';
import { IReportsService, REPORTS_SERVICE } from '../interfaces/reports-service.interface';

@Controller({
    path: 'reports',
    version: '1',
})
export class ReportsController {
    constructor(
        @Inject(REPORTS_SERVICE)
        private readonly reportsService: IReportsService,
    ) {}

    @Get()
    async getAllReports(): Promise<ReportDto[]> {
        return await this.reportsService.findAll();
    }

    @Get(':id')
    async getReportById(@Param('id') id: string): Promise<ReportDto> {
        return await this.reportsService.findById(+id);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 10))
    async createReport(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('metadata') rawMetadata: string,
        @Req() req,
    ): Promise<ReportDto> {
        if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
        if (!rawMetadata) throw new BadRequestException('No metadata provided');

        const metadata = JSON.parse(rawMetadata);
        const dto: CreateReportDto = plainToInstance(CreateReportDto, metadata);
        const errors = await validate(dto);
        if (errors.length) throw new BadRequestException('Invalid metadata');

        if (files.length !== dto.images.length)
            throw new BadRequestException('Number of uploaded files does not match metadata');
        const creatorId = req.user.id ?? 5; // Assuming user ID is available in the request

        return await this.reportsService.createReport(dto, files, creatorId);
    }

    @Get(':id/history')
    async getReportHistory(@Param('id') id: string): Promise<ReportChangeDto[]> {
        return await this.reportsService.findHistoryByReportId(+id);
    }

    @Patch(':id/state')
    @Roles(Role.ADMIN)
    async updateReportState(
        @Param('id') id: string,
        @Body('state') state: ReportState,
    ): Promise<ReportDto> {
        return await this.reportsService.updateState(+id, state);
    }
}

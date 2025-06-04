import {
    BadRequestException,
    Body,
    Controller,
    Inject,
    Post,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportDto } from './dto/report.dto';
import { IReportsService, REPORTS_SERVICE } from './interfaces/reports-service.interface';

@Controller({
    path: 'reports',
    version: '1',
})
export class ReportsController {
    constructor(
        @Inject(REPORTS_SERVICE)
        private readonly reportsService: IReportsService,
    ) {}

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

        return this.reportsService.createReport(dto, files, creatorId);
    }
}

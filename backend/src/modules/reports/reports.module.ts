import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { UploadModule } from '../upload/upload.module';
import { REPORTS_SERVICE } from './interfaces/reports-service.interface';
import { ReportsController } from './reports.controller';
import { ReportsService } from './services/reports.service';

@Module({
    imports: [UploadModule, TypeOrmModule.forFeature([Report])],
    controllers: [ReportsController],
    providers: [
        {
            provide: REPORTS_SERVICE,
            useClass: ReportsService,
        },
    ],
})
export class ReportModule {}

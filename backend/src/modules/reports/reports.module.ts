import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/database/entities/report.entity';
import { UploadModule } from '../upload/upload.module';
import { ReportsController } from './controllers/reports.controller';
import { REPORTS_SERVICE } from './interfaces/reports-service.interface';
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

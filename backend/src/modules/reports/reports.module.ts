import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportChange } from 'src/database/entities/report-change.entity';
import { Report } from 'src/database/entities/report.entity';
import { UploadModule } from '../upload/upload.module';
import { CommentsModule } from './comments/comments.module';
import { ReportsController } from './controllers/reports.controller';
import { FollowsModule } from './follows/follows.module';
import { REPORTS_SERVICE } from './interfaces/reports-service.interface';
import { ReportsService } from './services/reports.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Report, ReportChange]),
        UploadModule,
        CommentsModule,
        FollowsModule,
        NotificationsModule
    ],
    controllers: [ReportsController],
    providers: [
        {
            provide: REPORTS_SERVICE,
            useClass: ReportsService,
        },
    ],
})
export class ReportModule { }

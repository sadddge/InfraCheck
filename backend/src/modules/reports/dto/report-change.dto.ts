import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportChangeType } from 'src/common/enums/report-change-type.enums';
import { ReportState } from 'src/common/enums/report-state.enums';

export class ReportChangeDto {
    creatorId: number;
    changeType: ReportChangeType;
    from: ReportCategory | ReportState;
    to: ReportCategory | ReportState;
    createdAt: Date;
}

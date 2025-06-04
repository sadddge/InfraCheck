import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';

export class ReportDto {
    id: number;
    title: string;
    description: string;
    category: ReportCategory;
    state: ReportState;
    isVisible: boolean;
    latitude: number;
    longitude: number;
    createdAt: Date;
    creatorId: number;
    images: {
        takenAt: Date;
        latitude: number;
        longitude: number;
        url: string;
    }[];
}

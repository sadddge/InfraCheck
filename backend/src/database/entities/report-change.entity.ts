import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportChangeType } from 'src/common/enums/report-change-type.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

@Entity()
export class ReportChange {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        user => user.reportChanges,
    )
    creator: User;

    @ManyToOne(
        () => Report,
        report => report.changes,
    )
    report: Report;

    @Column({
        type: 'enum',
        enum: ReportChangeType,
    })
    changeType: ReportChangeType;

    @Column()
    from: ReportCategory | ReportState;

    @Column()
    to: ReportCategory | ReportState;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;
}

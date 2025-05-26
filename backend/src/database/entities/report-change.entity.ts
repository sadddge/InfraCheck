import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Report } from './report.entity';

@Entity()
export class ReportChange {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.reportChanges)
    creator: User;

    @ManyToOne(() => Report, report => report.changes)
    report: Report;

    @Column({ type: 'text' })
    content: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;
}

import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { ReportChange } from './report-change.entity';
import { ReportImage } from './report-image.entity';
import { User } from './user.entity';
import { Vote } from './vote.entity';

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        user => user.reports,
    )
    creator: User;

    @OneToMany(
        () => ReportImage,
        reportImage => reportImage.report,
        { cascade: true, eager: true, onDelete: 'CASCADE' },
    )
    images: ReportImage[];

    @OneToMany(
        () => Comment,
        comment => comment.report,
    )
    comments: Comment[];

    @OneToMany(
        () => ReportChange,
        reportChange => reportChange.report,
    )
    changes: ReportChange[];

    @OneToMany(
        () => Vote,
        vote => vote.report,
    )
    votes: Vote[];

    @ManyToMany(
        () => User,
        user => user.reportsFollowed,
    )
    followers: User[];

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'decimal',
        precision: 9,
        scale: 6,
        transformer: {
            to: (value: number) => value?.toString(),
            from: (value: string) => Number.parseFloat(value),
        },
    })
    latitude: number;

    @Column({
        type: 'decimal',
        precision: 9,
        scale: 6,
        transformer: {
            to: (value: number) => value?.toString(),
            from: (value: string) => Number.parseFloat(value),
        },
    })
    longitude: number;

    @Column({ default: true, name: 'is_visible' })
    isVisible: boolean;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    @Column({
        type: 'enum',
        enum: ReportState,
        default: ReportState.PENDING,
    })
    state: ReportState;

    @Column({
        type: 'enum',
        enum: ReportCategory,
    })
    category: ReportCategory;
}

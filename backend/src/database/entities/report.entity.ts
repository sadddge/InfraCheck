import { ReportCategory } from 'src/common/enums/report-category.enums';
import { ReportState } from 'src/common/enums/report-state.enums';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Notification } from './notification.entity';
import { ReportChange } from './report-change.entity';
import { ReportImage } from './report-image.entity';
import { User } from './user.entity';
import { Vote } from './vote.entity';

/**
 * Infrastructure report entity storing citizen-reported issues and problems.
 * Supports geolocation, image attachments, state workflow management, and community engagement.
 *
 * @entity Report
 * @table reports
 *
 * Key features:
 * - Geolocation-based reporting with precise coordinates
 * - Image attachments with metadata (location, timestamp)
 * - Administrative workflow with state management
 * - Community features (comments, votes, followers)
 */
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

    @OneToMany(
        () => Notification,
        notification => notification.report,
        { onDelete: 'CASCADE' },
    )
    notifications: Notification[];

    @ManyToMany(
        () => User,
        user => user.reportsFollowed,
    )
    followers: User[];
    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    /**
     * Geographical latitude for precise report location.
     * Range: -90 to +90 degrees
     * Used for map visualization and proximity calculations.
     */
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

    /**
     * Geographical longitude for precise report location.
     * Range: -180 to +180 degrees
     * Used for map visualization and proximity calculations.
     */
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

    /**
     * Report visibility flag for content moderation.
     * When false, report is hidden from public view but remains in system.
     * Allows soft-deletion and content moderation without data loss.
     */
    @Column({ default: true, name: 'is_visible' })
    isVisible: boolean;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;

    /**
     * Current processing state in administrative workflow.
     * PENDING -> IN_PROGRESS -> RESOLVED/REJECTED
     * Controls visibility and administrative actions.
     */
    @Column({
        type: 'enum',
        enum: ReportState,
        default: ReportState.PENDING,
    })
    state: ReportState;

    /**
     * Infrastructure category for classification and routing.
     * Used for filtering, statistics, and directing reports to appropriate departments.
     */
    @Column({
        type: 'enum',
        enum: ReportCategory,
    })
    category: ReportCategory;
}

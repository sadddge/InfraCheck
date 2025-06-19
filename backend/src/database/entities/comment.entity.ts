import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

/**
 * Comment entity for user discussions on infrastructure reports.
 * Provides community engagement and additional information on reported issues.
 *
 * @entity Comment
 * @table comments
 *
 * Features:
 * - Threaded discussions on reports
 * - User attribution and timestamps
 * - Content moderation support
 */
@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        user => user.comments,
    )
    creator: User;

    @ManyToOne(
        () => Report,
        report => report.comments,
    )
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

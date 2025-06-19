import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Message } from './message.entity';
import { RefreshToken } from './refresh-token.entity';
import { ReportChange } from './report-change.entity';
import { Report } from './report.entity';
import { Vote } from './vote.entity';

/**
 * User entity representing system participants in the infrastructure reporting platform.
 * Supports role-based access control, SMS-verified registration workflow, and user management.
 *
 * @entity User
 * @table users
 *
 * Key relationships:
 * - One-to-many with reports (as creator)
 * - One-to-many with comments and votes
 * - Many-to-many with followed reports for notifications
 * - One-to-many with refresh tokens for authentication
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Phone number in E.164 international format (e.g., +56912345678).
     * Used as primary identifier for authentication and SMS verification.
     * Must be unique across the system.
     */
    @Column({ unique: true, name: 'phone_number', nullable: false })
    phoneNumber: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({
        name: 'last_name',
    })
    lastName: string;

    /**
     * User role determining system permissions and access levels.
     * NEIGHBOR: Standard user who can create and follow reports
     * ADMIN: Full system access and user management
     * MODERATOR: Report management and moderation capabilities
     */
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.NEIGHBOR,
    })
    role: Role;

    /**
     * Account status for verification and moderation workflow.
     * PENDING_VERIFICATION -> ACTIVE (via SMS verification)
     * ACTIVE -> BANNED (admin action for violations)
     * BANNED -> ACTIVE (admin rehabilitation)
     */
    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING_VERIFICATION,
    })
    status: UserStatus;

    @Column({
        type: 'timestamp',
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    /**
     * Timestamp of last password change for security tracking.
     * Used to invalidate refresh tokens and force re-authentication.
     * Null indicates password has never been changed since account creation.
     */
    @Column({
        type: 'timestamp',
        name: 'password_updated_at',
        nullable: true,
        default: null,
    })
    passwordUpdatedAt: Date | null;

    @OneToMany(
        () => Report,
        report => report.creator,
    )
    reports: Report[];

    @OneToMany(
        () => ReportChange,
        reportChange => reportChange.creator,
    )
    reportChanges: ReportChange[];

    @OneToMany(
        () => Comment,
        comment => comment.creator,
    )
    comments: Comment[];

    @OneToMany(
        () => Message,
        message => message.sender,
    )
    messages: Message[];

    @OneToMany(
        () => Vote,
        vote => vote.user,
    )
    votes: Vote[];

    @OneToMany(
        () => RefreshToken,
        refreshToken => refreshToken.user,
    )
    refreshTokens: RefreshToken[]; /**
     * Reports this user is following for notifications and updates.
     * Many-to-many relationship allowing users to track multiple reports
     * and receive notifications when reports change status or receive comments.
     */
    @ManyToMany(
        () => Report,
        report => report.followers,
    )
    @JoinTable({
        name: 'user_reports_followed',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'report_id',
            referencedColumnName: 'id',
        },
    })
    reportsFollowed: Report[];
}

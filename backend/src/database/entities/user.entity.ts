import { Role } from 'src/common/enums/roles.enums';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Message } from './message.entity';
import { RefreshToken } from './refresh-token.entity';
import { ReportChange } from './report-change.entity';
import { Report } from './report.entity';
import { Vote } from './vote.entity';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

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

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.NEIGHBOR,
    })
    role: Role;

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
    refreshTokens: RefreshToken[];

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

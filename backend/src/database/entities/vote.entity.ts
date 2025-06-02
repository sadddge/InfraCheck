import { VoteType } from 'src/common/enums/vote-type.enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

@Entity()
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        user => user.votes,
    )
    user: User;

    @ManyToOne(
        () => Report,
        report => report.votes,
    )
    report: Report;

    @Column({
        type: 'enum',
        enum: VoteType,
    })
    type: VoteType;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    createdAt: Date;
}

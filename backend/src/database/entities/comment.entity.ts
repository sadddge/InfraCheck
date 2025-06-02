import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

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

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity()
export class ReportImage {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => Report,
        report => report.images,
        { onDelete: 'CASCADE' },
    )
    report: Report;

    @Column()
    imageUrl: string;

    @Column()
    takenAt: Date;

    @Column({ type: 'double precision', nullable: true })
    latitude: number;

    @Column({ type: 'double precision', nullable: true })
    longitude: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

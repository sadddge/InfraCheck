import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    token: string;
    @ManyToOne(
        () => User,
        user => user.refreshTokens,
        { onDelete: 'CASCADE' },
    )
    user: User;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @Column({ type: 'timestamp', name: 'expires_at' })
    expiresAt: Date;
}

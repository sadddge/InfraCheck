import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class NotificationPreference {
    @PrimaryColumn()
    userId: number;
    @OneToOne(() => User, (user) => user.notificationPreference, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "userId", referencedColumnName: "id" })
    user: User;
    @Column({ type: "boolean", default: true })
    sseEnabled: boolean;
    @Column({ type: "boolean", default: false })
    pushEnabled: boolean;
    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt: Date;
}
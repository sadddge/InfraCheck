import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

/**
 * Device token entity for push notifications.
 * Stores device tokens associated with users for sending push notifications.
 */
@Entity('device_tokens')
export class DeviceToken {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Device token for push notifications (FCM, APNS, etc.)
     */
    @Column({ type: 'text', nullable: false })
    token: string;

    /**
     * Platform of the device (ios, android, web)
     */
    @Column({ type: 'varchar', length: 20, default: 'unknown' })
    platform: string;

    /**
     * Whether this token is active/valid
     */
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    /**
     * User who owns this device token
     */
    @ManyToOne(() => User, user => user.deviceTokens, {
        onDelete: 'CASCADE'
    })
    user: User;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

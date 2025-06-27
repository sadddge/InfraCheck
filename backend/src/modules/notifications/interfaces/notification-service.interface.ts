import { Observable } from "rxjs";
import { ReportState } from "src/common/enums/report-state.enums";
import { Notification } from "src/database/entities/notification.entity";

export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';
export const SSE_NOTIFICATION_SERVICE = 'SSE_NOTIFICATION_SERVICE';
export const PUSH_NOTIFICATION_SERVICE = 'PUSH_NOTIFICATION_SERVICE';

export interface NotificationPayload {
    reportId: number;
    from: ReportState;
    to: ReportState;
    title?: string;
    message?: string;
}

/**
 * Interface for notification service that handles sending notifications to users.
 * 
 * @interface INotificationService
 */
export interface INotificationService {
    /**
     * Sends a notification to a specific user.
     * 
     * @param userId - The unique identifier of the user to send the notification to
     * @param payload - The notification data/content to be sent
     * @returns A promise that resolves when the notification has been sent successfully
     * @throws May throw an error if the notification fails to send
     */
    sendNotification(userId: number, payload: NotificationPayload): Promise<void>;
}

/**
 * Interface for services that only handle sending (without persistence).
 * Used by the Facade to delegate sending to specific services.
 * 
 * @interface INotificationSender
 */
export interface INotificationSender {
    /**
     * Sends a notification using the specific delivery method.
     * Does NOT persist to database - that's handled by the Facade.
     * 
     * @param notification - The persisted notification entity to send
     * @returns A promise that resolves when the notification has been sent
     */
    sendNotificationEntity(notification: Notification): Promise<void>;
}

/**
 * Interface for SSE notification service with streaming capabilities.
 * 
 * @interface ISseNotificationService
 */
export interface ISseNotificationService extends INotificationSender {
    /**
     * Gets a stream of notifications for a specific user.
     * 
     * @param userId - The unique identifier of the user
     * @returns Observable stream of notifications for the user
     */
    getNotificationStream(userId: number): Observable<Notification>;
}

/**
 * Interface for Push notification service.
 * 
 * @interface IPushNotificationService
 */
export interface IPushNotificationService extends INotificationSender {
    /**
     * Registers a device token for push notifications.
     * 
     * @param userId - The unique identifier of the user
     * @param deviceToken - The device token for push notifications
     * @returns A promise that resolves when the token is registered
     */
    registerDeviceToken(userId: number, deviceToken: string): Promise<void>;

    /**
     * Unregisters a device token for push notifications.
     * 
     * @param userId - The unique identifier of the user
     * @param deviceToken - The device token to unregister
     * @returns A promise that resolves when the token is unregistered
     */
    unregisterDeviceToken(userId: number, deviceToken: string): Promise<void>;
}
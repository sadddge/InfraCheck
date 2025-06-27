import { Injectable, Logger } from "@nestjs/common";
import { Observable, Subject, filter } from "rxjs";
import { Notification } from "src/database/entities/notification.entity";
import { ISseNotificationService } from "../interfaces/notification-service.interface";

@Injectable()
export class SseNotificationService implements ISseNotificationService {
    private readonly logger = new Logger(SseNotificationService.name);
    private readonly notificationStream = new Subject<Notification>();

    /**
     * Envía una notificación ya persistida a través de SSE.
     * No persiste en la base de datos - esa responsabilidad es del Facade.
     */
    async sendNotificationEntity(notification: Notification): Promise<void> {
        try {
            // Emitir la notificación a través del stream
            this.notificationStream.next(notification);

            this.logger.log(`SSE notification sent to user ${notification.user.id} for report ${notification.report.id}`);
        } catch (error) {
            this.logger.error(`Failed to send SSE notification to user ${notification.user.id}:`, error);
            throw error;
        }
    }

    getNotificationStream(userId: number): Observable<Notification> {
        return this.notificationStream.asObservable().pipe(
            filter(notification => notification.user.id === userId)
        );
    }
}
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from 'src/database/entities/device-token.entity';
import { NotificationPreference } from 'src/database/entities/notification-preference.entity';
import { Notification } from 'src/database/entities/notification.entity';
import { NotificationsController } from './controllers/notifications.controller';
import {
    NOTIFICATION_SERVICE,
    PUSH_NOTIFICATION_SERVICE,
    SSE_NOTIFICATION_SERVICE
} from './interfaces/notification-service.interface';
import { NotificationFacade } from './services/notification-facade.service';
import { PushNotificationService } from './services/push-notification.service';
import { SseNotificationService } from './services/sse-notification.service';
const notificationProviders: Provider[] = [
    // Servicios específicos de notificación
    {
        provide: SSE_NOTIFICATION_SERVICE,
        useClass: SseNotificationService,
    },
    {
        provide: PUSH_NOTIFICATION_SERVICE,
        useClass: PushNotificationService,
    },

    // Facade principal que usa el patrón Facade
    {
        provide: NOTIFICATION_SERVICE,
        useClass: NotificationFacade,
    },

    // Servicios adicionales
    SseNotificationService,
    PushNotificationService,
    NotificationFacade,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Notification,
            NotificationPreference,
            DeviceToken,
        ]),
    ],
    controllers: [NotificationsController],
    providers: [...notificationProviders],
    exports: [
        NOTIFICATION_SERVICE,
        SSE_NOTIFICATION_SERVICE,
        PUSH_NOTIFICATION_SERVICE,
        NotificationFacade,
    ],
})
export class NotificationsModule { }

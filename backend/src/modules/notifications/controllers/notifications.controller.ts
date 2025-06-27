import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Sse
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import {
    INotificationService,
    NOTIFICATION_SERVICE,
    NotificationPayload
} from "../interfaces/notification-service.interface";
import { NotificationFacade } from "../services/notification-facade.service";

interface DeviceTokenDto {
    token: string;
    platform?: string;
}

interface NotificationPreferencesDto {
    sseEnabled: boolean;
    pushEnabled: boolean;
}

@Controller({
    path: 'users/:userId/notifications',
    version: '1',
})
export class NotificationsController {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        private readonly notificationFacade: NotificationFacade
    ) { }

    /**
     * Endpoint para recibir notificaciones en tiempo real vía Server-Sent Events (SSE)
     * 
     * GET /v1/users/:userId/notifications/stream
     */
    @Sse('stream')
    stream(@Param('userId', ParseIntPipe) userId: number): Observable<{ event: string, data: unknown }> {
        return this.notificationFacade.getNotificationStream(userId).pipe(
            map(notification => ({
                event: 'notification',
                data: notification,
            }))
        );
    }



    /**
     * Envía una notificación manual (para testing o admin)
     * 
     * POST /v1/users/:userId/notifications/send
     */
    @Post('send')
    async sendNotification(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() payload: NotificationPayload
    ): Promise<{ message: string }> {
        await this.notificationService.sendNotification(userId, payload);

        return {
            message: `Notification sent to user ${userId}`
        };
    }

    /**
     * Registra un token de dispositivo para push notifications
     * 
     * POST /v1/users/:userId/notifications/device-tokens
     */
    @Post('device-tokens')
    async registerDeviceToken(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() deviceTokenDto: DeviceTokenDto
    ): Promise<{ message: string }> {
        await this.notificationFacade.registerDeviceToken(userId, deviceTokenDto.token);

        return {
            message: 'Device token registered successfully'
        };
    }

    /**
     * Desregistra un token de dispositivo
     * 
     * DELETE /v1/users/:userId/notifications/device-tokens/:token
     */
    @Delete('device-tokens/:token')
    async unregisterDeviceToken(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('token') token: string
    ): Promise<{ message: string }> {
        await this.notificationFacade.unregisterDeviceToken(userId, token);

        return {
            message: 'Device token unregistered successfully'
        };
    }

    /**
     * Obtiene las preferencias de notificación del usuario
     * 
     * GET /v1/users/:userId/notifications/preferences
     */
    @Get('preferences')
    async getNotificationPreferences(
        @Param('userId', ParseIntPipe) userId: number
    ): Promise<NotificationPreferencesDto> {
        // Esta funcionalidad se podría implementar en el facade si es necesario
        // Por ahora retornamos un placeholder
        return {
            sseEnabled: true,
            pushEnabled: false
        };
    }

    /**
     * Actualiza las preferencias de notificación del usuario
     * 
     * PUT /v1/users/:userId/notifications/preferences
     */
    @Put('preferences')
    async updateNotificationPreferences(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() preferences: NotificationPreferencesDto
    ): Promise<{ message: string }> {
        // Esta funcionalidad se podría implementar en el facade
        // Por ahora retornamos un placeholder
        return {
            message: 'Notification preferences updated successfully'
        };
    }

    /**
     * Obtiene todas las notificaciones del usuario
     * 
     * GET /v1/users/:userId/notifications
     */
    @Get()
    async getUserNotifications(
        @Param('userId', ParseIntPipe) userId: number
    ): Promise<any[]> {
        return await this.notificationFacade.getUserNotifications(userId);
    }

    /**
     * Marca una notificación como leída
     * 
     * PUT /v1/users/:userId/notifications/:notificationId/read
     */
    @Put(':notificationId/read')
    async markNotificationAsRead(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('notificationId', ParseIntPipe) notificationId: number
    ): Promise<{ message: string }> {
        await this.notificationFacade.markNotificationAsRead(userId, notificationId);
        return { message: 'Notification marked as read' };
    }
}
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ReportChangeType } from "src/common/enums/report-change-type.enums";
import { NotificationPreference } from "src/database/entities/notification-preference.entity";
import { Notification } from "src/database/entities/notification.entity";
import { Repository } from "typeorm";
import {
    INotificationService,
    IPushNotificationService,
    ISseNotificationService,
    NotificationPayload,
    PUSH_NOTIFICATION_SERVICE,
    SSE_NOTIFICATION_SERVICE
} from "../interfaces/notification-service.interface";

/**
 * Notification Facade Service
 * 
 * Implementa el patrón Facade para abstraer la complejidad de múltiples servicios de notificaciones.
 * Decide automáticamente qué servicio de notificación usar basándose en las preferencias del usuario:
 * 
 * - Si push notifications están habilitadas: usa Push Notifications
 * - Si solo SSE está habilitado: usa SSE Notifications  
 * - SSE siempre está activo por defecto como fallback
 * 
 * Este patrón permite:
 * - Una interfaz simple para el cliente
 * - Lógica centralizada de decisión
 * - Fácil extensión con nuevos tipos de notificación
 * - Mantenimiento independiente de cada servicio
 */
@Injectable()
export class NotificationFacade implements INotificationService {
    private readonly logger = new Logger(NotificationFacade.name);

    constructor(
        @InjectRepository(NotificationPreference)
        private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @Inject(SSE_NOTIFICATION_SERVICE)
        private readonly sseNotificationService: ISseNotificationService,
        @Inject(PUSH_NOTIFICATION_SERVICE)
        private readonly pushNotificationService: IPushNotificationService
    ) { }

    /**
     * Envía una notificación al usuario usando el método apropiado según sus preferencias.
     * 
     * Lógica de decisión:
     * 1. Persiste la notificación UNA SOLA VEZ en la base de datos
     * 2. Obtiene las preferencias del usuario
     * 3. Si push está habilitado, envía via push usando la notificación persistida
     * 4. Si SSE está habilitado, envía via SSE usando la notificación persistida
     * 5. SSE siempre se ejecuta para mantener consistencia en tiempo real
     */
    async sendNotification(userId: number, payload: NotificationPayload): Promise<void> {
        let savedNotification: Notification | undefined;

        try {
            // 1. PERSISTIR LA NOTIFICACIÓN UNA SOLA VEZ
            const notification = this.notificationRepository.create({
                user: { id: userId },
                report: { id: payload.reportId },
                type: ReportChangeType.STATE,
                from: payload.from,
                to: payload.to,
            });

            savedNotification = await this.notificationRepository.save(notification);
            this.logger.debug(`Notification persisted once for user ${userId}, id: ${savedNotification.id}`);

            // 2. Obtener preferencias del usuario
            const preferences = await this.getUserNotificationPreferences(userId);
            this.logger.debug(`Sending notification to user ${userId} with preferences:`, preferences);

            const senderPromises: Promise<void>[] = [];

            // 3. Si push notifications están habilitadas, enviar push
            if (preferences.pushEnabled) {
                senderPromises.push(
                    this.sendPushNotificationEntity(savedNotification)
                );
            }

            // 4. SSE siempre se envía (está habilitado por defecto)
            if (preferences.sseEnabled) {
                senderPromises.push(
                    this.sendSseNotificationEntity(savedNotification)
                );
            }

            // 5. Ejecutar todos los envíos en paralelo
            const results = await Promise.allSettled(senderPromises);

            // Loguear resultados
            this.logNotificationResults(userId, results, preferences);

        } catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);

            // En caso de error, intentar enviar por SSE como último recurso
            if (savedNotification) {
                try {
                    await this.sendSseNotificationEntity(savedNotification);
                    this.logger.log(`Fallback SSE notification sent to user ${userId}`);
                } catch (fallbackError) {
                    this.logger.error(`Fallback SSE notification also failed for user ${userId}:`, fallbackError);
                    throw fallbackError;
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Obtiene el stream de notificaciones SSE para un usuario.
     * Este método expone la funcionalidad de streaming del servicio SSE.
     */
    getNotificationStream(userId: number) {
        return this.sseNotificationService.getNotificationStream(userId);
    }

    /**
     * Registra un token de dispositivo para push notifications.
     */
    async registerDeviceToken(userId: number, deviceToken: string): Promise<void> {
        return this.pushNotificationService.registerDeviceToken(userId, deviceToken);
    }

    /**
     * Desregistra un token de dispositivo para push notifications.
     */
    async unregisterDeviceToken(userId: number, deviceToken: string): Promise<void> {
        return this.pushNotificationService.unregisterDeviceToken(userId, deviceToken);
    }

    /**
     * Obtiene las preferencias de notificación del usuario.
     * Si no existen, crea unas por defecto.
     */
    private async getUserNotificationPreferences(userId: number): Promise<NotificationPreference> {
        let preferences = await this.notificationPreferenceRepository.findOne({
            where: { userId }
        });

        // Si no existen preferencias, crear las predeterminadas
        if (!preferences) {
            preferences = this.notificationPreferenceRepository.create({
                userId,
                sseEnabled: true,  // SSE habilitado por defecto
                pushEnabled: false // Push deshabilitado por defecto
            });

            preferences = await this.notificationPreferenceRepository.save(preferences);
            this.logger.log(`Created default notification preferences for user ${userId}`);
        }

        return preferences;
    }

    /**
     * Envía notificación push usando una entidad ya persistida.
     */
    private async sendPushNotificationEntity(notification: Notification): Promise<void> {
        try {
            await this.pushNotificationService.sendNotificationEntity(notification);
            this.logger.debug(`Push notification sent successfully to user ${notification.user.id}`);
        } catch (error) {
            this.logger.warn(`Push notification failed for user ${notification.user.id}:`, error);
            throw error;
        }
    }

    /**
     * Envía notificación SSE usando una entidad ya persistida.
     */
    private async sendSseNotificationEntity(notification: Notification): Promise<void> {
        try {
            await this.sseNotificationService.sendNotificationEntity(notification);
            this.logger.debug(`SSE notification sent successfully to user ${notification.user.id}`);
        } catch (error) {
            this.logger.warn(`SSE notification failed for user ${notification.user.id}:`, error);
            throw error;
        }
    }

    /**
     * Registra los resultados de las notificaciones enviadas.
     */
    private logNotificationResults(
        userId: number,
        results: PromiseSettledResult<void>[],
        preferences: NotificationPreference
    ): void {
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        const failureCount = results.filter(result => result.status === 'rejected').length;

        this.logger.log(
            `Notification summary for user ${userId}: ${successCount} successful, ${failureCount} failed. ` +
            `Preferences: SSE=${preferences.sseEnabled}, Push=${preferences.pushEnabled}`
        );

        // Loguear errores específicos
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const serviceType = index === 0 && preferences.pushEnabled ? 'Push' : 'SSE';
                this.logger.error(`${serviceType} notification failed for user ${userId}:`, result.reason);
            }
        });
    }

    /**
     * Obtiene todas las notificaciones del usuario
     */
    async getUserNotifications(userId: number): Promise<Notification[]> {
        try {
            const notifications = await this.notificationRepository.find({
                where: { user: { id: userId } },
                relations: ['user', 'report'],
                order: { createdAt: 'DESC' }
            });

            this.logger.log(`Retrieved ${notifications.length} notifications for user ${userId}`);
            return notifications;
        } catch (error) {
            this.logger.error(`Failed to get notifications for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Marca una notificación como leída
     */
    async markNotificationAsRead(userId: number, notificationId: number): Promise<void> {
        try {
            const result = await this.notificationRepository.update(
                { id: notificationId, user: { id: userId } },
                { read: true }
            );

            if (result.affected === 0) {
                throw new Error(`Notification ${notificationId} not found for user ${userId}`);
            }

            this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to mark notification ${notificationId} as read for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Alias para getUserNotifications - mantiene compatibilidad con el controlador
     */
    async getNotifications(userId: number): Promise<Notification[]> {
        return this.getUserNotifications(userId);
    }

    /**
     * Alias para markNotificationAsRead - mantiene compatibilidad con el controlador
     */
    async markAsRead(userId: number, notificationId: number): Promise<void> {
        return this.markNotificationAsRead(userId, notificationId);
    }
}
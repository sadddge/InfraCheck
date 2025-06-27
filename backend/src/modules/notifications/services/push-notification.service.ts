import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as admin from "firebase-admin";
import { DeviceToken } from "src/database/entities/device-token.entity";
import { Notification } from "src/database/entities/notification.entity";
import { Repository } from "typeorm";
import { IPushNotificationService } from "../interfaces/notification-service.interface";

interface PushMessage {
    title: string;
    body: string;
    data: {
        reportId: string;
        fromState: string;
        toState: string;
        type: string;
    };
}

@Injectable()
export class PushNotificationService implements IPushNotificationService {
    private readonly logger = new Logger(PushNotificationService.name);

    constructor(
        @InjectRepository(DeviceToken)
        private readonly deviceTokenRepository: Repository<DeviceToken>,
        @Inject('FIREBASE_ADMIN')
        private readonly firebaseProvider: admin.app.App,
    ) { }

    async sendNotificationEntity(notification: Notification): Promise<void> {
        try {
            // Obtener tokens de dispositivos del usuario
            const deviceTokens = await this.deviceTokenRepository.find({
                where: { user: { id: notification.user.id } },
                relations: ['user']
            });

            if (deviceTokens.length === 0) {
                this.logger.warn(`No device tokens found for user ${notification.user.id}`);
                return;
            }

            // Preparar el mensaje push basado en la notificación persistida
            const pushMessage: PushMessage = {
                title: `Cambio de estado en reporte #${notification.report.title}`,
                body: `El reporte cambió de ${notification.from} a ${notification.to}`,
                data: {
                    reportId: notification.report.id.toString(),
                    fromState: notification.from.toString(),
                    toState: notification.to.toString(),
                    type: 'report_state_change'
                }
            };

            // Enviar notificaciones push a todos los dispositivos del usuario
            const pushPromises = deviceTokens.map(deviceToken =>
                this.sendPushToDevice(deviceToken.token, pushMessage)
            );

            await Promise.allSettled(pushPromises);

            this.logger.log(`Push notification sent to ${deviceTokens.length} devices for user ${notification.user.id}`);
        } catch (error) {
            this.logger.error(`Failed to send push notification to user ${notification.user.id}:`, error);
            throw error;
        }
    }

    async registerDeviceToken(userId: number, deviceToken: string): Promise<void> {
        try {
            // Validar el token antes de registrarlo
            this.logger.log(`Registering device token for user ${userId}`);
            this.logger.log(`Token preview: ${deviceToken.substring(0, 10)}...${deviceToken.substring(deviceToken.length - 10)}`);
            this.logger.log(`Token length: ${deviceToken.length}`);

            if (!deviceToken || deviceToken.trim() === '') {
                throw new Error('Device token is empty or null');
            }

            if (deviceToken.length < 100) {
                this.logger.warn(`Device token seems too short: ${deviceToken.length} characters`);
            }

            // Verificar si el token ya existe para este usuario
            const existingToken = await this.deviceTokenRepository.findOne({
                where: {
                    token: deviceToken,
                    user: { id: userId }
                }
            });

            if (existingToken) {
                this.logger.log(`Device token already registered for user ${userId}`);
                return;
            }

            // Crear nuevo token de dispositivo
            const newDeviceToken = this.deviceTokenRepository.create({
                token: deviceToken,
                user: { id: userId }
            });

            await this.deviceTokenRepository.save(newDeviceToken);

            this.logger.log(`Device token registered successfully for user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to register device token for user ${userId}:`, error);
            throw error;
        }
    }

    async unregisterDeviceToken(userId: number, deviceToken: string): Promise<void> {
        try {
            const result = await this.deviceTokenRepository.delete({
                token: deviceToken,
                user: { id: userId }
            });

            if (result.affected && result.affected > 0) {
                this.logger.log(`Device token unregistered for user ${userId}`);
            } else {
                this.logger.warn(`Device token not found for user ${userId}`);
            }
        } catch (error) {
            this.logger.error(`Failed to unregister device token for user ${userId}:`, error);
            throw error;
        }
    }

    private async sendPushToDevice(deviceToken: string, message: PushMessage): Promise<void> {
        try {
            // Validar token antes de enviar
            this.logger.log(`Attempting to send push to device token: ${deviceToken.substring(0, 10)}...${deviceToken.substring(deviceToken.length - 10)}`);
            this.logger.log(`Token length: ${deviceToken.length}`);

            if (!deviceToken || deviceToken.trim() === '') {
                throw new Error('Device token is empty or null');
            }

            const msg: admin.messaging.Message = {
                token: deviceToken,
                notification: {
                    title: message.title,
                    body: message.body,
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'infracheck_reports',
                        sound: 'default',
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        }
                    }
                },
                data: message.data,
            };

            const response = await this.firebaseProvider.messaging().send(msg);
            this.logger.log(`Push sent successfully to device ${deviceToken.substring(0, 10)}...: ${response}`);
        } catch (error) {
            this.logger.error(`Failed to send push to device ${deviceToken.substring(0, 10)}...:`, error);
            // Si el token es inválido, eliminarlo de la base de datos
            if (this.isInvalidTokenError(error)) {
                this.logger.warn(`Removing invalid token: ${deviceToken.substring(0, 10)}...`);
                await this.removeInvalidToken(deviceToken);
            }

            throw error;
        }
    }

    private isInvalidTokenError(error: unknown): boolean {
        // Lógica para detectar si el error es por un token inválido
        // Esto depende del proveedor de push notifications que uses
        const errorWithCode = error as { code?: string };
        return errorWithCode?.code === 'messaging/invalid-registration-token' ||
            errorWithCode?.code === 'messaging/registration-token-not-registered';
    }

    private async removeInvalidToken(deviceToken: string): Promise<void> {
        try {
            await this.deviceTokenRepository.delete({ token: deviceToken });
            this.logger.log(`Removed invalid device token: ${deviceToken.substring(0, 10)}...`);
        } catch (error) {
            this.logger.error('Failed to remove invalid token:', error);
        }
    }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { VerificationModule } from '../verification/verification.module';
import { AuthController } from './controllers/auth.controller';
import { AUTH_SERVICE } from './interfaces/auth-service.interface';
import { PASSWORD_RECOVERY_SERVICE } from './interfaces/password-recovery-service.interface';
import { USER_REGISTRATION_SERVICE } from './interfaces/user-registration-service..interface';
import { AuthService } from './services/auth.service';
import { PasswordRecoveryService } from './services/password-recovery.service';
import { TokenFactoryService } from './services/token-factory.service';
import { UserRegistrationService } from './services/user-registration.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtResetStrategy } from './strategies/jwt-reset.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Authentication module providing complete authentication functionality for the application.
 * Configures JWT-based authentication with multiple token types and SMS verification integration.
 *
 * @class AuthModule
 * @description Comprehensive authentication module that provides:
 * - JWT access token authentication
 * - Refresh token management
 * - Password reset token handling
 * - SMS verification integration
 * - User registration and login
 * - Password recovery workflows
 *
 * @example
 * ```typescript
 * // Module is automatically imported in AppModule
 * // Provides authentication endpoints at /api/v1/auth/*
 * // Configures JWT strategies for different token types
 *
 * // Available endpoints:
 * // POST /api/v1/auth/login
 * // POST /api/v1/auth/register
 * // POST /api/v1/auth/refresh
 * // POST /api/v1/auth/recover-password
 * // POST /api/v1/auth/reset-password
 * ```
 *
 * @since 1.0.0
 */
@Module({
    imports: [
        UsersModule,
        ConfigModule,
        PassportModule,
        VerificationModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: cfg.getOrThrow<string>('JWT_EXPIRATION'),
                },
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([RefreshToken]),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: AUTH_SERVICE,
            useClass: AuthService,
        },
        {
            provide: USER_REGISTRATION_SERVICE,
            useClass: UserRegistrationService,
        },
        {
            provide: PASSWORD_RECOVERY_SERVICE,
            useClass: PasswordRecoveryService,
        },
        TokenFactoryService,
        JwtStrategy,
        JwtRefreshStrategy,
        JwtResetStrategy,
    ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AUTH_SERVICE } from './interfaces/auth-service.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { VerificationService } from './verification/verification.service';
import { VERIFICATION_SERVICE } from './interfaces/verification-service.interface';

@Module({
    imports: [
        UsersModule,
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (cfg: ConfigService) => ({
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
            provide: VERIFICATION_SERVICE,
            useClass: VerificationService,
        },
        JwtStrategy,
        JwtRefreshStrategy,
        VerificationService,
    ],
})
export class AuthModule {}

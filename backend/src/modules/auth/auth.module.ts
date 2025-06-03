import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/database/entities/refresh-token.entity';
import { AUTH_SERVICE } from '../../common/interfaces/auth-service.interface';
import { UsersModule } from '../users/users.module';
import { VerificationModule } from '../verification/verification.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtResetStrategy } from './strategies/jwt-reset.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

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
        JwtStrategy,
        JwtRefreshStrategy,
        JwtResetStrategy,
    ],
})
export class AuthModule {}

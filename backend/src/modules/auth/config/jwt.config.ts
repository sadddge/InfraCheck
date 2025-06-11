import { ConfigService } from '@nestjs/config';

export interface JwtConfig {
    secret: string;
    refreshSecret: string;
    resetSecret: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
    resetTokenExpiration: string;
}

export const jwtConfig = (configService: ConfigService): JwtConfig => ({
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    refreshSecret: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    resetSecret: configService.getOrThrow<string>('JWT_RESET_SECRET'),
    accessTokenExpiration: configService.get<string>('JWT_EXPIRATION', '15m'),
    refreshTokenExpiration: configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    resetTokenExpiration: configService.get<string>('JWT_RESET_EXPIRATION', '15m'),
});

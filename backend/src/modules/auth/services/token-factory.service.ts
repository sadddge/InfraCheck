import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/database/entities/user.entity';
import { JwtConfig, jwtConfig } from '../config/jwt.config';

@Injectable()
export class TokenFactoryService {
    private readonly jwtConfig: JwtConfig;
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.jwtConfig = jwtConfig(this.configService);
    }

    async generateTokenPair(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user),
        ]);

        return { accessToken, refreshToken };
    }

    private async generateAccessToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
            {
                sub: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
            {
                expiresIn: this.jwtConfig.accessTokenExpiration,
                secret: this.jwtConfig.secret,
            },
        );
    }

    private async generateRefreshToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
            { sub: user.id },
            {
                expiresIn: this.jwtConfig.refreshTokenExpiration,
                secret: this.jwtConfig.refreshSecret,
            },
        );
    }
}

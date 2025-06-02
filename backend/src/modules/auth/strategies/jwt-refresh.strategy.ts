import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AUTH_SERVICE, type IAuthService } from '../interfaces/auth-service.interface';
import type { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private readonly config: ConfigService,
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }
    async validate(req: Request, payload: { sub: number; [key: string]: unknown }) {
        const refreshToken: string = req.body.refreshToken;
        const userId: number = payload.sub;
        const user = await this.authService.getUserIfRefreshTokenMatches(refreshToken, userId);
        if (!user) throw new UnauthorizedException();
        return user;
    }
}

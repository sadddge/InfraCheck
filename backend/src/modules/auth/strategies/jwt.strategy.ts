import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

interface JwtPayload {
    sub: string;
    phoneNumber: string;
    role: string;
    [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(cfg: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
        });
    }

    validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            phoneNumber: payload.phoneNumber,
            role: payload.role,
        };
    }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

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

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthService } from '../interfaces/auth-service.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const refreshToken = req.body.refreshToken;
    const user = await this.authService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.sub,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
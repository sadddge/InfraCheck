import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/common/enums/user-status.enums';
import { UsersService } from 'src/modules/users/users.service';
import { JwtResetPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('token'),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_RESET_SECRET'),
        });
    }

    async validate(payload: JwtResetPayload) {
        if (payload.scope !== 'reset_password') {
            throw new UnauthorizedException('Invalid token scope');
        }
        const id = Number(payload.sub);
        const user = await this.usersService.findOne(id);
        if (
            !user ||
            (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_APPROVAL)
        ) {
            throw new UnauthorizedException('User not found or inactive');
        }

        const pwdChangedAt = user.passwordUpdatedAt?.getTime() ?? 0;
        if (pwdChangedAt >= payload.iat * 1000) {
            throw new UnauthorizedException('Password has already been changed');
        }

        return {
            user: {
                id: user.id,
            },
        };
    }
}

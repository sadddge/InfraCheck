import { AuthGuard } from '@nestjs/passport';

export class JwtResetGuard extends AuthGuard('jwt-reset') {}
